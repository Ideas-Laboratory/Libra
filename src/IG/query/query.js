const registeredSelectors = {};

export default class Selector {
  _result = [];
  _layer = null;
  _dirty = false;

  constructor(name = "Selector") {
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

  get result() {
    if (this._dirty) {
      this.evaluate();
    }
    return this._result.slice(0);
  }

  bindLayer(layer) {
    this._layer = layer;
  }
}

Selector.register = function register(name, optionOrSelector) {
  let option;
  if (optionOrSelector instanceof Selector) {
    option = optionOrSelector._toTemplate();
    option.constructor = optionOrSelector.constructor;
  } else {
    option = optionOrSelector;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Selector;
  }
  registeredSelectors[name] = option;
  return true;
};

Selector.unregister = function unregister(name) {
  delete registeredSelectors[name];
  return true;
};

Selector.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredSelectors[name])) {
    const query = new option.constructor(
      name,
      ...(option.extraParams || []),
      ...params
    );
    return query;
  }
  return null;
};

Selector.register("Selector", { constructor: Selector });
