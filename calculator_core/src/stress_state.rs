use serde::{Deserialize, Serialize};

/// 6 independent components of a symmetric Cauchy stress tensor.
/// Layout: [σxx, σyy, σzz, σxy, σxz, σyz]
pub type StressTensor = [f64; 6];

/// Result of principal stress computation.
/// Eigenvalues are sorted: sigma_1 >= sigma_2 >= sigma_3.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PrincipalStressResult {
    pub sigma_1: f64,          // σ₁ (largest principal stress)
    pub sigma_2: f64,          // σ₂ (intermediate)
    pub sigma_3: f64,          // σ₃ (smallest)
    pub direction_1: [f64; 3], // unit eigenvector for σ₁
    pub direction_2: [f64; 3], // unit eigenvector for σ₂
    pub direction_3: [f64; 3], // unit eigenvector for σ₃
}

const EPSILON: f64 = 1e-12;

/// Compute principal stresses (eigenvalues) and principal directions (eigenvectors)
/// for a symmetric Cauchy stress tensor using Cardano's analytical method.
///
/// Input is the 6 independent components in order: [σxx, σyy, σzz, σxy, σxz, σyz].
pub fn principal_stresses(tensor: StressTensor) -> Result<PrincipalStressResult, String> {
    let [sxx, syy, szz, sxy, sxz, syz] = tensor;

    // Step 1: Compute stress invariants
    let i1 = sxx + syy + szz;
    let i2 = sxx * syy + sxx * szz + syy * szz - sxy * sxy - sxz * sxz - syz * syz;
    let i3 = determinant(sxx, syy, szz, sxy, sxz, syz);

    // Step 2: Depressed cubic coefficients
    let p = i2 - i1 * i1 / 3.0;
    let q = (2.0 * i1 * i1 * i1 - 9.0 * i1 * i2 + 27.0 * i3) / 27.0;

    // Step 3: Solve using trigonometric method
    let mut eigenvalues = if p.abs() < EPSILON {
        // p ≈ 0: all three eigenvalues are equal (or nearly equal)
        let lambda = i1 / 3.0;
        [lambda, lambda, lambda]
    } else {
        let r = q / (2.0 * (-p / 3.0).powi(3).sqrt());
        // Clamp to [-1, 1] to handle numerical errors
        let r_clamped = r.clamp(-1.0, 1.0);
        let theta = r_clamped.acos();
        let m = 2.0 * (-p / 3.0).sqrt();
        let base = i1 / 3.0;

        [
            base + m * (theta / 3.0).cos(),
            base + m * ((theta + 2.0 * std::f64::consts::PI) / 3.0).cos(),
            base + m * ((theta + 4.0 * std::f64::consts::PI) / 3.0).cos(),
        ]
    };

    // Step 4: Sort eigenvalues descending: σ₁ ≥ σ₂ ≥ σ₃
    eigenvalues.sort_by(|a, b| b.partial_cmp(a).unwrap_or(std::cmp::Ordering::Equal));

    let [sigma_1, sigma_2, sigma_3] = eigenvalues;

    // Step 5: Compute eigenvectors
    let direction_1 = compute_eigenvector(&tensor, sigma_1)?;
    let direction_2 = compute_eigenvector(&tensor, sigma_2)?;
    let direction_3 = compute_eigenvector(&tensor, sigma_3)?;

    // Step 6: Handle repeated eigenvalues — ensure orthogonality via Gram-Schmidt
    let (direction_1, direction_2, direction_3) = ensure_orthogonality(
        direction_1,
        direction_2,
        direction_3,
        sigma_1,
        sigma_2,
        sigma_3,
    );

    Ok(PrincipalStressResult {
        sigma_1,
        sigma_2,
        sigma_3,
        direction_1,
        direction_2,
        direction_3,
    })
}

/// Compute the determinant of a 3×3 symmetric matrix.
fn determinant(sxx: f64, syy: f64, szz: f64, sxy: f64, sxz: f64, syz: f64) -> f64 {
    sxx * (syy * szz - syz * syz) - sxy * (sxy * szz - syz * sxz) + sxz * (sxy * syz - syy * sxz)
}

/// Compute a unit eigenvector for the given eigenvalue λ.
/// Solves (σ - λI)·v = 0 by finding a non-zero vector in the nullspace.
fn compute_eigenvector(tensor: &StressTensor, lambda: f64) -> Result<[f64; 3], String> {
    let [sxx, syy, szz, sxy, sxz, syz] = *tensor;
    // Form B = σ - λI from the 6 independent components
    let b = [
        [sxx - lambda, sxy, sxz],
        [sxy, syy - lambda, syz],
        [sxz, syz, szz - lambda],
    ];

    // Try cross product of row 0 and row 1
    let v = cross_product(&b[0], &b[1]);
    let norm = vector_norm(&v);
    if norm > EPSILON {
        return Ok(normalize(&v));
    }

    // Try cross product of row 0 and row 2
    let v = cross_product(&b[0], &b[2]);
    let norm = vector_norm(&v);
    if norm > EPSILON {
        return Ok(normalize(&v));
    }

    // Try cross product of row 1 and row 2
    let v = cross_product(&b[1], &b[2]);
    let norm = vector_norm(&v);
    if norm > EPSILON {
        return Ok(normalize(&v));
    }

    // Triple eigenvalue case (or near): return canonical basis vector
    Ok([1.0, 0.0, 0.0])
}

