/** Connected same-hue clusters (4-neighbor). G12 design-g12.md §13.5 */

import type { ColorCluster, RingGrid, Tile, TileHue } from "./types";

export function findColorClusters(
  grid: RingGrid,
  minSize: number
): ColorCluster[] {
  const size = grid.size;
  const visited = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const clusters: ColorCluster[] = [];

  const neighbors = (row: number, col: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    if (row > 0) out.push([row - 1, col]);
    if (row < size - 1) out.push([row + 1, col]);
    if (col > 0) out.push([row, col - 1]);
    if (col < size - 1) out.push([row, col + 1]);
    return out;
  };

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (visited[row]![col]) continue;
      const start = grid.tiles[row]![col]!;
      const hue: TileHue = start.hue;
      const stack: Array<[number, number]> = [[row, col]];
      const members: Tile[] = [];
      visited[row]![col] = true;

      while (stack.length > 0) {
        const [r, c] = stack.pop()!;
        members.push(grid.tiles[r]![c]!);
        for (const [nr, nc] of neighbors(r, c)) {
          if (visited[nr]![nc]) continue;
          if (grid.tiles[nr]![nc]!.hue !== hue) continue;
          visited[nr]![nc] = true;
          stack.push([nr, nc]);
        }
      }

      if (members.length >= minSize) {
        clusters.push({ hue, tiles: members, size: members.length });
      }
    }
  }

  return clusters;
}
