import { memo } from "react";

/** Pixel cells of a 7x7 sparkle, mirroring the iOS Canvas drawing. */
const CELLS: readonly [number, number][] = [
  [3, 0],
  [3, 1],
  [2, 2],
  [3, 2],
  [4, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [2, 4],
  [3, 4],
  [4, 4],
  [3, 5],
  [3, 6],
];

interface PixelStarProps {
  color?: string;
  size: number;
  className?: string;
}

/** Chunky 8-bit sparkle used for the victory burst and empty states. */
export const PixelStar = memo(function PixelStar({
  color = "var(--pixel-gold)",
  size,
  className,
}: PixelStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
});
