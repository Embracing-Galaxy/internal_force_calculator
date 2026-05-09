export type TensorChangeHandler = (
  row: number,
  col: number,
  value: string,
) => void;

export type DisplayMode = "original" | "principal";
