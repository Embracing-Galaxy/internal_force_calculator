use calculator_core;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

#[wasm_bindgen]
pub fn principal_moments_and_transform(
    equation: &str,
    ny: usize,
    nz: usize,
) -> Result<JsValue, JsError> {
    let result = calculator_core::principal_moments_and_transform(equation, ny, nz)
        .map_err(|e| JsError::new(&e))?;
    Ok(serde_wasm_bindgen::to_value(&result)?)
}
