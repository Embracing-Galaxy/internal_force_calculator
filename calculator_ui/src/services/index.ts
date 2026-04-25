import CalculatorService from "@calculator-service";
import type { ICalculatorService } from "./interface";

export const calculatorService: ICalculatorService = new CalculatorService();
export * from "./interface";
