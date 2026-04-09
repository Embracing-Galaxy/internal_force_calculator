import {z} from "zod";

export const PrincipalMomentsOutputSchema = z.object({
    area: z.number(),
    yc: z.number(),
    zc: z.number(),
    imin: z.number(),
    imax: z.number(),
    theta: z.number()
});
export type PrincipalMomentsOutput = z.infer<typeof PrincipalMomentsOutputSchema>;

export interface ICalculatorService {
    getPrincipalMoments(
        equation: string,
        ny: number,
        nz: number
    ): Promise<PrincipalMomentsOutput>;
}