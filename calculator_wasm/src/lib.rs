use calculator_core as core;
use core::types::{Load, SupportConfig};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

#[wasm_bindgen]
pub fn principal_moments_and_transform(
    equation: &str,
    ny: usize,
    nz: usize,
) -> Result<JsValue, JsError> {
    let result =
        core::principal_moments_and_transform(equation, ny, nz).map_err(|e| JsError::new(&e))?;
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn get_combined_loads(
    beam_length: f64,
    support_a: JsValue,
    support_b: JsValue,
    loads: JsValue,
) -> Result<JsValue, JsError> {
    let support_a: SupportConfig = serde_wasm_bindgen::from_value(support_a)?;
    let support_b: SupportConfig = serde_wasm_bindgen::from_value(support_b)?;
    let loads: Vec<Load> = serde_wasm_bindgen::from_value(loads)?;
    let result = core::get_combined_loads(beam_length, &support_a, &support_b, &loads)
        .map_err(|e| JsError::new(&e))?;
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn generate_shear_data(beam_length: f64, combined_loads: JsValue) -> Result<JsValue, JsError> {
    let combined_loads: Vec<Load> = serde_wasm_bindgen::from_value(combined_loads)?;
    let result = core::generate_shear_data(beam_length, &combined_loads);
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn generate_moment_data(
    beam_length: f64,
    combined_loads: JsValue,
    step: f64,
) -> Result<JsValue, JsError> {
    let combined_loads: Vec<Load> = serde_wasm_bindgen::from_value(combined_loads)?;
    let result = core::generate_moment_data(beam_length, &combined_loads, step);
    Ok(serde_wasm_bindgen::to_value(&result)?)
}
