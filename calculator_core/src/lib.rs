use meval::Expr;
use serde::{Deserialize, Serialize};

pub type Vector2f64 = (f64, f64);
pub type BoundingBox = (f64, f64, f64, f64);

#[derive(Serialize, Deserialize)]
pub struct PrincipalMomentOutput {
    area: f64,
    yc: f64,
    zc: f64,
    imin: f64,
    imax: f64,
    theta: f64,
}

/// 计算主轴主惯性矩，（最大惯性矩轴为 y' 轴）。
///
/// # 参数
/// * `equation` - 隐式方程，表示区域内部满足 `f(y, z) <= 0`。
///   例如 `"y^2/4 + z^2 - 1"` 表示椭圆内部。
///   支持基本运算符 `+, -, *, /, %, ^` 和函数 `sqrt, abs, exp, ln, sin, cos, tan,
///   asin, acos, atan, atan2, sinh, cosh, tanh, asinh, acosh, atanh,
///   floor, ceil, round signum` 等。
/// * `nx` - y 方向网格划分数（越大精度越高，推荐 200~500）。
/// * `ny` - z 方向网格划分数。
///
/// # 返回
/// `Ok((I_min, I_max, theta))`，其中 `I_min <= I_max`，
/// `theta` 是原坐标系旋转至主轴坐标系（最大惯性矩轴为 y' 轴）的角度。
///
/// # 错误
/// 当方程解析失败，或区域内无积分点（可能包围盒过小或方程符号错误）时返回 `Err`。
pub fn principal_moments_and_transform(
    equation: &str,
    ny: usize,
    nz: usize,
) -> Result<PrincipalMomentOutput, String> {
    let f = parse_expr(equation)?;
    let bounding_box = auto_bounding_box(&f, 0.01, 0.1);
    principal_moments_and_transform_inner(f, bounding_box, ny, nz)
}

/// 变量名必须为 `y` 和 `z`
fn parse_expr(equation: &str) -> Result<impl Fn(f64, f64) -> f64, String> {
    let expr: Expr = equation
        .parse()
        .map_err(|e| format!("表达式解析失败: {}", e))?;
    expr.bind2("y", "z")
        .map_err(|e| format!("表达式解析失败: {}", e))
}

fn principal_moments_and_transform_inner(
    f: impl Fn(f64, f64) -> f64,
    bounding_box: BoundingBox,
    ny: usize,
    nz: usize,
) -> Result<PrincipalMomentOutput, String> {
    // 网格积分
    let (ymin, ymax, zmin, zmax) = bounding_box;
    let dy = (ymax - ymin) / ny as f64;
    let dz = (zmax - zmin) / nz as f64;
    let d_area = dy * dz;

    let mut area = 0.0;
    let mut sum_y = 0.0; // ∫ y dA
    let mut sum_z = 0.0; // ∫ z dA
    let mut sum_yy = 0.0; // ∫ y² dA
    let mut sum_zz = 0.0; // ∫ z² dA
    let mut sum_yz = 0.0; // ∫ y z dA

    for i in 0..ny {
        let y = ymin + (i as f64 + 0.5) * dy;
        for j in 0..nz {
            let z = zmin + (j as f64 + 0.5) * dz;
            if f(y, z) <= 0.0 {
                area += d_area;
                sum_y += y * d_area;
                sum_z += z * d_area;
                sum_yy += y * y * d_area;
                sum_zz += z * z * d_area;
                sum_yz += y * z * d_area;
            }
        }
    }

    if area == 0.0 {
        return Err("区域内没有积分点，请检查包围盒是否包含图形，或方程不等号方向是否正确（应为 f(y,z) ≤ 0 表示内部）".into());
    }

    // 形心
    let yc = sum_y / area;
    let zc = sum_z / area;

    // 关于形心的惯性矩（平行轴定理）
    let iyy = sum_zz - area * zc * zc;
    let izz = sum_yy - area * yc * yc;
    let iyz = sum_yz - area * yc * zc;

    // 主惯性矩（解析解）
    let avg = (iyy + izz) / 2.0;
    let diff = (iyy - izz) / 2.0;
    let rad = (diff * diff + iyz * iyz).sqrt();
    let imax = avg + rad;
    let imin = avg - rad;

    // 主轴方向角（对应最大惯性矩的轴）
    // 避免除以零：当 iyy == izz 且 iyz == 0 时，任意方向都是主轴，取 0
    let theta = if iyz.abs() < 1e-12 && (iyy - izz).abs() < 1e-12 {
        0.0
    } else {
        0.5 * (2.0 * iyz).atan2(iyy - izz)
    };

    // 验证 theta 方向是否对应最大惯性矩
    let ct = theta.cos();
    let st = theta.sin();
    let i_theta = iyy * ct * ct + izz * st * st - 2.0 * iyz * st * ct;
    // 如果当前方向对应的是最小惯性矩，则旋转 90 度
    let theta = if (i_theta - imax).abs() < 1e-12 {
        theta
    } else {
        theta + std::f64::consts::FRAC_PI_2
    };

    Ok(PrincipalMomentOutput {
        area,
        yc,
        zc,
        imin,
        imax,
        theta,
    })
}

