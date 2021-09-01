import { makeFlexibleListener, deepClone } from "../helpers";
import interactor from "../interactor";
import Interactor from "../interactor";
import SelectionManager from "../selectionManager";

const registeredInstruments = {};
export const instanceInstruments = [];

export default class Instrument {
  _name;
  _views = [];
  _listeners;
  _activeListeners = [];
  _frameListeners = [];
  _terminateListeners = [];
  _selectionManager;
  _interactors = [];
  _relations = [];
  _userListeners = {};
  _eventQueue = [];
  _props = {};
  _layers = [];
  _next = null;

  constructor(name = "Instrument", options) {
    this._name = name;
    this._listeners = makeFlexibleListener();
    if (options) {
      this._userListeners = options;
      Object.entries(options).forEach(([command, callback]) => {
        if (command.endsWith("Command") || command.endsWith("Feedback")) {
          this._listeners[command].set(callback);
        } else if (
          (command.endsWith("Commands") || command.endsWith("Feedbacks")) &&
          callback instanceof Array
        ) {
          const realCommand = command.slice(0, command.length - 1);
          callback.forEach((cbk) => {
            this._listeners[realCommand].set(cbk);
          });
        }
      });
    }
    instanceInstruments.push(this);
  }

  _toTemplate() {
    return {
      selectionManager: this._selectionManager,
      relations: this._relations.slice(0),
      views: this._views.slice(0),
      extraParams: [this._userListeners],
      props: deepClone(this._props),
    };
  }

  _injectInteractor(relation) {
    if (!this._selectionManager) return;
    if (!relation.attribute) return;
    if (relation.const) {
      if (relation.const instanceof Function) {
        this._selectionManager[relation.attribute] = relation.const.call(
          this,
          this
        );
      } else {
        this._selectionManager[relation.attribute] = relation.const;
      }
      this._selectionManager.update();
    } else {
      if (!relation.interactor) return;
      if (!this._interactors.includes(relation.interactor)) {
        this._interactors.push(relation.interactor);
        const primitiveCommands = relation.interactor.getCommands();
        const primitiveFeedbacks = relation.interactor.getFeedbacks();
        [primitiveCommands, primitiveFeedbacks]
          .flatMap((x) => x)
          .forEach((type) => {
            relation.interactor._listeners[type].set(
              this._notify.bind(this, type)
            );
          });
      }
      Object.entries(relation).forEach(([command, listener]) => {
        if (!command.endsWith("Command") && !command.endsWith("Feedback"))
          return;
        relation.interactor._listeners[command].prepend((event) => {
          const calculatedResult = listener(event, this._selectionManager);
          if (relation.attribute instanceof Array) {
            relation.attribute.forEach((attribute, i) => {
              this._selectionManager[attribute] = calculatedResult[i];
            });
          } else {
            this._selectionManager[relation.attribute] = calculatedResult;
          }
          this._selectionManager.update();
        });
      });
    }
  }

  _injectView(view) {
    let events = [];
    for (let interactor of this._interactors) {
      events = events.concat(interactor.getActions());
    }
    events = [...new Set(events)];
    for (let event of events) {
      view.addEventListener(event, this.dispatch.bind(this));
    }
  }

  _notify(type, event) {
    if (!this._next) this._next = requestAnimationFrame(this._run.bind(this));
    if (
      this._eventQueue.find(
        (pendingEvent) =>
          pendingEvent.type === type && pendingEvent.event === event
      )
    )
      return;
    this._eventQueue.push({ type, event });
  }

  _run() {
    let pendingEvent = this._eventQueue.shift();
    while (pendingEvent) {
      let { type, event } = pendingEvent;
      this._listeners[type].list().forEach((listener) => {
        if (listener instanceof Function) {
          listener.call(
            this,
            this._selectionManager,
            event,
            this._layers.slice(0)
          );
        }
      });
      pendingEvent = this._eventQueue.shift();
    }
    this._next = null;
  }

  clone() {
    return initWithOption(this._name, {
      ...this._toTemplate(),
      constructor: this.constructor,
    });
  }

  dispatch(event) {
    for (let interactor of this._interactors) {
      interactor.dispatch(event);
    }
  }

  associate(option) {
    if (option.selectionManager) {
      this._selectionManager = option.selectionManager;
      for (let relation of this._relations) {
        this._injectInteractor(relation);
      }
    }
    if (option.relations) {
      this._relations = this._relations.concat(option.relations);
      for (let relation of option.relations) {
        this._injectInteractor(relation);
      }
    } else if (option.relation) {
      this._relations.push(option.relation);
      this._injectInteractor(option.relation);
    }
  }

  attach(views) {
    if (!(views instanceof Array)) {
      views = [views];
    }
    this._views = this._views.concat(views);
    for (let view of views) {
      this._injectView(view);
    }
  }

