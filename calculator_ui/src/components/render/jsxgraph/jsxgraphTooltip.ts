import JXG from "jsxgraph";

/**
 * Threshold factor for tooltip proximity detection (relative to diagram span).
 * Used to determine how close the mouse must be to a data point/circle edge
 * before the tooltip appears.
 */
export const TOOLTIP_THRESHOLD_FACTOR = 0.03;

/** Default tooltip font size, matching JsxDiagram convention. */
export const TOOLTIP_FONT_SIZE = 14;

/** Default tooltip text color. */
export const TOOLTIP_TEXT_COLOR = "#334155";

/**
 * Creates a tooltip text element on a JSXGraph board,
 * initially placed off-screen (invisible).
 *
 * @param board - The JSXGraph board instance.
 * @param options - Optional overrides for fontSize and color.
 * @returns The created text element for the tooltip.
 */
export function createTooltip(
  board: JXG.Board,
  options?: Partial<{
    fontSize: number;
    color: string;
  }>,
) {
  return board.create("text", [1e10, 1e10, ""], {
    display: "html",
    fontSize: options?.fontSize ?? TOOLTIP_FONT_SIZE,
    color: options?.color ?? TOOLTIP_TEXT_COLOR,
    fixed: true,
    anchorX: "left",
    anchorY: "bottom",
  }) as JXG.Text;
}

/**
 * Shows the tooltip at the given user coordinates with the given text.
 *
 * @param tooltip - The tooltip text element.
 * @param userX - User-space X position.
 * @param userY - User-space Y position.
 * @param text - The HTML/text content to display.
 */
export function showTooltip(
  tooltip: JXG.Text,
  userX: number,
  userY: number,
  text: string,
) {
  tooltip.setPosition(JXG.COORDS_BY_USER, [userX, userY]);
  tooltip.setText(text);
}

/**
 * Hides the tooltip by moving it off-screen and clearing its text.
 *
 * @param tooltip - The tooltip text element.
 */
export function hideTooltip(tooltip: JXG.Text) {
  tooltip.setPosition(JXG.COORDS_BY_USER, [1e10, 1e10]);
  tooltip.setText("");
}
