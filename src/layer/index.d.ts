import { Service } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";

type LayerInitOption = {
  name?: string;
  container: HTMLElement;
  transformation?: { [scaleName: string]: helpers.Transformation };
  services?: (
    | string
    | Service
    | { service: string | Service; options: any }
  )[];
  sharedVar?: { [varName: string]: any };
  redraw?: <T>(
    data: any,
    scale: helpers.Transformation,
    selection: T[]
  ) => void;
  preInitialize?: <T>(layer: Layer<T>) => void;
  postInitialize?: <T>(layer: Layer<T>) => void;
  preUpdate?: <T>(layer: Layer<T>) => void;
  postUpdate?: <T>(layer: Layer<T>) => void;
  [param: string]: any;
};

type LayerInitTemplate = LayerInitOption & { [param: string]: any;
constructor?: LayerConstructor };

export declare class Layer<T> {
  constructor(baseName: string, options: LayerInitOption);
  getGraphic(): T;
  getContainerGraphic(): HTMLElement;
  getVisualElements(): T[];
  getSharedVar(sharedName: string, defaultValue?: any): any;
  setSharedVar(sharedName: string, value: any): void;
  watchSharedVar(sharedName: string, handler: Function | Command): void;
  getTransformation(
    scaleName: string,
    defaultValue?: helpers.Transformation
  ): helpers.Transformation;
  setTransformation(
    scaleName: string,
    transformation: helpers.Transformation
  ): void;
  watchTransformation(scaleName: string, handler: Function | Command): void;
  redraw(data: any, scale: helpers.Transformation, selection: T[]): void;
  preUpdate(): void;
  postUpdate(): void;
  picking(options: helpers.ArbitraryQuery): T[];
  use(service: string | Service, options?: any);
  isInstanceOf(name: string): boolean;
}

export default interface LayerConstructor {
  new <T>(baseName: string, options: LayerInitOption): Layer<T>;

  register(baseName: string, options: LayerInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: "D3Layer", options: LayerInitOption): Layer<SVGElement>;
  initialize<T>(baseName: string, options: LayerInitOption): Layer<T>;
  findLayer(baseNameOrRealName: string): Layer<any>[];
}

export function register(baseName: string, options: LayerInitTemplate): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: "D3Layer",
  options: LayerInitOption
): Layer<SVGElement>;
export function initialize<T>(
  baseName: string,
  options: LayerInitOption
): Layer<T>;
export function findLayer(baseNameOrRealName: string): Layer<any>[];
