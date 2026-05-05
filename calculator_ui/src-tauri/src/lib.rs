use calculator_core as core;
use core::{principal_stresses, PrincipalStressResult, StressTensor};
use core::types::{DataPoint, Load, PrincipalInertiaProps, SupportConfig};

type Output = PrincipalInertiaProps;

#[tauri::command]
fn principal_inertia(equation: &str, ny: usize, nz: usize) -> Result<Output, String> {
    core::principal_inertia(equation, ny, nz)
}

#[tauri::command]
fn get_combined_loads(
    beam_length: f64,
    support_a: SupportConfig,
    support_b: SupportConfig,
    loads: Vec<Load>,
) -> Result<Vec<Load>, String> {
    core::get_combined_loads(beam_length, &support_a, &support_b, &loads)
}

#[tauri::command]
fn gen_shear_data(beam_length: f64, combined_loads: Vec<Load>) -> Vec<DataPoint> {
    core::generate_shear_data(beam_length, &combined_loads)
}

#[tauri::command]
fn gen_moment_data(beam_length: f64, combined_loads: Vec<Load>, step: f64) -> Vec<DataPoint> {
    core::generate_moment_data(beam_length, &combined_loads, step)
}

#[tauri::command]
fn get_principal_stresses(tensor: StressTensor) -> Result<PrincipalStressResult, String> {
    principal_stresses(tensor)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            principal_inertia,
            get_combined_loads,
            gen_shear_data,
            gen_moment_data,
            get_principal_stresses
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
