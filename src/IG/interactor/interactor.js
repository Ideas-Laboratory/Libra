import { makeFlexibleListener } from "../helpers";

const registeredSelectionManagers = {};

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

  constructor(name = "Interactor", rename) {
    this._name = name;
    this._listeners = makeFlexibleListener();
    this._rename = rename || {};
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
    };
  }

  _emit(type, payload) {
    if (this._rename[type]) {
      type = this._rename[type];
    }
    this._listeners[type + "Command"].list().forEach((listener) => {
      if (listener instanceof Function) {
        listener(payload);
      }
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
    return interactor;
  }

  dispatch(event) {
    const eventType = event.type;
    event = this._wrapEvent(event);
    switch (this._state) {
      case "start":
        if (this._startActions.includes(eventType)) {
          this._state = "running";
          this._emit("active", event);
          this._emit("frame", event);
        }
        break;
      case "running":
        if (this._runningActions.includes(eventType)) {
          this._emit("frame", event);
        } else if (
          this._stopActions.includes(eventType) ||
          this._abortActions.includes(eventType)
        ) {
          this._state = "start";
          this._emit("terminate", event);
        } else if (this._outsideActions.includes(eventType)) {
          this._state = "outside";
          this._emit("terminate", event);
        }
        break;
      case "outside":
        if (this._backInsideActions.includes(eventType)) {
          this._state = "running";
          this._emit("active", event);
          this._emit("frame", event);
        } else if (
          this._abortActions.includes(eventType) ||
          this._stopActions.includes(eventType)
        ) {
          this._state = "start";
        }
        break;
    }
  }

  getActions() {
    return this._startActions
      .concat(this._runningActions)
      .concat(this._outsideActions)
      .concat(this._stopActions)
      .concat(this._abortActions)
      .concat(this._backInsideActions);
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
  registeredSelectionManagers[name] = option;
  return true;
};

Interactor.unregister = function unregister(name) {
  delete registeredSelectionManagers[name];
  return true;
};

Interactor.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredSelectionManagers[name])) {
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
