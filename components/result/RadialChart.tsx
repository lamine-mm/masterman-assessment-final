/**
 * Pure SVG radial / axis visual.
 * Shows 4 axes as a spider/radar chart — Masterman palette.
 * Axis labels positioned at compass points.
 * No library dependency; works SSR with no hydration mismatch.
 */

import type { AxisKey } from "@/lib/types";
import { AXIS_LABELS, AXIS_POLE_A, AXIS_POLE_B } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RadialChartProps {
  axisScores: Record<AxisKey, number>; // 0.0–1.0
  /** Merged onto the outer wrapper (e.g. width constraints from the result layout). */
  className?: string;
  /** Extra classes on the `<svg>` (default includes responsive max width). */
  svgClassName?: string;
}

const AXES: AxisKey[] = ["A", "G", "S", "C"];
// Angles: top, right, bottom, left (clockwise from 12 o'clock)
const ANGLE_DEG: Record<AxisKey, number> = { A: 270, G: 0, S: 90, C: 180 };

/** Inner plot is 240×240 centered at (120, 120); padding so long labels (e.g. Brotherhood) are not clipped */
const INNER = 240;
const CX = INNER / 2;
const CY = INNER / 2;
const VIEW_PAD = 80; // room for “Brotherhood” etc. at 11px label size
const VIEW_SIZE = INNER + 2 * VIEW_PAD;

const MAX_R = 90; // outer ring radius
const RINGS = 4; // concentric reference rings
const LABEL_R = MAX_R + 22; // radius for axis labels

// Masterman gold + parchment — matches the website palette
const COLOR_FILL = "hsla(42, 56%, 54%, 0.22)";
const COLOR_STROKE = "hsl(42, 56%, 54%)";
const COLOR_RING = "hsla(33, 8%, 63%, 0.14)";
const COLOR_SPOKE = "hsla(33, 8%, 63%, 0.18)";
const COLOR_LABEL = "hsl(33, 8%, 63%)";
const COLOR_DOT = "hsl(42, 56%, 54%)";

function polarToCartesian(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function buildPolygon(scores: Record<AxisKey, number>): string {
  return AXES.map((axis) => {
    const r = scores[axis] * MAX_R;
    const { x, y } = polarToCartesian(ANGLE_DEG[axis], r);
    return `${x},${y}`;
  }).join(" ");
}

export function RadialChart({
  axisScores,
  className,
  svgClassName,
}: RadialChartProps) {
  const polygon = buildPolygon(axisScores);
  const vb = `-${VIEW_PAD} -${VIEW_PAD} ${VIEW_SIZE} ${VIEW_SIZE}`;

  return (
    <div
      className={cn("flex w-full justify-center overflow-visible", className)}
      aria-hidden="true"
    >
      <svg
        width={VIEW_SIZE}
        height={VIEW_SIZE}
        viewBox={vb}
        className={cn(
          "h-auto w-full max-w-[min(92vw,420px)] overflow-visible",
          svgClassName
        )}
        overflow="visible"
      >
        {/* Reference rings */}
        {Array.from({ length: RINGS }).map((_, i) => {
          const r = ((i + 1) / RINGS) * MAX_R;
          return (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke={COLOR_RING}
              strokeWidth={1}
            />
          );
        })}

        {/* Spokes */}
        {AXES.map((axis) => {
          const outer = polarToCartesian(ANGLE_DEG[axis], MAX_R);
          return (
            <line
              key={axis}
              x1={CX}
              y1={CY}
              x2={outer.x}
              y2={outer.y}
              stroke={COLOR_SPOKE}
              strokeWidth={1}
            />
          );
        })}

        {/* Filled score polygon */}
        <polygon
          points={polygon}
          fill={COLOR_FILL}
          stroke={COLOR_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {AXES.map((axis) => {
          const r = axisScores[axis] * MAX_R;
          const { x, y } = polarToCartesian(ANGLE_DEG[axis], r);
          return (
            <circle key={axis} cx={x} cy={y} r={4} fill={COLOR_DOT} />
          );
        })}

        {/* Axis labels */}
        {AXES.map((axis) => {
          const { x, y } = polarToCartesian(ANGLE_DEG[axis], LABEL_R);
          const score = axisScores[axis];
          const poleLetter = score > 0.5 ? AXIS_POLE_A[axis][0] : AXIS_POLE_B[axis][0];

          // Text-anchor based on quadrant
          let anchor: "middle" | "start" | "end" = "middle";
          if (ANGLE_DEG[axis] === 0) anchor = "start";
          if (ANGLE_DEG[axis] === 180) anchor = "end";

          return (
            <g key={axis}>
              <text
                x={x}
                y={y - 6}
                textAnchor={anchor}
                fontSize="11"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="600"
                letterSpacing="0.08em"
                fill={COLOR_LABEL}
              >
                {AXIS_LABELS[axis].toUpperCase()}
              </text>
              <text
                x={x}
                y={y + 10}
                textAnchor={anchor}
                fontSize="14"
                fontFamily="Fraunces, Georgia, serif"
                fontWeight="500"
                fill={COLOR_STROKE}
              >
                {poleLetter}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
