import type { ICalculatorService } from "./interface";
import CalculatorService from "@calculator-service";

export const isTauri = import.meta.env.TAURI_ENV_FAMILY !== undefined;

export const calculatorService: ICalculatorService = new CalculatorService();
export * from "./interface";
