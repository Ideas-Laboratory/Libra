import { Interactor } from "../interactor";
import * as helpers from "../helpers";
import { Command } from "../command";
import { Layer } from "../layer";
import { Service, findService } from "../service";
import { GraphicalTransformer } from "../transformer";

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

  constructor(baseName: string, options: InstrumentInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._preInitialize = options.preInitialize ?? null;
    this._postInitialize = options.postInitialize ?? null;
    this._preAttach = options.preAttach ?? null;
    this._postUse = options.postUse ?? null;
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._on = helpers.deepClone(options.on ?? {});
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
    if (options.layers) {
      options.layers.forEach((layer) => {
        if ("options" in layer) {
          this.attach(layer.layer, layer.options);
        } else {
          this.attach(layer);
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

    const linkProps =
      this.getSharedVar("linkProps") || Object.keys(this._sharedVar);
    if (this._sharedVar.linking) {
      for (let prop of linkProps) {
        if (this._linkCache[prop] === this._sharedVar[prop]) continue;
        this._sharedVar.linking.setSharedVar(prop, this._sharedVar[prop]);
      }
    }
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
          if (maybeD3Layer._offset) {
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
        on: Object.assign(
          {},
          (registeredInstruments[baseName] ?? {}).on ?? {},
          options?.on ?? {}
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
}

export const register = Instrument.register;
export const unregister = Instrument.unregister;
export const initialize = Instrument.initialize;
export const findInstrument = Instrument.findInstrument;
