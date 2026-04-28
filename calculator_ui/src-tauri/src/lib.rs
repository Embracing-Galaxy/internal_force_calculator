use calculator_core as core;
use core::PrincipalMomentOutput;
use core::beam::{generate_moment_data, generate_shear_data};
use core::types::{DataPoint, Load, SupportConfig};

type Output = PrincipalMomentOutput;

#[tauri::command]
fn get_principal_moments(equation: &str, ny: usize, nz: usize) -> Result<Output, String> {
    core::principal_moments_and_transform(equation, ny, nz)
}

#[tauri::command]
fn get_combined_loads(
    beam_length: f64,
    support_a: SupportConfig,
    support_b: SupportConfig,
    loads: Vec<Load>,
) -> Result<Vec<Load>, String> {
    core::beam::get_combined_loads(beam_length, &support_a, &support_b, &loads)
}

#[tauri::command]
fn gen_shear_data(beam_length: f64, combined_loads: Vec<Load>) -> Vec<DataPoint> {
    generate_shear_data(beam_length, &combined_loads)
}

#[tauri::command]
fn gen_moment_data(beam_length: f64, combined_loads: Vec<Load>, step: f64) -> Vec<DataPoint> {
    generate_moment_data(beam_length, &combined_loads, step)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_principal_moments,
            get_combined_loads,
            gen_shear_data,
            gen_moment_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
