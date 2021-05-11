import Interactor from "../interactor";
import Query from "../query";

const registeredTools = {};

export default class Tool {
  _name;
  _activeListeners = [];
  _frameListeners = [];
  _terminateListeners = [];
  _query;
  _interactors = [];
  _relations = [];

  constructor(name = "Tool", options) {
    this._name = name;
    if (options) {
      if (options.activeCommand) {
        this._activeListeners.push(options.activeCommand);
      }
      if (options.activeCommands) {
        this._activeListeners = this._activeListeners.concat(
          options.activeCommands
        );
      }
      if (options.frameCommand) {
        this._frameListeners.push(options.frameCommand);
      }
      if (options.frameCommands) {
        this._frameListeners = this._frameListeners.concat(
          options.frameCommands
        );
      }
      if (options.terminateCommand) {
        this._terminateListeners.push(options.terminateCommand);
      }
      if (options.terminateCommands) {
        this._terminateListeners = this._terminateListeners.concat(
          options.terminateCommands
        );
      }
    }
  }

  _toTemplate() {
    return {
      query: this._query,
      relations: this._relations.slice(0),
    };
  }

  _injectInteractor(relation) {
    if (!this._query) return;
    if (!relation.attribute) return;
    if (relation.const) {
      this._query[relation.attribute] = relation.const;
      this._query.update();
    } else {
      if (!relation.interactor) return;
      if (!this._interactors.includes(relation.interactor)) {
        this._interactors.push(relation.interactor);
        relation.interactor._activeListeners.push(
          this._notify.bind(this, "active")
        );
        relation.interactor._frameListeners.push(
          this._notify.bind(this, "frame")
        );
        relation.interactor._terminateListeners.push(
          this._notify.bind(this, "terminate")
        );
      }
      if (relation.command instanceof Function) {
        relation.interactor._activeListeners.push((event) => {
          this._query[relation.attribute] = relation.command(
            event,
            this._query
          );
          this._query.update();
        });
        relation.interactor._frameListeners.push((event) => {
          this._query[relation.attribute] = relation.command(
            event,
            this._query
          );
          this._query.update();
        });
        relation.interactor._terminateListeners.push((event) => {
          this._query[relation.attribute] = relation.command(
            event,
            this._query
          );
          this._query.update();
        });
      }
      if (relation.activeCommand instanceof Function) {
        relation.interactor._activeListeners.push((event) => {
          this._query[relation.attribute] = relation.activeCommand(
            event,
            this._query
          );
          this._query.update();
        });
      }
      if (relation.frameCommand instanceof Function) {
        relation.interactor._frameListeners.push((event) => {
          this._query[relation.attribute] = relation.frameCommand(
            event,
            this._query
          );
          this._query.update();
        });
      }
      if (relation.terminateCommand instanceof Function) {
        relation.interactor._terminateListeners.push((event) => {
          this._query[relation.attribute] = relation.terminateCommand(
            event,
            this._query
          );
          this._query.update();
        });
      }
    }
  }

  _notify(type) {
    (this[`_${type}Listeners`] || []).forEach((listener) => {
      if (listener instanceof Function) {
        listener(this._query ? this._query.result() : []);
      }
    });
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
    if (option.query) {
      this._query = option.query;
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

function initWithOption(name, option, ...params) {
  const tool = new option.constructor(
    name,
    ...(option.extraParams || []),
    ...params
  );
  if (option.query || option.relations) {
    const remapping = new Map();
    tool.associate({
      query: option.query && option.query.clone(),
      relations:
        option.relations &&
        option.relations.map((relation) => {
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
  return tool;
}

Tool.register("Tool", {});

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");
Tool.register("ClickTool", {
  query: Query.initialize("PointQuery"),
  relations: [
    {
      attribute: "x",
      interactor: trajectoryInteractor,
      terminateCommand: (e) => e.x,
    },
    {
      attribute: "y",
      interactor: trajectoryInteractor,
      terminateCommand: (e) => e.y,
    },
  ],
});

Tool.register("DragTool", {
  query: Query.initialize("PointQuery"),
  relations: [
    {
      attribute: "x",
      interactor: trajectoryInteractor,
      frameCommand: (e) => e.x,
    },
    {
      attribute: "y",
      interactor: trajectoryInteractor,
      frameCommand: (e) => e.y,
    },
  ],
});

Tool.register("BrushTool", {
  query: Query.initialize("RectQuery"),
  relations: [
    {
      attribute: "x",
      interactor: trajectoryInteractor,
      activeCommand: (e) => e.x,
    },
    {
      attribute: "y",
      interactor: trajectoryInteractor,
      activeCommand: (e) => e.y,
    },
    {
      attribute: "width",
      interactor: trajectoryInteractor,
      frameCommand: (e, query) => e.x - query.x,
    },
    {
      attribute: "height",
      interactor: trajectoryInteractor,
      frameCommand: (e, query) => e.y - query.y,
    },
  ],
});

const wheelInteractor = Interactor.initialize("WheelInteractor");
Tool.register("ZoomTool", {
  query: Query.initialize("Query"),
  relations: [
    {
      attribute: "wheel",
      interactor: wheelInteractor,
    },
  ],
});

const pointerInteractor = Interactor.initialize("PointerInteractor");
Tool.register("HoverTool", {
  query: Query.initialize("PointQuery"),
  relations: [
    {
      attribute: "x",
      interactor: pointerInteractor,
      frameCommand: (e) => e.x,
    },
    {
      attribute: "y",
      interactor: pointerInteractor,
      frameCommand: (e) => e.y,
    },
  ],
});