/// Cross product of two 3D vectors.
fn cross_product(a: &[f64; 3], b: &[f64; 3]) -> [f64; 3] {
    [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]
}

/// Euclidean norm of a 3D vector.
fn vector_norm(v: &[f64; 3]) -> f64 {
    (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt()
}

/// Normalize a 3D vector to unit length.
fn normalize(v: &[f64; 3]) -> [f64; 3] {
    let n = vector_norm(v);
    if n < EPSILON {
        return [1.0, 0.0, 0.0];
    }
    [v[0] / n, v[1] / n, v[2] / n]
}

/// Dot product of two 3D vectors.
fn dot_product(a: &[f64; 3], b: &[f64; 3]) -> f64 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/// Ensure eigenvectors form an orthonormal set using Gram-Schmidt.
/// When eigenvalues are repeated, the corresponding eigenvectors span a subspace
/// and may not be orthogonal. This function orthogonalizes them.
fn ensure_orthogonality(
    v1: [f64; 3],
    mut v2: [f64; 3],
    mut v3: [f64; 3],
    sigma_1: f64,
    sigma_2: f64,
    sigma_3: f64,
) -> ([f64; 3], [f64; 3], [f64; 3]) {
    // Check if σ₁ ≈ σ₂ (repeated largest eigenvalue)
    if (sigma_1 - sigma_2).abs() < EPSILON {
        // Orthogonalize v2 against v1
        let proj = dot_product(&v2, &v1);
        v2 = [
            v2[0] - proj * v1[0],
            v2[1] - proj * v1[1],
            v2[2] - proj * v1[2],
        ];
        let n = vector_norm(&v2);
        if n > EPSILON {
            v2 = [v2[0] / n, v2[1] / n, v2[2] / n];
        } else {
            // v2 collapsed to zero — find a vector orthogonal to v1
            v2 = find_orthogonal(&v1);
        }
    }

    // Check if σ₂ ≈ σ₃ (repeated smallest eigenvalue)
    if (sigma_2 - sigma_3).abs() < EPSILON {
        // Orthogonalize v3 against v2
        let proj = dot_product(&v3, &v2);
        v3 = [
            v3[0] - proj * v2[0],
            v3[1] - proj * v2[1],
            v3[2] - proj * v2[2],
        ];
        let n = vector_norm(&v3);
        if n > EPSILON {
            v3 = [v3[0] / n, v3[1] / n, v3[2] / n];
        } else {
            // v3 collapsed to zero — use cross product for guaranteed orthogonality
            v3 = cross_product(&v1, &v2);
            let n = vector_norm(&v3);
            if n > EPSILON {
                v3 = [v3[0] / n, v3[1] / n, v3[2] / n];
            } else {
                v3 = find_orthogonal(&v1);
            }
        }
    }

    // Check if σ₁ ≈ σ₃ (all three equal)
    if (sigma_1 - sigma_3).abs() < EPSILON {
        // All three eigenvalues are equal — build full orthonormal basis from v1
        v2 = find_orthogonal(&v1);
        v3 = cross_product(&v1, &v2);
        let n = vector_norm(&v3);
        if n > EPSILON {
            v3 = [v3[0] / n, v3[1] / n, v3[2] / n];
        } else {
            v3 = find_orthogonal(&v2);
        }
    }

    // Final orthogonalization pass: ensure v3 is orthogonal to both v1 and v2
    // Use cross product to guarantee orthogonality and right-handedness
    let cross = cross_product(&v1, &v2);
    let cross_norm = vector_norm(&cross);
    if cross_norm > EPSILON {
        v3 = [
            cross[0] / cross_norm,
            cross[1] / cross_norm,
            cross[2] / cross_norm,
        ];
    }

    (v1, v2, v3)
}

/// Find a unit vector orthogonal to the given vector.
fn find_orthogonal(v: &[f64; 3]) -> [f64; 3] {
    // Pick the smallest component to avoid numerical issues
    let abs_v = [v[0].abs(), v[1].abs(), v[2].abs()];
    if abs_v[0] <= abs_v[1] && abs_v[0] <= abs_v[2] {
        // x is smallest: cross with [1, 0, 0]
        normalize(&cross_product(v, &[1.0, 0.0, 0.0]))
    } else if abs_v[1] <= abs_v[0] && abs_v[1] <= abs_v[2] {
        // y is smallest: cross with [0, 1, 0]
        normalize(&cross_product(v, &[0.0, 1.0, 0.0]))
    } else {
        // z is smallest: cross with [0, 0, 1]
        normalize(&cross_product(v, &[0.0, 0.0, 1.0]))
    }
}
