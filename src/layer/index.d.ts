import { ExternalService } from "../service";
import * as helpers from "../helpers";
import { Command } from "../command";

type LayerInitOption = {
  name?: string;
  container: HTMLElement;
  transformation?: { [scaleName: string]: helpers.Transformation };
  services?: (ExternalService | { service: ExternalService; options: any })[];
  sharedVar?: { [varName: string]: any };
  preInitialize?: <T>(layer: Layer<T>) => void;
  postInitialize?: <T>(layer: Layer<T>) => void;
  preUpdate?: <T>(layer: Layer<T>) => void;
  postUpdate?: <T>(layer: Layer<T>) => void;
  [param: string]: any;
};

type LayerInitTemplate = LayerInitOption & { constructor?: LayerConstructor };

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
  query(options: helpers.ArbitraryQuery);
  use(service: ExternalService, options?: any);
  isInstanceOf(name: string): boolean;
}

export default interface LayerConstructor {
  new <T>(baseName: string, options: LayerInitOption): Layer<T>;

  register(baseName: string, options: LayerInitTemplate): void;
  initialize(baseName: "D3Layer", options: LayerInitOption): Layer<SVGElement>;
  initialize<T>(baseName: string, options: LayerInitOption): Layer<T>;
  findLayer(baseNameOrRealName: string): Layer<any>[];
}
