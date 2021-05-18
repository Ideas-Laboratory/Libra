const registeredSelectors = {};

export default class Interactor {
  _name;
  _state = "start";
  _activeListeners = [];
  _frameListeners = [];
  _terminateListeners = [];
  _startActions = [];
  _runningActions = [];
  _outsideActions = [];
  _stopActions = [];
  _abortActions = [];
  _backInsideActions = [];

  constructor(name = "Interactor") {
    this._name = name;
  }

  _toTemplate() {
    return {
      startActions: this._startActions.slice(0),
      runningActions: this._runningActions.slice(0),
      outsideActions: this._outsideActions.slice(0),
      stopActions: this._stopActions.slice(0),
      abortActions: this._abortActions.slice(0),
      backInsideActions: this._backInsideActions.slice(0),
    };
  }

  _emit(type, payload) {
    (this[`_${type}Listeners`] || []).forEach((listener) => {
      if (listener instanceof Function) {
        listener(payload);
      }
    });
  }

  clone() {
    const option = this._toTemplate();
    const interactor = new this.constructor(...(option.extraParams || []));
    for (let actionKey of Object.keys(option)) {
      if (actionKey.endsWith("Actions")) {
        interactor[actionKey] = option[actionKey];
      }
    }
    return interactor;
  }

  dispatch(event) {
    const eventType = event.rawEvent.type;
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

Interactor.register = function register(name, optionOrSelector) {
  let option;
  if (optionOrSelector instanceof Interactor) {
    option = optionOrSelector._toTemplate();
    option.constructor = optionOrSelector.constructor;
  } else {
    option = optionOrSelector;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Interactor;
  }
  registeredSelectors[name] = option;
  return true;
};

Interactor.unregister = function unregister(name) {
  delete registeredSelectors[name];
  return true;
};

Interactor.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredSelectors[name])) {
    const interactor = new option.constructor(
      name,
      ...(option.extraParams || []),
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
});

Interactor.register("PointerInteractor", {
  startActions: "mousemove",
  runningActions: "mousemove",
});

Interactor.register("WheelInteractor", {
  startActions: ["mousewheel", "wheel"],
  runningActions: ["mousewheel", "wheel"],
});
