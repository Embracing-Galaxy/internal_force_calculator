use crate::types::*;

fn compute_reactions(
    beam_length: f64,
    support_a: &SupportConfig,
    support_b: &SupportConfig,
    loads: &[Load],
) -> Result<Vec<Load>, String> {
    let has_fixed_support = support_a.support_type == SupportType::Fixed
        || support_b.support_type == SupportType::Fixed;
    let has_two_support =
        support_a.support_type != SupportType::None && support_b.support_type != SupportType::None;
    if has_fixed_support && has_two_support {
        return Err("结构超静定，无法计算".to_string());
    }

    let mut total_force = 0.0;
    let mut total_moment = 0.0;

    for load in loads {
        match load {
            Load::PointLoad(pl) => {
                total_force += pl.magnitude;
                total_moment += pl.magnitude * pl.position;
            }
            Load::Moment(ml) => {
                total_moment += ml.magnitude;
            }
            Load::DistributedLoad(dl) => {
                let length = dl.end_position - dl.start_position;
                let force = dl.magnitude * length;
                total_force += force;
                let center_position = (dl.start_position + dl.end_position) / 2.0;
                total_moment += force * center_position;
            }
        }
    }

    if has_fixed_support {
        let is_support_a = support_a.support_type == SupportType::Fixed;
        let fixed_support = if is_support_a { support_a } else { support_b };
        let moment = if is_support_a {
            -total_moment
        } else {
            -(total_moment - total_force * beam_length)
        };

        return Ok(vec![
            Load::PointLoad(PointLoad {
                position: fixed_support.position,
                magnitude: -total_force,
            }),
            Load::Moment(MomentLoad {
                position: fixed_support.position,
                magnitude: moment,
            }),
        ]);
    }

    if !has_two_support {
        return Err("结构静不定，无法计算".to_string());
    }

    let fb = -(total_moment - total_force * support_a.position)
        / (support_b.position - support_a.position);
    let fa = -total_force - fb;

    Ok(vec![
        Load::PointLoad(PointLoad {
            position: support_a.position,
            magnitude: fa,
        }),
        Load::PointLoad(PointLoad {
            position: support_b.position,
            magnitude: fb,
        }),
    ])
}

pub fn get_combined_loads(
    beam_length: f64,
    support_a: &SupportConfig,
    support_b: &SupportConfig,
    loads: &[Load],
) -> Result<Vec<Load>, String> {
    let mut combined = loads.to_vec();
    combined.extend(compute_reactions(beam_length, support_a, support_b, loads)?);
    Ok(combined)
}

/// 计算 x 处的剪力 F(x)
/// 规定：向上外力对左侧截面产生正剪力
fn get_shear(x: f64, loads: &[Load]) -> f64 {
    let mut shear = 0.0;

    for load in loads {
        match load {
            Load::PointLoad(pl) => {
                if pl.position <= x {
                    shear += pl.magnitude;
                }
            }
            Load::DistributedLoad(dl) => {
                let start = dl.start_position;
                if x <= start {
                    continue;
                }
                let end = dl.end_position;
                let overlap = (x.min(end) - start).max(0.0);
                shear += dl.magnitude * overlap;
            }
            Load::Moment(_) => {}
        }
    }
    shear
}

/// 计算 x 处的弯矩 M(x)
/// 规定：使梁下侧受拉的弯矩为正
fn get_moment(x: f64, loads: &[Load]) -> f64 {
    let mut moment = 0.0;

    for load in loads {
        match load {
            Load::PointLoad(pl) => {
                if pl.position <= x {
                    moment += pl.magnitude * (x - pl.position);
                }
            }
            Load::DistributedLoad(dl) => {
                let start = dl.start_position;
                let end = dl.end_position;
                if x <= start || x >= end {
                    continue;
                }

                let a = start;
                let b = x.min(end);
                let term1 = (x - a).powi(2) / 2.0;
                let term2 = (x - b).powi(2) / 2.0;
                moment += dl.magnitude * (term1 - term2);
            }
            Load::Moment(ml) => {
                if ml.position <= x {
                    moment += ml.magnitude;
                }
            }
        }
    }
    moment
}

/// 收集关键位置（载荷位置、端点等）
fn collect_key_positions(beam_length: f64, loads: &[Load]) -> Vec<f64> {
    let mut key_positions = Vec::new();
    key_positions.push(0.0);

    for load in loads {
        match load {
            Load::PointLoad(pl) => {
                key_positions.push(pl.position);
            }
            Load::Moment(ml) => {
                key_positions.push(ml.position);
            }
            Load::DistributedLoad(dl) => {
                key_positions.push(dl.start_position);
                key_positions.push(dl.end_position);
            }
        }
    }

    key_positions.sort_by(|a, b| a.partial_cmp(b).unwrap());
    key_positions.push(beam_length);
    key_positions.dedup_by(|a, b| (*a - *b).abs() < 1e-9);
    key_positions
}

/// 生成剪力图数据点（含突变处理）
pub fn generate_shear_data(beam_length: f64, combined_loads: &[Load]) -> Vec<DataPoint> {
    let sorted_positions = collect_key_positions(beam_length, combined_loads);
    let mut shear_data = Vec::new();
    for pos in sorted_positions {
        let s_minus = get_shear(pos - 1e-9, combined_loads);
        let s_plus = get_shear(pos + 1e-9, combined_loads);

        shear_data.push(DataPoint::new(pos, s_minus));

        if (s_plus - s_minus).abs() > 1e-6 {
            shear_data.push(DataPoint::new(pos, s_plus));
        }
    }

    shear_data
}

/// 生成弯矩图数据点（含突变处理）
pub fn generate_moment_data(
    beam_length: f64,
    combined_loads: &[Load],
    step: f64,
) -> Vec<DataPoint> {
    let sorted_positions = collect_key_positions(beam_length, combined_loads);
    let mut moment_data = Vec::new();

    moment_data.push(DataPoint::new(0.0, get_moment(0.0, combined_loads)));
    for w in sorted_positions.windows(2) {
        let (left, right) = (w[0], w[1]);
        let mut x = left + step;
        while x < right - step / 2.0 {
            moment_data.push(DataPoint::new(x, get_moment(x, combined_loads)));
            x += step;
        }

        let m_right_minus = get_moment(right - 1e-9, combined_loads);
        let m_right_plus = get_moment(right + 1e-9, combined_loads);

        moment_data.push(DataPoint::new(right, m_right_minus));

        if (m_right_plus - m_right_minus).abs() > 1e-6 && right + 1e-9 < beam_length {
            moment_data.push(DataPoint::new(right, m_right_plus));
        }
    }

    let last_x = beam_length;
    let last_moment = get_moment(last_x, combined_loads);
    if let Some(last_point) = moment_data.last() {
        if (last_point.x - last_x).abs() > 1e-9 {
            moment_data.push(DataPoint::new(last_x, last_moment));
        }
    } else {
        moment_data.push(DataPoint::new(last_x, last_moment));
    }

    moment_data
}
