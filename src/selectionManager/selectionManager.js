const registeredSelectionManagers = {};
export const instanceSelectionManagers = [];

export default class SelectionManager {
  _result = [];
  _layers = [];
  _dirty = false;
  _oldResult = null;

  constructor(name = "SelectionManager") {
    this._name = name;
  }

  _toTemplate() {
    return {};
  }

  clone() {
    const option = this._toTemplate();
    return new this.constructor(...(option.extraParams || []));
  }

  update() {
    this._dirty = true;
  }

  evaluate() {
    // Need override
    this._result = [];
  }

  get layers() {
    return this._layers.slice(0);
  }

  get result() {
    if (this._dirty) {
      this._oldResult = this._result;
      this.evaluate();
      this._dirty = false;
    }
    return this._result.slice(0);
  }

  get oldResult() {
    if (this._dirty) {
      this._oldResult = this._result;
      this.evaluate();
      this._dirty = false;
    }
    return this._oldResult.slice(0);
  }

  bindLayer(layer) {
    this._layers = [layer];
  }
}

SelectionManager.register = function register(name, optionOrSelectionManager) {
  let option;
  if (optionOrSelectionManager instanceof SelectionManager) {
    option = optionOrSelectionManager._toTemplate();
    option.constructor = optionOrSelectionManager.constructor;
  } else {
    option = optionOrSelectionManager;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : SelectionManager;
  }
  registeredSelectionManagers[name] = option;
  return true;
};

SelectionManager.unregister = function unregister(name) {
  delete registeredSelectionManagers[name];
  return true;
};

SelectionManager.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredSelectionManagers[name])) {
    const selectionManager = new option.constructor(
      name,
      ...(option.extraParams || []),
      ...params
    );
    instanceSelectionManagers.push(selectionManager);
    return selectionManager;
  }
  return null;
};

SelectionManager.register("SelectionManager", {
  constructor: SelectionManager,
});
