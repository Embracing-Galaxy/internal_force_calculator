use calculator_core::{principal_stresses, PrincipalStressResult, StressTensor};

const EPSILON: f64 = 1e-9;

/// Helper: dot product of two 3D vectors.
fn dot(a: &[f64; 3], b: &[f64; 3]) -> f64 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/// Helper: Euclidean norm of a 3D vector.
fn norm(v: &[f64; 3]) -> f64 {
    (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt()
}

/// Helper: verify eigenvectors are orthonormal.
fn assert_orthonormal(result: &PrincipalStressResult) {
    // Unit length
    assert!(
        (norm(&result.direction_1) - 1.0).abs() < EPSILON,
        "direction_1 is not unit length: {}",
        norm(&result.direction_1)
    );
    assert!(
        (norm(&result.direction_2) - 1.0).abs() < EPSILON,
        "direction_2 is not unit length: {}",
        norm(&result.direction_2)
    );
    assert!(
        (norm(&result.direction_3) - 1.0).abs() < EPSILON,
        "direction_3 is not unit length: {}",
        norm(&result.direction_3)
    );

    // Orthogonality
    assert!(
        dot(&result.direction_1, &result.direction_2).abs() < EPSILON,
        "direction_1 · direction_2 = {} (should be ~0)",
        dot(&result.direction_1, &result.direction_2)
    );
    assert!(
        dot(&result.direction_2, &result.direction_3).abs() < EPSILON,
        "direction_2 · direction_3 = {} (should be ~0)",
        dot(&result.direction_2, &result.direction_3)
    );
    assert!(
        dot(&result.direction_3, &result.direction_1).abs() < EPSILON,
        "direction_3 · direction_1 = {} (should be ~0)",
        dot(&result.direction_3, &result.direction_1)
    );
}

/// Helper: verify the eigenvalue equation σ·vᵢ = σᵢ·vᵢ.
fn assert_eigenvalue_equation(tensor: &StressTensor, result: &PrincipalStressResult) {
    let [sxx, syy, szz, sxy, sxz, syz] = *tensor;
    let eigenvalues = [result.sigma_1, result.sigma_2, result.sigma_3];
    let directions = [result.direction_1, result.direction_2, result.direction_3];

    for (i, (&sigma, dir)) in eigenvalues.iter().zip(directions.iter()).enumerate() {
        // Compute σ·v using the 6 independent components
        let sv = [
            sxx * dir[0] + sxy * dir[1] + sxz * dir[2],
            sxy * dir[0] + syy * dir[1] + syz * dir[2],
            sxz * dir[0] + syz * dir[1] + szz * dir[2],
        ];

        // Compute σᵢ·vᵢ
        let lambda_v = [sigma * dir[0], sigma * dir[1], sigma * dir[2]];

        for j in 0..3 {
            assert!(
                (sv[j] - lambda_v[j]).abs() < 1e-6,
                "Eigenvalue equation failed for eigenvalue {} at component {}: |{} - {}| = {}",
                i,
                j,
                sv[j],
                lambda_v[j],
                (sv[j] - lambda_v[j]).abs()
            );
        }
    }
}

// ============================================================
// Test 1: Hydrostatic stress (σxx = σyy = σzz = p, all shear = 0)
// ============================================================
#[test]
fn test_hydrostatic_stress() {
    let p = 100.0;
    let tensor: StressTensor = [p, p, p, 0.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        (result.sigma_1 - p).abs() < EPSILON,
        "sigma_1 = {}, expected {}",
        result.sigma_1,
        p
    );
    assert!(
        (result.sigma_2 - p).abs() < EPSILON,
        "sigma_2 = {}, expected {}",
        result.sigma_2,
        p
    );
    assert!(
        (result.sigma_3 - p).abs() < EPSILON,
        "sigma_3 = {}, expected {}",
        result.sigma_3,
        p
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 2: Uniaxial tension (σxx = 100, everything else = 0)
// ============================================================
#[test]
fn test_uniaxial_tension() {
    let tensor: StressTensor = [100.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        (result.sigma_1 - 100.0).abs() < EPSILON,
        "sigma_1 = {}, expected 100",
        result.sigma_1
    );
    assert!(
        result.sigma_2.abs() < EPSILON,
        "sigma_2 = {}, expected 0",
        result.sigma_2
    );
    assert!(
        result.sigma_3.abs() < EPSILON,
        "sigma_3 = {}, expected 0",
        result.sigma_3
    );

    // direction_1 should be along x-axis (or opposite)
    assert!(
        (result.direction_1[0].abs() - 1.0).abs() < EPSILON,
        "direction_1[0] = {}, expected ±1",
        result.direction_1[0]
    );
    assert!(
        result.direction_1[1].abs() < EPSILON,
        "direction_1[1] = {}, expected 0",
        result.direction_1[1]
    );
    assert!(
        result.direction_1[2].abs() < EPSILON,
        "direction_1[2] = {}, expected 0",
        result.direction_1[2]
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 3: Pure shear (σxy = 50, everything else = 0)
// ============================================================
#[test]
fn test_pure_shear() {
    let tensor: StressTensor = [0.0, 0.0, 0.0, 50.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        (result.sigma_1 - 50.0).abs() < EPSILON,
        "sigma_1 = {}, expected 50",
        result.sigma_1
    );
    assert!(
        result.sigma_2.abs() < EPSILON,
        "sigma_2 = {}, expected 0",
        result.sigma_2
    );
    assert!(
        (result.sigma_3 + 50.0).abs() < EPSILON,
        "sigma_3 = {}, expected -50",
        result.sigma_3
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 4: General 3D stress state
// ============================================================
#[test]
fn test_general_3d_stress() {
    let tensor: StressTensor = [120.0, 80.0, 40.0, 30.0, -10.0, 15.0];
    let result = principal_stresses(tensor).unwrap();

    // Verify trace invariant: σ₁ + σ₂ + σ₃ = tr(σ) = 120+80+40 = 240
    let trace = result.sigma_1 + result.sigma_2 + result.sigma_3;
    assert!(
        (trace - 240.0).abs() < 1e-6,
        "trace = {}, expected 240",
        trace
    );

    // Verify determinant invariant
    let [sxx, syy, szz, sxy, sxz, syz] = tensor;
    let expected_det = sxx * (syy * szz - syz * syz) - sxy * (sxy * szz - syz * sxz)
        + sxz * (sxy * syz - syy * sxz);
    let actual_det = result.sigma_1 * result.sigma_2 * result.sigma_3;
    assert!(
        (actual_det - expected_det).abs() < 1e-3,
        "det = {}, expected {}",
        actual_det,
        expected_det
    );

    // Verify ordering
    assert!(
        result.sigma_1 >= result.sigma_2,
        "sigma_1 ({}) < sigma_2 ({})",
        result.sigma_1,
        result.sigma_2
    );
    assert!(
        result.sigma_2 >= result.sigma_3,
        "sigma_2 ({}) < sigma_3 ({})",
        result.sigma_2,
        result.sigma_3
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 5: Compression (all negative principal stresses)
// ============================================================
#[test]
fn test_compression() {
    let tensor: StressTensor = [-100.0, -50.0, -30.0, 20.0, -10.0, 15.0];
    let result = principal_stresses(tensor).unwrap();

    // All principal stresses should be negative
    assert!(
        result.sigma_1 < 0.0,
        "sigma_1 = {}, expected negative",
        result.sigma_1
    );
    assert!(
        result.sigma_2 < 0.0,
        "sigma_2 = {}, expected negative",
        result.sigma_2
    );
    assert!(
        result.sigma_3 < 0.0,
        "sigma_3 = {}, expected negative",
        result.sigma_3
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 6: Zero stress tensor
// ============================================================
#[test]
fn test_zero_tensor() {
    let tensor: StressTensor = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        result.sigma_1.abs() < EPSILON,
        "sigma_1 = {}, expected 0",
        result.sigma_1
    );
    assert!(
        result.sigma_2.abs() < EPSILON,
        "sigma_2 = {}, expected 0",
        result.sigma_2
    );
    assert!(
        result.sigma_3.abs() < EPSILON,
        "sigma_3 = {}, expected 0",
        result.sigma_3
    );

    assert_orthonormal(&result);
}

// ============================================================
// Test 7: Round-trip verification (reconstruct tensor from principal values)
// ============================================================
#[test]
fn test_round_trip_verification() {
    let tensor: StressTensor = [120.0, 80.0, 40.0, 30.0, -10.0, 15.0];
    let result = principal_stresses(tensor).unwrap();

    // Reconstruct tensor: σ = Σ σᵢ · (vᵢ ⊗ vᵢ)
    let eigenvalues = [result.sigma_1, result.sigma_2, result.sigma_3];
    let directions = [result.direction_1, result.direction_2, result.direction_3];

    let mut reconstructed = [[0.0; 3]; 3];
    for (sigma, dir) in eigenvalues.iter().zip(directions.iter()) {
        for i in 0..3 {
            for j in 0..3 {
                reconstructed[i][j] += sigma * dir[i] * dir[j];
            }
        }
    }

    // Build expected 3×3 from 6-component input
    let [sxx, syy, szz, sxy, sxz, syz] = tensor;
    let expected = [[sxx, sxy, sxz], [sxy, syy, syz], [sxz, syz, szz]];

    // Verify reconstructed tensor matches original
    for i in 0..3 {
        for j in 0..3 {
            assert!(
                (reconstructed[i][j] - expected[i][j]).abs() < 1e-6,
                "Reconstructed[{}][{}] = {}, expected = {}",
                i,
                j,
                reconstructed[i][j],
                expected[i][j]
            );
        }
    }
}

// ============================================================
// Test 8: Biaxial stress (σxx = 100, σyy = 50, rest = 0)
// ============================================================
#[test]
fn test_biaxial_stress() {
    let tensor: StressTensor = [100.0, 50.0, 0.0, 0.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        (result.sigma_1 - 100.0).abs() < EPSILON,
        "sigma_1 = {}, expected 100",
        result.sigma_1
    );
    assert!(
        (result.sigma_2 - 50.0).abs() < EPSILON,
        "sigma_2 = {}, expected 50",
        result.sigma_2
    );
    assert!(
        result.sigma_3.abs() < EPSILON,
        "sigma_3 = {}, expected 0",
        result.sigma_3
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}

// ============================================================
// Test 9: Hydrostatic compression
// ============================================================
#[test]
fn test_hydrostatic_compression() {
    let p = -200.0;
    let tensor: StressTensor = [p, p, p, 0.0, 0.0, 0.0];
    let result = principal_stresses(tensor).unwrap();

    assert!(
        (result.sigma_1 - p).abs() < EPSILON,
        "sigma_1 = {}, expected {}",
        result.sigma_1,
        p
    );
    assert!(
        (result.sigma_2 - p).abs() < EPSILON,
        "sigma_2 = {}, expected {}",
        result.sigma_2,
        p
    );
    assert!(
        (result.sigma_3 - p).abs() < EPSILON,
        "sigma_3 = {}, expected {}",
        result.sigma_3,
        p
    );

    assert_orthonormal(&result);
    assert_eigenvalue_equation(&tensor, &result);
}
