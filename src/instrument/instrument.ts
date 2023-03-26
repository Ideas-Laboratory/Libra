import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";
import { Service, findService } from "../service";
import { GraphicalTransformer } from "../transformer";
import SelectionService from "../service/selectionService";

type InstrumentInitOption = {
  name?: string;
  on?: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void)
      | Command
    )[];
  };
  interactors?: (
    | string
    | Interactor
    | { interactor: string | Interactor; options: any }
  )[];
  services?: (string | Service | { service: string | Service; options: any })[];
  transformers?: GraphicalTransformer[];
  layers?: (Layer<any> | { layer: Layer<any>; options: any })[];
  sharedVar?: { [varName: string]: any };
  preInitialize?: (instrument: Instrument) => void;
  postInitialize?: (instrument: Instrument) => void;
  preAttach?: (instrument: Instrument, layer: Layer<any>) => void;
  postUse?: (instrument: Instrument, layer: Layer<any>) => void;
  [param: string]: any;
};

type InstrumentInitTemplate = InstrumentInitOption & {
  [param: string]: any;
  constructor?: typeof Instrument;
};

type InstrumentFlowOption = {
  comp: string;
  name?: string;
  sharedVar?: { [varName: string]: any };
  dimension?: string | string[];
  [params: string]: any;
};

type InstrumentBuildTemplate = {
  inherit: string;
  name?: string;
  layers?: (Layer<any> | { layer: Layer<any>; options: any })[];
  sharedVar?: { [varName: string]: any };
  remove?: { find: string; cascade?: boolean }[];
  override?: {
    find: string;
    comp: string;
    name?: string;
    sharedVar?: { [varName: string]: any };
    [params: string]: any;
  }[];
  insert?: {
    find?: string;
    flow: (
      | InstrumentFlowOption
      | InstrumentFlowOption[]
      | Service
      | GraphicalTransformer
      | Service[]
      | GraphicalTransformer[]
      | ((...args: any) => InstrumentFlowOption)
    )[];
  }[];
};

const registeredInstruments: { [name: string]: InstrumentInitTemplate } = {};
export const instanceInstruments: Instrument[] = [];
const EventDispatcher: Map<
  HTMLElement,
  Map<string, [Interactor, Layer<any>, any, Instrument][]>
> = new Map();
const EventQueue: {
  instrument: Instrument;
  eventType: string;
  layer: Layer<any>;
  event: Event;
}[] = [];
let eventHandling = false;

