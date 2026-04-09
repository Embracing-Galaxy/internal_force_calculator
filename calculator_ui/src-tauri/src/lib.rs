use calculator_core::PrincipalMomentOutput;

type Output = PrincipalMomentOutput;

#[tauri::command]
fn get_principal_moments(
    equation: &str,
    ny: usize,
    nz: usize,
) -> Result<Output, String> {
    calculator_core::principal_moments_and_transform(equation, ny, nz)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_principal_moments])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