/// 自动确定隐式方程 f(y,z) ≤ 0 所围封闭区域的包围盒
/// - `f`: 方程闭包，内部为 ≤0
/// - `eps`: 边界精度（二分停止阈值）
/// - `padding`: 最终边界扩展量
fn auto_bounding_box<F>(f: &F, eps: f64, padding: f64) -> BoundingBox
where
    F: Fn(f64, f64) -> f64,
{
    // 寻找一个内部点
    let (y0, z0) = find_interior_point(f);

    // 沿四个方向精确确定边界
    let y_min = find_boundary(f, y0, z0, -1.0, 0.0, eps);
    let y_max = find_boundary(f, y0, z0, 1.0, 0.0, eps);
    let z_min = find_boundary(f, y0, z0, 0.0, -1.0, eps);
    let z_max = find_boundary(f, y0, z0, 0.0, 1.0, eps);

    // 加上 padding 并返回
    (
        y_min - padding,
        y_max + padding,
        z_min - padding,
        z_max + padding,
    )
}

/// 从原点开始扩张搜索，返回第一个 f(y,z) ≤ 0 的点
fn find_interior_point<F>(f: &F) -> (f64, f64)
where
    F: Fn(f64, f64) -> f64,
{
    if f(0.0, 0.0) <= 0.0 {
        return (0.0, 0.0);
    }

    let mut radius = 1.0;
    let max_radius = 1e6; // 安全上限

    while radius <= max_radius {
        // 检查当前半径圆上的8个方向（可改为螺旋更精细）
        for angle in 0..8 {
            let theta = angle as f64 * std::f64::consts::PI / 4.0;
            let y = radius * theta.cos();
            let z = radius * theta.sin();
            if f(y, z) <= 0.0 {
                return (y, z);
            }
        }
        radius *= 2.0; // 指数扩张，快速覆盖大范围
    }

    panic!("未找到内部点，请检查方程是否定义封闭区域");
}

/// 从 (y0,z0) 出发，沿方向 (dy,dz) 搜索边界 f(y,z)=0 的根
/// 方向向量应为单位向量 (dy,dz)
fn find_boundary<F>(f: &F, y0: f64, z0: f64, dy: f64, dz: f64, eps: f64) -> f64
where
    F: Fn(f64, f64) -> f64,
{
    // 大步长快速越界
    let mut t = 0.0;
    let step = 0.1; // 初始步长
    let max_steps = 1000;

    // 前进直到 f > 0
    for _ in 0..max_steps {
        let y = y0 + t * dy;
        let z = z0 + t * dz;
        if f(y, z) > 0.0 {
            break;
        }
        t += step;
    }

    // 二分搜索精确根
    let mut lo = t - step;
    let mut hi = t;
    while hi - lo > eps {
        let mid = (lo + hi) / 2.0;
        let y = y0 + mid * dy;
        let z = z0 + mid * dz;
        if f(y, z) <= 0.0 {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    // 返回边界坐标（选择方向对应的坐标）
    let t_bound = lo;
    if dy != 0.0 {
        y0 + t_bound * dy
    } else {
        z0 + t_bound * dz
    }
}
