import JXG from "jsxgraph";
import { useCallback, useEffect, useRef } from "react";
import { JSXGRAPH_THEME } from "./jsxgraphTheme";

type InitBoardOptions = Exclude<
  Parameters<typeof JXG.JSXGraph.initBoard>[1],
  undefined
>;

/**
 * Shared JSXGraph board lifecycle hook.
 *
 * Provides a container ref for mounting, an `initBoard()` function that
 * cleans up any previous board and creates a fresh one, and automatic
 * board disposal on component unmount.
 *
 * @example
 * ```tsx
 * const { containerRef, initBoard } = useJsxGraphBoard();
 * useEffect(() => {
 *   const board = initBoard({ keepAspectRatio: true });
 *   if (!board) return;
 *   // … draw on board.update();
 * }, [initBoard]);
 *
 * return <div ref={containerRef} />;
 * ```
 */
export function useJsxGraphBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<JXG.Board | null>(null);

  const initBoard = useCallback((boardOptions?: Partial<InitBoardOptions>) => {
    if (!containerRef.current) return null;

    // Free previous board before creating a new one
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      ...JSXGRAPH_THEME.defaultBoardOptions,
      ...boardOptions,
    });

    boardRef.current = board;
    return board;
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, []);

  return { containerRef, boardRef, initBoard };
}
