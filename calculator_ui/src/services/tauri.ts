import {invoke} from "@tauri-apps/api/core";
import {ICalculatorService, PrincipalMomentsOutput, PrincipalMomentsOutputSchema} from "./interface.ts";

export default class TauriCalculatorService implements ICalculatorService {
    async getPrincipalMoments(equation: string, ny: number, nz: number): Promise<PrincipalMomentsOutput> {
        const result = await invoke('get_principal_moments', {
            equation, ny, nz
        });
        return PrincipalMomentsOutputSchema.parse(result);
    }
}