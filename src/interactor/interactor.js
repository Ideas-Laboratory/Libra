import { makeFlexibleListener } from "../helpers";
import Libra from "../index";
import vegaEventSelector from "./vega-event-selector";

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
  }

  _toTemplate() {
    return {
      startActions: this._startActions.map(act => act.selector).slice(0),
      runningActions: this._runningActions.map(act => act.selector).slice(0),
      outsideActions: this._outsideActions.map(act => act.selector).slice(0),
      stopActions: this._stopActions.map(act => act.selector).slice(0),
      abortActions: this._abortActions.map(act => act.selector).slice(0),
      backInsideActions: this._backInsideActions.map(act => act.selector).slice(0),
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
          Libra.History.replace();
        } else {
          Libra.History.push();
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
      if (
        this[`_${key}Actions`].map((action) => action.type).includes(eventType)
      ) {
        this._state = trans[key][0];
        this._emit(`$${key}`, event);
        trans[key][1].forEach((type) => this._emit(type, event));
        return true;
      }
      return false;
    });
  }

  getActions() {
    console.log(this);
    const actions = [
      this._startActions,
      this._runningActions,
      this._outsideActions,
      this._stopActions,
      this._abortActions,
      this._backInsideActions,
    ].flatMap(action => action).map(a => a.type);
    return actions;
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

  set startActions(selector) {
    this._startActions = parseSelector(selector)
  }
  set runningActions(selector) {
    this._runningActions = parseSelector(selector)
  }
  set outsideActions(selector) {
    this._outsideActions = parseSelector(selector);
  }
  set stopActions(selector) {
    this._stopActions = parseSelector(selector)
  }
  set abortActions(selector) {
    this._abortActions = parseSelector(selector)
  }
  set backInsideActions(selector) {
    this._backInsideActions = parseSelector(selector)
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

function parseSelector(selector) {
  let actions = [];
  if (typeof selector === "string") {
    actions = [vegaEventSelector(selector)[0]]; //.type;
    actions[0]["selector"] = selector;
  } else if (selector instanceof Array) {
    actions = selector
      .map(s => {
        const action = vegaEventSelector(s)
        action["selector"] = selector;
        return action;
      })
      .map((eventStreams) => eventStreams[0]); //.type);
    actions.forEach((act, i) => act["selector"] = selector[i]);
  }

  return actions;
}

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