export default class Instrument {
  _baseName: string;
  _name: string;
  _userOptions: InstrumentInitOption;
  _on: {
    [action: string]: (
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void> | void)
      | Command
    )[];
  };
  _services: (string | Service | { service: string | Service; options: any })[];
  _serviceInstances: Service[];
  _interactors: (Interactor | { interactor: Interactor; options: any })[];
  _layers: (Layer<any> | { layer: Layer<any>; options: any })[];
  _layerInteractors: Map<Layer<any>, Interactor[]>;
  _sharedVar: { [varName: string]: any };
  _transformers: GraphicalTransformer[] = [];
  _linkCache: { [linkProp: string]: any } = {};
  _preInitialize?: (instrument: Instrument) => void;
  _postInitialize?: (instrument: Instrument) => void;
  _preAttach?: (instrument: Instrument, layer: Layer<any>) => void;
  _postUse?: (instrument: Instrument, layer: Layer<any>) => void;

  [helpers.LibraSymbol] = true;

  constructor(baseName: string, options: InstrumentInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preAttach = options.preAttach ?? null;
    this._postUse = options.postUse ?? null;
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    // this._on = helpers.deepClone(options.on ?? {});
    this._on = Object.assign({}, options.on ?? {});
    this._interactors = [];
    this._layers = [];
    this._layerInteractors = new Map();
    this._services = options.services ?? [];
    this._serviceInstances = [];
    this._sharedVar = options.sharedVar ?? {};
    this._transformers = options.transformers ?? [];
    if (options.interactors) {
      options.interactors.forEach((interactor) => {
        if (typeof interactor === "string") {
          this.useInteractor(Interactor.initialize(interactor));
        } else if ("options" in interactor) {
          if (typeof interactor.interactor === "string") {
            this.useInteractor(
              Interactor.initialize(interactor.interactor, interactor.options)
            );
          } else {
            this.useInteractor(interactor.interactor, interactor.options);
          }
        } else {
          this.useInteractor(interactor);
        }
      });
    }
    this._services.forEach((service) => {
      if (typeof service === "string" || !("options" in service)) {
        this.useService(service);
      } else {
        this.useService(service.service, service.options);
      }
    });
    if (options.layers) {
      options.layers.forEach((layer) => {
        if ("options" in layer) {
          this.attach(layer.layer, layer.options);
        } else {
          this.attach(layer);
        }
      });
    }
    options.postInitialize && options.postInitialize.call(this, this);
  }

  emit(action: string, options?: helpers.CommonHandlerInput<this>) {
    if (this._on[action]) {
      this._on[action].forEach((feedforwardOrCommand) => {
        if (feedforwardOrCommand instanceof Command) {
          feedforwardOrCommand.execute(
            Object.assign(
              {
                self: this,
                layer: null,
                instrument: this,
                interactor: null,
              },
              options || {}
            )
          );
        } else {
          feedforwardOrCommand(
            Object.assign(
              {
                self: this,
                layer: null,
                instrument: this,
                interactor: null,
              },
              options || {}
            )
          );
        }
      });
    }
  }

  on(
    action: string | string[],
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void>)
      | Command
  ) {
    if (action instanceof Array) {
      action.forEach((action) => {
        if (!this._on[action]) {
          this._on[action] = [];
        }
        this._on[action].push(feedforwardOrCommand);
      });
    } else {
      if (!this._on[action]) {
        this._on[action] = [];
      }
      this._on[action].push(feedforwardOrCommand);
    }
    return this;
  }

  off(
    action: string,
    feedforwardOrCommand:
      | (<T>(options: helpers.CommonHandlerInput<T>) => Promise<void>)
      | Command
  ) {
    if (!this._on[action]) return;
    if (this._on[action].includes(feedforwardOrCommand)) {
      this._on[action].splice(
        this._on[action].indexOf(feedforwardOrCommand),
        1
      );
    }
    return this;
  }

  _use(service: Service, options?: any) {
    service.preAttach(this);
    this._serviceInstances.push(service);
    service.postUse(this);
  }
  useService(service: string | Service, options?: any) {
    if (
      typeof service !== "string" &&
      this._serviceInstances.includes(service)
    ) {
      return;
    }
    if (arguments.length >= 2) {
      this._services.push({ service, options });
    } else {
      this._services.push(service);
    }
    if (typeof service === "string") {
      const services = findService(service);
      services.forEach((service) => this._use(service, options));
    } else {
      this._use(service, options);
    }
  }

  useInteractor(interactor: Interactor, options?: any) {
    interactor.preUse(this);
    // TODO: inject options
    if (arguments.length >= 2) {
      this._interactors.push({ interactor, options });
    } else {
      this._interactors.push(interactor);
    }

    this._layers.forEach((layer) => {
      let layr: Layer<any>;
      if (layer instanceof Layer) {
        layr = layer;
      } else {
        layr = layer.layer;
      }
      if (!this._layerInteractors.has(layr)) {
        this._layerInteractors.set(layr, []);
      }
      const copyInteractor = Interactor.initialize(
        interactor._baseName,
        interactor._userOptions
      );
      this._layerInteractors.get(layr).push(copyInteractor);
      copyInteractor.setActions(
        copyInteractor.getActions().map((action) => ({
          ...action,
          sideEffect: async (options) => {
            action.sideEffect && action.sideEffect(options);
            if (this._on[action.action]) {
              for (let command of this._on[action.action]) {
                try {
                  if (command instanceof Command) {
                    await command.execute({
                      ...options,
                      self: this,
                      instrument: this,
                    });
                  } else {
                    await command({
                      ...options,
                      self: this,
                      instrument: this,
                    });
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          },
        }))
      );
      copyInteractor.getAcceptEvents().forEach((event) => {
        if (!EventDispatcher.has(layr.getContainerGraphic())) {
          EventDispatcher.set(layr.getContainerGraphic(), new Map());
        }
        if (!EventDispatcher.get(layr.getContainerGraphic()).has(event)) {
          layr
            .getContainerGraphic()
            .addEventListener(event, this._dispatch.bind(this, layr, event));
          EventDispatcher.get(layr.getContainerGraphic()).set(event, []);
        }
        EventDispatcher.get(layr.getContainerGraphic())
          .get(event)
          .push([
            copyInteractor,
            layr,
            layer instanceof Layer ? null : layer.options,
            this,
          ]);
      });
    });
    interactor.postUse(this);
  }

  attach(layer: Layer<any>, options?: any) {
    if (
      this._layers.find((l) =>
        l instanceof Layer ? l === layer : l.layer === layer
      )
    )
      return; // Reject for duplicated attach
    this.preAttach(layer, options ?? null);
    if (arguments.length >= 2) {
      this._layers.push({ layer, options });
    } else {
      this._layers.push(layer);
    }
    this.postUse(layer);
  }

  getSharedVar(sharedName: string, options?: any): any {
    if (
      !(sharedName in this._sharedVar) &&
      options &&
      "defaultValue" in options
    ) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }

  setSharedVar(sharedName: string, value: any, options?: any) {
    this._sharedVar[sharedName] = value;
    if (this._on[`update:${sharedName}`]) {
      const feedforwardOrCommands = this._on[`update:${sharedName}`];
      feedforwardOrCommands.forEach((feedforwardOrCommand) => {
        if (feedforwardOrCommand instanceof Command) {
          feedforwardOrCommand.execute({
            self: this,
            layer: null,
            instrument: this,
            interactor: null,
          });
        } else {
          feedforwardOrCommand({
            self: this,
            layer: null,
            instrument: this,
            interactor: null,
          });
        }
      });
    }

    // const linkProps =
    //   this.getSharedVar("linkProps") || Object.keys(this._sharedVar);
    // if (this._sharedVar.linking) {
    //   for (let prop of linkProps) {
    //     if (this._linkCache[prop] === this._sharedVar[prop]) continue;
    //     this._sharedVar.linking.setSharedVar(prop, this._sharedVar[prop]);
    //   }
    // }
  }

  watchSharedVar(sharedName: string, handler: Command) {
    this.on(`update:${sharedName}`, handler);
  }

  preAttach(layer: Layer<any>, options: any) {
    this._preAttach && this._preAttach.call(this, this, layer);
    this._interactors.forEach((interactor) => {
      let inter: Interactor;
      if (interactor instanceof Interactor) {
        inter = interactor;
      } else {
        inter = interactor.interactor;
      }
      if (!this._layerInteractors.has(layer)) {
        this._layerInteractors.set(layer, []);
      }
      const copyInteractor = Interactor.initialize(
        inter._baseName,
        inter._userOptions
      );
      this._layerInteractors.get(layer).push(copyInteractor);
      copyInteractor.setActions(
        copyInteractor.getActions().map((action) => ({
          ...action,
          sideEffect: async (options) => {
            action.sideEffect && action.sideEffect(options);
            if (this._on[action.action]) {
              for (let command of this._on[action.action]) {
                try {
                  if (command instanceof Command) {
                    await command.execute({
                      ...options,
                      self: this,
                      instrument: this,
                    });
                  } else {
                    await command({
                      ...options,
                      self: this,
                      instrument: this,
                    });
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          },
        }))
      );
      copyInteractor.getAcceptEvents().forEach((event) => {
        if (!EventDispatcher.has(layer.getContainerGraphic())) {
          EventDispatcher.set(layer.getContainerGraphic(), new Map());
        }
        if (!EventDispatcher.get(layer.getContainerGraphic()).has(event)) {
          layer
            .getContainerGraphic()
            .addEventListener(event, this._dispatch.bind(this, layer, event));
          EventDispatcher.get(layer.getContainerGraphic()).set(event, []);
        }
        EventDispatcher.get(layer.getContainerGraphic())
          .get(event)
          .push([copyInteractor, layer, options, this]);
      });
    });
  }

  async _dispatch(layer: Layer<any>, event: string, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (eventHandling) {
      let existingEventIndex = EventQueue.findIndex(
        (e) =>
          e.instrument === this && e.layer === layer && e.eventType === event
      );
      if (existingEventIndex >= 0) {
        EventQueue.splice(existingEventIndex, 1);
      }
      EventQueue.push({ instrument: this, layer, eventType: event, event: e });
      return;
    }
    eventHandling = true;
    const layers = EventDispatcher.get(layer.getContainerGraphic())
      .get(event)
      .filter(([_, layr]) => layr._order >= 0);
    layers.sort((a, b) => b[1]._order - a[1]._order);
    let handled = false;
    for (let [inter, layr, layerOption, instrument] of layers) {
      if (e instanceof MouseEvent) {
        if (
          layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") ===
            "backgroundlayer" ||
          layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") ===
            "bglayer" ||
          (layerOption && layerOption.pointerEvents === "all")
        ) {
          // Default is `all` for BGLayer
        } else if (!layerOption || layerOption.pointerEvents === "viewport") {
          // Default is `viewport` for layers
          const maybeD3Layer = layr as any;
          if (
            maybeD3Layer._offset &&
            maybeD3Layer._width &&
            maybeD3Layer._height
          ) {
            if (
              e.offsetX < maybeD3Layer._offset.x ||
              e.offsetX > maybeD3Layer._offset.x + maybeD3Layer._width ||
              e.offsetY < maybeD3Layer._offset.y ||
              e.offsetY > maybeD3Layer._offset.y + maybeD3Layer._height
            ) {
              continue;
            }
          }
        } else {
          // Others is `visiblePainted`
          const query = layr.picking({
            baseOn: helpers.QueryType.Shape,
            type: helpers.ShapeQueryType.Point,
            x: e.clientX,
            y: e.clientY,
          });
          if (query.length <= 0) continue;
        }
      }
      try {
        let flag = await inter.dispatch(e, layr);
        // if (flag && e instanceof MouseEvent) {
        //   handled = true;
        //   break;
        // }
      } catch (e) {
        console.error(e);
        break;
      }
    }
    // if (!handled && e instanceof MouseEvent) {
    //   // default fallback of BGLayer
    //   helpers.global.stopTransient = true;
    // } else {
    //   helpers.global.stopTransient = false;
    // }
    eventHandling = false;
    if (EventQueue.length) {
      const eventDescription = EventQueue.shift();
      eventDescription.instrument._dispatch(
        eventDescription.layer,
        eventDescription.eventType,
        eventDescription.event
      );
    }
  }

  postUse(layer: Layer<any>) {
    const graphic = layer.getGraphic();
    graphic && graphic.style && (graphic.style.pointerEvents = "auto");
    this._postUse && this._postUse.call(this, this, layer);
  }

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }

  get services() {
    return helpers.makeFindableList(
      this._serviceInstances.slice(0),
      Service,
      this.useService.bind(this),
      () => {
        throw new Error("Do not support dynamic change service yet");
      },
      this
    );
  }

  get transformers() {
    return helpers.makeFindableList(
      this._transformers.slice(0),
      GraphicalTransformer,
      (e) => this._transformers.push(e),
      (e) => this._transformers.splice(this._transformers.indexOf(e), 1),
      this
    );
  }

  static register(baseName: string, options: InstrumentInitTemplate): void {
    registeredInstruments[baseName] = options;
  }
  static unregister(baseName: string): boolean {
    delete registeredInstruments[baseName];
    return true;
  }
  static initialize(
    baseName: string,
    options?: InstrumentInitOption
  ): Instrument {
    const mergedOptions = Object.assign(
      { constructor: Instrument },
      registeredInstruments[baseName] ?? {},
      options ?? {},
      {
        on: helpers.deepClone(
          Object.assign(
            {},
            (registeredInstruments[baseName] ?? {}).on ?? {},
            options?.on ?? {}
          )
        ),
        sharedVar: Object.assign(
          {},
          (registeredInstruments[baseName] ?? {}).sharedVar ?? {},
          options?.sharedVar ?? {}
        ),
      }
    );
    const instrument = new mergedOptions.constructor(baseName, mergedOptions);
    instanceInstruments.push(instrument);
    return instrument;
  }
  static findInstrument(baseNameOrRealName: string): Instrument[] {
    return instanceInstruments.filter((instrument) =>
      instrument.isInstanceOf(baseNameOrRealName)
    );
  }
  static build(options: InstrumentBuildTemplate): Instrument {
    if (!(options.inherit in registeredInstruments)) {
      throw new Error(
        `Instrument ${options.inherit} is not registered, please register it first`
      );
    }
    const inheritOption: InstrumentInitTemplate = Object.assign(
      { constructor: Instrument },
      registeredInstruments[options.inherit],
      {
        sharedVar: Object.assign(
          {},
          registeredInstruments[options.inherit].sharedVar ?? {},
          options.sharedVar ?? {}
        ),
      }
    );
    if (options.layers) {
      inheritOption.layers = options.layers;
    }

    const instrument = new inheritOption.constructor(
      options.inherit,
      inheritOption
    );
    instanceInstruments.push(instrument);

    const findNested = (
      parent: Instrument | Service,
      findType: string
    ): [Service | GraphicalTransformer, Instrument | Service] => {
      const s = parent.services.find((service) => {
        service.isInstanceOf(findType);
      });
      if (s) return [s, parent];
      const t = parent.transformers.find((transformer) => {
        transformer.isInstanceOf(findType);
      });
      if (t) return [t, parent];
      for (let service of parent.services) {
        const result = findNested(service, findType);
        if (result) return result;
      }
    };
    const findNestedReference = (
      parent: Instrument | Service,
      findType: string
    ): Instrument | Service => {
      if (parent.isInstanceOf(findType)) return parent;
      const s = parent.services.find((service) => {
        service.isInstanceOf(findType);
      });
      if (s) return s;
      for (let service of parent.services) {
        const result = findNestedReference(service, findType);
        if (result) return result;
      }
    };
    if (options.remove) {
      for (let removeOption of options.remove) {
        const [removeNode, parentNode] = findNested(
          instrument,
          removeOption.find
        );
        if (removeOption.cascade) {
          if (removeNode instanceof Service) {
            parentNode._services.splice(
              parentNode._services.indexOf(removeNode),
              1
            );
          } else {
            parentNode._transformers.splice(
              parentNode._transformers.indexOf(removeNode),
              1
            );
          }
        } else {
          if (removeNode instanceof Service) {
            parentNode._services.splice(
              parentNode._services.indexOf(removeNode),
              1,
              ...removeNode._services
            );
            parentNode._transformers.push(...removeNode._transformers);
          } else {
            parentNode._transformers.splice(
              parentNode._transformers.indexOf(removeNode),
              1
            );
          }
        }
      }
    }
    if (options.override) {
      for (let overrideOption of options.override) {
        const [removeNode, parentNode] = findNested(
          instrument,
          overrideOption.find
        );
        let replaceNode: GraphicalTransformer | Service;
        if (overrideOption.comp.includes("Transformer")) {
          let transformer: GraphicalTransformer;
          if (overrideOption.name) {
            if (
              GraphicalTransformer.findTransformer(overrideOption.name).length >
              0
            ) {
              transformer = GraphicalTransformer.findTransformer(
                overrideOption.name
              )[0];
            }
          }
          if (!transformer)
            transformer = GraphicalTransformer.initialize(overrideOption.comp, {
              name: overrideOption.name,
              sharedVar: {
                ...(options.sharedVar || {}),
                ...(overrideOption.sharedVar || {}),
              },
            });
          replaceNode = transformer;
        } else if (overrideOption.comp.includes("Service")) {
          let service: Service;
          if (overrideOption.name) {
            if (Service.findService(overrideOption.name).length > 0) {
              service = Service.findService(overrideOption.name)[0];
            }
          }
          if (!service)
            service = Service.initialize(overrideOption.comp, {
              ...overrideOption,
              services: [
                ...(overrideOption.services || []),
                ...(removeNode instanceof Service ? removeNode._services : []),
              ],
              transformers: [
                ...(overrideOption.transformers || []),
                ...(removeNode instanceof Service
                  ? removeNode._transformers
                  : []),
              ],
              sharedVar: {
                ...(options.sharedVar || {}),
                ...(overrideOption.sharedVar || {}),
              },
            });
          if (
            overrideOption.dimension &&
            service.isInstanceOf("SelectionService")
          ) {
            service = (service as SelectionService).dimension(
              overrideOption.dimension
            );
            if (overrideOption.layers) {
              service._layerInstances = overrideOption.layers.slice(0);
            }
            if (overrideOption.sharedVar) {
              service.setSharedVars(overrideOption.sharedVar);
            }
          }
          replaceNode = service;
        }
        if (removeNode instanceof Service) {
          parentNode._services.splice(
            parentNode._services.indexOf(removeNode),
            1
          );
        } else {
          parentNode._transformers.splice(
            parentNode._transformers.indexOf(removeNode),
            1
          );
        }
        if (overrideOption.comp.includes("Transformer")) {
          parentNode._transformers.push(replaceNode as GraphicalTransformer);
        } else {
          parentNode._services.push(replaceNode as Service);
        }
      }
    }
    if (options.insert) {
      for (let insert of options.insert) {
        const insertNode = findNestedReference(instrument, insert.find);
        let prevComponent:
          | Service
          | GraphicalTransformer
          | Service[]
          | GraphicalTransformer[] = null;
        let prevType: "Service" | "Transformer" = null;
        for (let i = insert.flow.length - 1; i >= 0; i--) {
          const componentOption = insert.flow[i];
          if (componentOption instanceof Function) {
            const newPrevComponent = [];
            let newPrevType = null;
            for (let j = 0; j < inheritOption.layers.length; j++) {
              const layer = inheritOption.layers[j];
              const generatedOption = componentOption(layer, j);
              if (generatedOption.comp.includes("Transformer")) {
                let transformer: GraphicalTransformer;
                if (generatedOption.name) {
                  if (
                    GraphicalTransformer.findTransformer(generatedOption.name)
                      .length > 0
                  ) {
                    transformer = GraphicalTransformer.findTransformer(
                      generatedOption.name
                    )[0];
                  }
                }
                if (!transformer)
                  transformer = GraphicalTransformer.initialize(
                    generatedOption.comp,
                    {
                      name: generatedOption.name,
                      sharedVar: {
                        ...(options.sharedVar || {}),
                        ...(generatedOption.sharedVar || {}),
                      },
                    }
                  );
                (newPrevComponent as GraphicalTransformer[]).push(transformer);
                newPrevType = "Transformer";
              } else if (generatedOption.comp.includes("Service")) {
                let service: Service;
                if (generatedOption.name) {
                  if (Service.findService(generatedOption.name).length > 0) {
                    service = Service.findService(generatedOption.name)[0];
                  }
                }
                if (!service)
                  service = Service.initialize(generatedOption.comp, {
                    ...generatedOption,
                    ...(prevComponent
                      ? prevType == "Transformer"
                        ? {
                            transformers:
                              prevComponent instanceof Array
                                ? (prevComponent as GraphicalTransformer[])
                                : [prevComponent as GraphicalTransformer],
                          }
                        : {
                            services:
                              prevComponent instanceof Array
                                ? (prevComponent as Service[])
                                : [prevComponent as Service],
                          }
                      : {}),
                    sharedVar: {
                      ...(options.sharedVar || {}),
                      ...(generatedOption.sharedVar || {}),
                    },
                  });
                if (
                  generatedOption.dimension &&
                  service instanceof SelectionService
                ) {
                  service = (service as SelectionService).dimension(
                    generatedOption.dimension
                  );
                  if (generatedOption.layers) {
                    service._layerInstances = generatedOption.layers.slice(0);
                  }
                  if (generatedOption.sharedVar) {
                    service.setSharedVars(generatedOption.sharedVar);
                  }
                }
                (newPrevComponent as Service[]).push(service);
                newPrevType = "Service";
              }
            }
            prevComponent = newPrevComponent;
            prevType = newPrevType;
          } else if (componentOption instanceof Array) {
            const newPrevComponent = [];
            let newPrevType = null;
            for (let j = 0; j < componentOption.length; j++) {
              const component = componentOption[j];
              if (component instanceof GraphicalTransformer) {
                (newPrevComponent as GraphicalTransformer[]).push(component);
                newPrevType = "Transformer";
              } else if (component instanceof Service) {
                if (prevType == "Transformer") {
                  component._transformers.push(
                    ...(prevComponent instanceof Array
                      ? (prevComponent as GraphicalTransformer[])
                      : [prevComponent as GraphicalTransformer])
                  );
                } else {
                  component._services.push(
                    ...(prevComponent instanceof Array
                      ? (prevComponent as Service[])
                      : [prevComponent as Service])
                  );
                }
                (newPrevComponent as Service[]).push(component);
                newPrevType = "Service";
              } else if (component.comp.includes("Transformer")) {
                let transformer: GraphicalTransformer;
                if (component.name) {
                  if (
                    GraphicalTransformer.findTransformer(component.name)
                      .length > 0
                  ) {
                    transformer = GraphicalTransformer.findTransformer(
                      component.name
                    )[0];
                  }
                }
                if (!transformer)
                  transformer = GraphicalTransformer.initialize(
                    component.comp,
                    {
                      name: component.name,
                      sharedVar: {
                        ...(options.sharedVar || {}),
                        ...(component.sharedVar || {}),
                      },
                    }
                  );
                (newPrevComponent as GraphicalTransformer[]).push(transformer);
                newPrevType = "Transformer";
              } else if (component.comp.includes("Service")) {
                let service: Service;
                if (component.name) {
                  if (Service.findService(component.name).length > 0) {
                    service = Service.findService(component.name)[0];
                  }
                }
                if (!service)
                  service = Service.initialize(component.comp, {
                    ...component,
                    ...(prevComponent
                      ? prevType == "Transformer"
                        ? {
                            transformers:
                              prevComponent instanceof Array
                                ? (prevComponent as GraphicalTransformer[])
                                : [prevComponent as GraphicalTransformer],
                          }
                        : {
                            services:
                              prevComponent instanceof Array
                                ? (prevComponent as Service[])
                                : [prevComponent as Service],
                          }
                      : {}),
                    sharedVar: {
                      ...(options.sharedVar || {}),
                      ...(component.sharedVar || {}),
                    },
                  });
                if (
                  component.dimension &&
                  service instanceof SelectionService
                ) {
                  service = (service as SelectionService).dimension(
                    component.dimension
                  );
                  if (component.layers) {
                    service._layerInstances = component.layers.slice(0);
                  }
                  if (component.sharedVar) {
                    service.setSharedVars(component.sharedVar);
                  }
                }
                (newPrevComponent as Service[]).push(service);
                newPrevType = "Service";
              }
            }
            prevComponent = newPrevComponent;
            prevType = newPrevType;
          } else if (componentOption instanceof GraphicalTransformer) {
            prevComponent = componentOption;
            prevType = "Transformer";
          } else if (componentOption instanceof Service) {
            if (prevType == "Transformer") {
              componentOption._transformers.push(
                ...(prevComponent instanceof Array
                  ? (prevComponent as GraphicalTransformer[])
                  : [prevComponent as GraphicalTransformer])
              );
            } else {
              componentOption._services.push(
                ...(prevComponent instanceof Array
                  ? (prevComponent as Service[])
                  : [prevComponent as Service])
              );
            }
            prevComponent = componentOption;
            prevType = "Service";
          } else if (componentOption.comp.includes("Transformer")) {
            let transformer: GraphicalTransformer;
            if (componentOption.name) {
              if (
                GraphicalTransformer.findTransformer(componentOption.name)
                  .length > 0
              ) {
                transformer = GraphicalTransformer.findTransformer(
                  componentOption.name
                )[0];
              }
            }
            if (!transformer)
              transformer = GraphicalTransformer.initialize(
                componentOption.comp,
                {
                  name: componentOption.name,
                  sharedVar: {
                    ...(options.sharedVar || {}),
                    ...(componentOption.sharedVar || {}),
                  },
                }
              );
            prevComponent = transformer;
            prevType = "Transformer";
          } else if (componentOption.comp.includes("Service")) {
            let service: Service;
            if (componentOption.name) {
              if (Service.findService(componentOption.name).length > 0) {
                service = Service.findService(componentOption.name)[0];
              }
            }
            if (!service)
              service = Service.initialize(componentOption.comp, {
                ...componentOption,
                ...(prevComponent
                  ? prevType == "Transformer"
                    ? {
                        transformers:
                          prevComponent instanceof Array
                            ? (prevComponent as GraphicalTransformer[])
                            : [prevComponent as GraphicalTransformer],
                      }
                    : {
                        services:
                          prevComponent instanceof Array
                            ? (prevComponent as Service[])
                            : [prevComponent as Service],
                      }
                  : {}),
                sharedVar: {
                  ...(options.sharedVar || {}),
                  ...(componentOption.sharedVar || {}),
                },
              });
            if (
              componentOption.dimension &&
              service.isInstanceOf("SelectionService")
            ) {
              service = (service as SelectionService).dimension(
                componentOption.dimension
              );
              if (componentOption.layers) {
                service._layerInstances = componentOption.layers.slice(0);
              }
              if (componentOption.sharedVar) {
                service.setSharedVars(componentOption.sharedVar);
              }
            }
            prevComponent = service;
            prevType = "Service";
          }
        }
        if (prevComponent) {
          if (prevType == "Transformer") {
            if (prevComponent instanceof Array) {
              insertNode._transformers.push(
                ...(prevComponent as GraphicalTransformer[])
              );
            } else {
              insertNode._transformers.push(
                prevComponent as GraphicalTransformer
              );
            }
          } else {
            if (insertNode instanceof Instrument) {
              if (prevComponent instanceof Array) {
                insertNode._serviceInstances.push(...(prevComponent as Service[]));
              } else {
                insertNode._serviceInstances.push(prevComponent as Service);
              }
            } else {
              if (prevComponent instanceof Array) {
                insertNode._services.push(...(prevComponent as Service[]));
              } else {
                insertNode._services.push(prevComponent as Service);
              }
            }
          }
        }
      }
    }

    return instrument;
  }
}

export const register = Instrument.register;
export const unregister = Instrument.unregister;
export const initialize = Instrument.initialize;
export const findInstrument = Instrument.findInstrument;
