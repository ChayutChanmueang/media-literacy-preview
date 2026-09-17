/** Board seeding + clear/fall/refill. G12 design-g12.md §13.6–13.7 */

import {
  createRingGrid,
  createTile,
  randomHue,
  resetTileIdCounter,
} from "./board-state";
import { findColorClusters } from "./cluster-find";
import type { ColorCluster, RingGrid, Tile, TileHue } from "./types";

const MAX_SEED_ATTEMPTS = 80;

export function seedBoard(size: number, minSize: number): RingGrid {
  resetTileIdCounter();
  for (let attempt = 0; attempt < MAX_SEED_ATTEMPTS; attempt += 1) {
    let grid = createRingGrid(size, () => randomHue());
    for (let fix = 0; fix < size * size; fix += 1) {
      const clusters = findColorClusters(grid, minSize);
      if (clusters.length === 0) return grid;
      grid = recolorClusters(grid, clusters);
    }
  }
  return createRingGrid(size, (row, col) => {
    const hues: TileHue[] = ["coral", "mint", "sky", "sand"];
    return hues[(row * 2 + col) % hues.length]!;
  });
}

function recolorClusters(grid: RingGrid, clusters: readonly ColorCluster[]): RingGrid {
  const doomed = new Set(clusters.flatMap((c) => c.tiles.map((t) => t.id)));
  const tiles = grid.tiles.map((row) =>
    row.map((tile) => {
      if (!doomed.has(tile.id)) return tile;
      const nearby = new Set<TileHue>();
      const { row: r, col: c } = tile;
      for (const [dr, dc] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ] as const) {
        const n = grid.tiles[r + dr]?.[c + dc];
        if (n) nearby.add(n.hue);
      }
      return { ...tile, hue: randomHue(nearby) };
    })
  );
  return { size: grid.size, tiles };
}

/**
 * Remove cluster tiles, gravity down, refill from top.
 * Cascade until stable (or maxCascade).
 */
export function resolveAfterCommit(
  grid: RingGrid,
  initialClusters: readonly ColorCluster[],
  minSize: number,
  maxCascade = 8
): { grid: RingGrid; cleared: boolean; rounds: number } {
  if (initialClusters.length === 0) {
    return { grid, cleared: false, rounds: 0 };
  }

  let current = clearAndRefill(grid, initialClusters);
  let rounds = 1;

  for (let i = 0; i < maxCascade; i += 1) {
    const nextClusters = findColorClusters(current, minSize);
    if (nextClusters.length === 0) break;
    current = clearAndRefill(current, nextClusters);
    rounds += 1;
  }

  return { grid: current, cleared: true, rounds };
}

function clearAndRefill(
  grid: RingGrid,
  clusters: readonly ColorCluster[]
): RingGrid {
  const remove = new Set(clusters.flatMap((c) => c.tiles.map((t) => t.id)));
  const size = grid.size;
  const nextRows: Tile[][] = Array.from({ length: size }, () =>
    Array.from({ length: size })
  );

  for (let col = 0; col < size; col += 1) {
    const survivors: Tile[] = [];
    for (let row = 0; row < size; row += 1) {
      const tile = grid.tiles[row]![col]!;
      if (!remove.has(tile.id)) survivors.push(tile);
    }
    const gap = size - survivors.length;
    for (let row = 0; row < size; row += 1) {
      if (row < gap) {
        nextRows[row]![col] = createTile(row, col, randomHue());
      } else {
        const src = survivors[row - gap]!;
        nextRows[row]![col] = { ...src, row, col };
      }
    }
  }

  return { size, tiles: nextRows };
}
