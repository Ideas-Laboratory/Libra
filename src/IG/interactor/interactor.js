import { makeFlexibleListener } from "../helpers";
import History from "../history";

const registeredInteractors = {};
export const instanceInteractors = [];

export default class Interactor {
  _name;
  _listeners;
  _state = "start";
  _rename = {};
  _startActions = [];
  _runningActions = [];
  _outsideActions = [];
  _stopActions = [];
  _abortActions = [];
  _backInsideActions = [];
  _middleware = [];

  constructor(name = "Interactor", rename) {
    this._name = name;
    this._listeners = makeFlexibleListener();
    this._rename = rename || {};
    instanceInteractors.push(this);
  }

  _toTemplate() {
    return {
      startActions: this._startActions.slice(0),
      runningActions: this._runningActions.slice(0),
      outsideActions: this._outsideActions.slice(0),
      stopActions: this._stopActions.slice(0),
      abortActions: this._abortActions.slice(0),
      backInsideActions: this._backInsideActions.slice(0),
      extraParams: [JSON.parse(JSON.stringify(this._rename))],
      middlewares: this._middleware.slice(0),
    };
  }

  _emit(type, payload) {
    const rawType = type;
    if (this._rename[type]) {
      type = this._rename[type];
    }
    ["Command", "Feedback"].forEach((action) => {
      this._listeners[type + action].list().forEach((listener) => {
        if (listener instanceof Function) {
          listener(payload);
        }
      });
      if (action === "Command" && this._listeners[type + action].size()) {
        if (rawType === "frame" || rawType === "$running") {
          History.replace();
        } else {
          History.push();
        }
      } // Commit Context
    });
  }

  _wrapEvent(event) {
    event.preventDefault();
    let wrappedEvents = [];
    const bbox = event.currentTarget.getBoundingClientRect();
    switch (event.type) {
      case "mousedown":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "mousemove":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "mouseup":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "wheel":
        wrappedEvents.push({
          rawEvent: event,
          type: "wheel",
          delta: event.deltaY,
        });
        break;
      default:
        const maybeCustomEvent = {
          rawEvent: event,
          type: event.type,
        };
        Object.entries(event.emit || {}).forEach(
          ([k, v]) => (maybeCustomEvent[k] = v)
        );
        wrappedEvents.push(maybeCustomEvent);
    }
    return wrappedEvents[0];
  }

  clone() {
    const option = this._toTemplate();
    const interactor = new this.constructor(
      this.name,
      ...(option.extraParams || [])
    );
    for (let actionKey of Object.keys(option)) {
      if (actionKey.endsWith("Actions")) {
        interactor[actionKey] = option[actionKey];
      }
    }
    if (option.middlewares) interactor.appendMiddlewares(...option.middlewares);
    return interactor;
  }

  dispatch(event) {
    for (middleware in this._middleware) {
      event = middleware(event);
    }
    const eventType = event.type;
    event = this._wrapEvent(event);
    const transitionMap = {
      start: {
        start: ["running", ["active", "frame"]],
        stop: ["start", []],
      },
      running: {
        running: ["running", ["frame"]],
        outside: ["outside", ["terminate"]],
        stop: ["start", ["terminate"]],
        abort: ["start", ["terminate"]],
      },
      outside: {
        backInside: ["running", ["active", "frame"]],
        abort: ["start", []],
        stop: ["start", []],
      },
    };
    const trans = transitionMap[this._state];
    Object.keys(trans).find((key) => {
      if (this[`_${key}Actions`].includes(eventType)) {
        this._state = trans[key][0];
        this._emit(`$${key}`, event);
        trans[key][1].forEach((type) => this._emit(type, event));
        return true;
      }
      return false;
    });
  }

  getActions() {
    return this._startActions
      .concat(this._runningActions)
      .concat(this._outsideActions)
      .concat(this._stopActions)
      .concat(this._abortActions)
      .concat(this._backInsideActions);
  }

  getBaseResponse() {
    return [
      "active",
      "frame",
      "terminate",
      "$start",
      "$stop",
      "$running",
      "$outside",
      "$abort",
      "$backInside",
    ].map((type) => (this._rename[type] ? this._rename[type] : type));
  }

  getCommands() {
    const base = this.getBaseResponse();
    return base.map((type) => type + "Command");
  }

  getFeedbacks() {
    const base = this.getBaseResponse();
    return base.map((type) => type + "Feedback");
  }

  prependMiddlewares(...middleware) {
    this._middleware.unshift(
      ...middleware.filter((x) => x instanceof Function)
    );
  }

  appendMiddlewares(...middleware) {
    this._middleware.push(...middleware.filter((x) => x instanceof Function));
  }

  clearMiddlewares() {
    this._middleware = [];
  }

  set startActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._startActions.includes(eventName)
    ) {
      this._startActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._startActions = eventName.filter((e) => typeof e === "string");
    }
  }
  set runningActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._runningActions.includes(eventName)
    ) {
      this._runningActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._runningActions = eventName.filter((e) => typeof e === "string");
    }
  }
  set outsideActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._outsideActions.includes(eventName)
    ) {
      this._outsideActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._outsideActions = eventName.filter((e) => typeof e === "string");
    }
  }
  set stopActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._stopActions.includes(eventName)
    ) {
      this._stopActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._stopActions = eventName.filter((e) => typeof e === "string");
    }
  }
  set abortActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._abortActions.includes(eventName)
    ) {
      this._abortActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._abortActions = eventName.filter((e) => typeof e === "string");
    }
  }
  set backInsideActions(eventName) {
    if (
      typeof eventName === "string" &&
      !this._backInsideActions.includes(eventName)
    ) {
      this._backInsideActions.push(eventName);
    } else if (eventName instanceof Array) {
      this._backInsideActions = eventName.filter((e) => typeof e === "string");
    }
  }
}

Interactor.register = function register(name, optionOrSelectionManager) {
  let option;
  if (optionOrSelectionManager instanceof Interactor) {
    option = optionOrSelectionManager._toTemplate();
    option.constructor = optionOrSelectionManager.constructor;
  } else {
    option = optionOrSelectionManager;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Interactor;
  }
  registeredInteractors[name] = option;
  return true;
};

Interactor.unregister = function unregister(name) {
  delete registeredInteractors[name];
  return true;
};

Interactor.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredInteractors[name])) {
    const interactor = new option.constructor(
      name,
      Object.assign(
        {},
        (option.extraParams || [{}])[0] || {},
        option.rename || {}
      ),
      ...(option.extraParams || []).slice(1),
      ...params
    );
    for (let actionKey of Object.keys(option)) {
      if (actionKey.endsWith("Actions")) {
        interactor[actionKey] = option[actionKey];
      }
    }
    if (option.middlewares) interactor.appendMiddlewares(...option.middlewares);
    return interactor;
  }
  return null;
};

Interactor.register("Interactor", {});

Interactor.register("TrajectoryInteractor", {
  startActions: "mousedown",
  runningActions: "mousemove",
  outsideActions: "mouseup",
  backInsideActions: "mousedown",
  rename: {
    active: "start",
    frame: "drag",
    terminate: "end",
  },
});

Interactor.register("PointerInteractor", {
  startActions: "mousemove",
  runningActions: "mousemove",
  rename: {
    active: "pointer",
    frame: "pointer",
  },
});

Interactor.register("WheelInteractor", {
  startActions: ["mousewheel", "wheel"],
  runningActions: ["mousewheel", "wheel"],
  rename: {
    active: "wheel",
    frame: "wheel",
  },
});
