export type Point = { x: number; y: number };
export type Event =
  | { type: "pointer"; x: number; y: number; rawX: number; rawY: number }
  | { type: "wheel"; delta: number }
  | { type: "keyboard" | "mouse"; keyCode: number }
  | { type: "state"; state: "start" | "running" | "outside" };
export type AvailableFreedomType = number;
export type ShapeDescriptor = { type: string; [attr: string]: any };