  listen(option) {
    Object.entries(option).forEach(([command, callback]) => {
      if (command.endsWith("Command") || command.endsWith("Feedback")) {
        if (!this._userListeners[command + "s"]) {
          this._userListeners[command + "s"] = [];
        }
        this._userListeners[command + "s"].push(callback);
        this._listeners[command].set(callback);
      } else if (
        (command.endsWith("Commands") || command.endsWith("Feedbacks")) &&
        callback instanceof Array
      ) {
        if (!this._userListeners[command]) {
          this._userListeners[command] = [];
        }
        this._userListeners[command] =
          this._userListeners[command].concat(callback);
        const realCommand = command.slice(0, command.length - 1);
        callback.forEach((cbk) => {
          this._listeners[realCommand].set(cbk);
        });
      }
    });
  }

  prop(key, value) {
    if (arguments.length <= 0) {
      console.warn("Instrument.prop should have at least one param.");
      return undefined;
    }
    if (arguments.length <= 1) return this._props[key];
    this._props[key] = value;
  }

  getProp(key) {
    return this.prop(key);
  }

  setProp(key, value) {
    return this.prop(key, value);
  }

  props(props) {
    if (arguments.length <= 0) {
      console.warn("Instrument.props should have at least one param.");
      return undefined;
    }
    if (arguments.length <= 1) return props.map((key) => this._props[key]);
    Object.assign(this._props, props);
  }

  get selectionManager() {
    return this._selectionManager || null;
  }

  get layer() {
    return (this._selectionManager && this._selectionManager._layer) || null;
  }
}

Instrument.register = function register(name, optionOrInstrument) {
  let option;
  if (optionOrInstrument instanceof Instrument) {
    option = optionOrInstrument._toTemplate();
    option.constructor = optionOrInstrument.constructor;
  } else {
    option = optionOrInstrument;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Instrument;
  }
  registeredInstruments[name] = option;
  return true;
};

Instrument.unregister = function unregister(name) {
  delete registeredInstruments[name];
  return true;
};

Instrument.initialize = function initialize(name, props, ...params) {
  let option;
  if ((option = registeredInstruments[name])) {
    if (typeof props !== "object") {
      params.unshift(props);
      return initWithOption(name, option, {}, ...params);
    }
    return initWithOption(name, option, props, ...params);
  }
  return null;
};

function initWithOption(name, options, userDefinedProps, ...params) {
  const instrument = new options.constructor(
    name,
    ...(options.extraParams || []),
    ...params
  );
  if (options.props || userDefinedProps) {
    const mergedProps = Object.assign({}, options.props);
    Object.assign(mergedProps, userDefinedProps);
    Object.entries(mergedProps).forEach(([k, v]) => {
      instrument.prop(k, v);
    });
  }
  if (options.preInstall && options.preInstall instanceof Function) {
    options.preInstall(instrument);
  }
  if (options.selectionManager || options.relations) {
    const remapping = new Map();
    instrument.associate({
      selectionManager:
        options.selectionManager && options.selectionManager.clone(),
      relations:
        options.relations &&
        options.relations.map((relation) => {
          if (relation.interactor) {
            let newInteractor;
            if (remapping.has(relation.interactor)) {
              newInteractor = remapping.get(relation.interactor);
            } else {
              newInteractor = relation.interactor.clone();
              remapping.set(relation.interactor, newInteractor);
            }
            return {
              ...relation,
              interactor: newInteractor,
            };
          }
          return relation;
        }),
    });
  }
  if (options.views || options.view) {
    instrument.attach(options.views || options.view);
  }
  instrument.listen(options);
  if (options.postInstall && options.postInstall instanceof Function) {
    options.postInstall(instrument);
  }
  return instrument;
}

Instrument.register("Instrument", {});

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");
Instrument.register("ClickInstrument", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      endCommand: (e) => [e.x, e.y],
    },
  ],
});

Instrument.register("DragInstrument", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      dragCommand: (e) => [e.x, e.y],
    },
  ],
});

Instrument.register("BrushInstrument", {
  selectionManager: SelectionManager.initialize("RectSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      startCommand: (e) => [e.x, e.y],
    },
    {
      attribute: ["width", "height"],
      interactor: trajectoryInteractor,
      dragCommand: (e, selectionManager) => [
        e.x - selectionManager.x,
        e.y - selectionManager.y,
      ],
    },
  ],
});

const wheelInteractor = Interactor.initialize("WheelInteractor");
Instrument.register("ZoomInstrument", {
  selectionManager: SelectionManager.initialize("SelectionManager"),
  relations: [
    {
      attribute: "wheel",
      interactor: wheelInteractor,
    },
  ],
});

const pointerInteractor = Interactor.initialize("PointerInteractor");
Instrument.register("HoverInstrument", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: pointerInteractor,
      pointerCommand: (e) => [e.x, e.y],
    },
  ],
});
