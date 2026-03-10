export type PrismAnimationType = "rotate" | "hover" | "3drotate";

export interface PrismProps {
  className?: string;
  debug?: boolean;
  lang?: "zh-CN" | "en";
  height?: number;
  baseWidth?: number;
  animationType?: PrismAnimationType;
  glow?: number;
  offsetX?: number;
  offsetY?: number;
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
}
