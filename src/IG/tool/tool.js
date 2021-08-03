import { makeFlexibleListener, deepClone } from "../helpers";
import Interactor from "../interactor";
import SelectionManager from "../query";

const registeredTools = {};
export const instanceTools = [];

export default class Tool {
  _name;
  _views = [];
  _listeners;
  _activeListeners = [];
  _frameListeners = [];
  _terminateListeners = [];
  _query;
  _interactors = [];
  _relations = [];
  _userListeners = {};
  _eventQueue = [];
  _props = {};
  _next = null;

  constructor(name = "Tool", options) {
    this._name = name;
    this._listeners = makeFlexibleListener();
    if (options) {
      this._userListeners = options;
      Object.entries(options).forEach(([command, callback]) => {
        if (!command.endsWith("Command") && !command.endsWith("Feedback"))
          return;
        this._listeners[command].set(callback);
      });
    }
    instanceTools.push(this);
  }

  _toTemplate() {
    return {
      selectionManager: this._query,
      relations: this._relations.slice(0),
      views: this._views.slice(0),
      extraParams: [this._userListeners],
      props: deepClone(this._props),
    };
  }

  _injectInteractor(relation) {
    if (!this._query) return;
    if (!relation.attribute) return;
    if (relation.const) {
      if (relation.const instanceof Function) {
        this._query[relation.attribute] = relation.const();
      } else {
        this._query[relation.attribute] = relation.const;
      }
      this._query.update();
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
          const calculatedResult = listener(event, this._query);
          if (relation.attribute instanceof Array) {
            relation.attribute.forEach((attribute, i) => {
              this._query[attribute] = calculatedResult[i];
            });
          } else {
            this._query[relation.attribute] = calculatedResult;
          }
          this._query.update();
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
          listener.call(this, this._query, event);
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
      this._query = option.selectionManager;
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
      if (!command.endsWith("Command") && !command.endsWith("Feedback")) return;
      this._userListeners[command] = callback;
      this._listeners[command].set(callback);
    });
  }

  prop(key, value) {
    if (arguments.length <= 0) {
      console.warn("Tool.prop should have at least one param.");
      return undefined;
    }
    if (arguments.length <= 1) return this._props[key];
    this._props[key] = value;
  }

  get query() {
    return this._query || null;
  }

  get layer() {
    return (this._query && this._query._layer) || null;
  }
}

Tool.register = function register(name, optionOrTool) {
  let option;
  if (optionOrTool instanceof Tool) {
    option = optionOrTool._toTemplate();
    option.constructor = optionOrTool.constructor;
  } else {
    option = optionOrTool;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Tool;
  }
  registeredTools[name] = option;
  return true;
};

Tool.unregister = function unregister(name) {
  delete registeredTools[name];
  return true;
};

Tool.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredTools[name])) {
    return initWithOption(name, option, ...params);
  }
  return null;
};

function initWithOption(name, options, ...params) {
  const tool = new options.constructor(
    name,
    ...(options.extraParams || []),
    ...params
  );
  if (options.preInstall && options.preInstall instanceof Function) {
    options.preInstall(tool);
  }
  if (options.selectionManager || options.relations) {
    const remapping = new Map();
    tool.associate({
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
    tool.attach(options.views || options.view);
  }
  if (options.props) {
    Object.entries(options.props).forEach(([k, v]) => {
      tool.prop(k, v);
    });
  }
  if (options.postInstall && options.postInstall instanceof Function) {
    options.postInstall(tool);
  }
  return tool;
}

Tool.register("Tool", {});

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");
Tool.register("ClickTool", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      endCommand: (e) => [e.x, e.y],
    },
  ],
});

Tool.register("DragTool", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      dragCommand: (e) => [e.x, e.y],
    },
  ],
});

Tool.register("BrushTool", {
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
      dragCommand: (e, query) => [e.x - query.x, e.y - query.y],
    },
  ],
});

const wheelInteractor = Interactor.initialize("WheelInteractor");
Tool.register("ZoomTool", {
  selectionManager: SelectionManager.initialize("SelectionManager"),
  relations: [
    {
      attribute: "wheel",
      interactor: wheelInteractor,
    },
  ],
});

const pointerInteractor = Interactor.initialize("PointerInteractor");
Tool.register("HoverTool", {
  selectionManager: SelectionManager.initialize("PointSelectionManager"),
  relations: [
    {
      attribute: ["x", "y"],
      interactor: pointerInteractor,
      pointerCommand: (e) => [e.x, e.y],
    },
  ],
});
