import helpers from "../helpers";

type LayerInitTemplate = LayerInitOption & { constructor: LayerConstructor };

type LayerInitOption = {};

export default interface LayerConstructor {
  new (baseName: string, options: LayerInitOption): Layer;

  register(baseName: string, options: LayerInitTemplate): void;
  initialize(baseName: "D3Layer", options: LayerInitOption): Layer<SVGElement>;
  initialize<T>(baseName: string, options: LayerInitOption): Layer<T>;
  findLayer(name: string): Layer<any>[];
}

class Layer<T> {
  constructor(baseName: string, options: LayerInitOption): Layer;
  getGraphic(): T;
  getContainerGraphic(): HTMLElement;
  getVisualElements(): T[];
  getTransformation(scaleName: string): helpers.Transformation;
  setTransformation(
    scaleName: string,
    transformation: helpers.Transformation
  ): void;
  redraw(data: any, scale: helpers.Transformation, selection: T[]): void;
  query(options: helpers.ArbitraryQuery);
}
