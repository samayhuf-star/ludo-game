import { START, Color } from './engine';
export const PATH: [number, number][] = [[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const HOME: [number, number][][] = [
  [[7,1],[7,2],[7,3],[7,4],[7,5]], [[1,7],[2,7],[3,7],[4,7],[5,7]], [[7,13],[7,12],[7,11],[7,10],[7,9]], [[13,7],[12,7],[11,7],[10,7],[9,7]]];
export const YARD_ORIGIN: [number, number][] = [[1, 1], [1, 10], [10, 10], [10, 1]];
const YARD_SLOT: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
/** grid [row, col] (may be fractional) for token i of colour c at progress p */
export function gridPos(c: Color, i: number, p: number): [number, number] {
  if (p === -1) return [YARD_ORIGIN[c][0] + YARD_SLOT[i][0], YARD_ORIGIN[c][1] + YARD_SLOT[i][1]];
  if (p <= 50) return PATH[(START[c] + p) % 52];
  if (p <= 55) return HOME[c][p - 51];
  return [7 + [-0.28, 0.28, 0.28, -0.28][i] * 0.9, 7 + [-0.28, -0.28, 0.28, 0.28][i] * 0.9];
}
export const HOME_CELLS = HOME;
