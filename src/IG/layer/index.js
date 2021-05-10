const registeredLayers = {};
const instanceLayers = [];

export default class Layer {
  _name;
  _pureTools = [];
  _preconditionTools = [];
  _listeners = [];
  _observes = [];

  constructor(name = "Layer") {
    this._name = name;
    instanceLayers.push(this);
  }

  _toTemplate() {
    return {
      attach: [{ tools: _pureTools }, ...this._preconditionTools],
      listen: this._observes.slice(0),
    };
  }

  _injectTool(tool) {
    tool._activeListeners.push(this._notify.bind(this));
    tool._frameListeners.push(this._notify.bind(this));
    tool._terminateListeners.push(this._notify.bind(this));
    tool._query?.bindLayer(this);
  }

  _notify() {
    this._listeners.forEach((listener) => {
      if (listener instanceof Function) {
        listener();
      }
    });
  }

  attach(option) {
    if (option.precondition !== undefined) {
      this._preconditionTools.push(option);
    } else {
      if (option.tools) {
        this._pureTools = this._pureTools.concat(option.tools);
      } else if (option.tool) {
        this._pureTools.push(option.tool);
      }
    }
    if (option.tools) {
      for (let tool of option.tools) {
        this._injectTool(tool);
      }
    } else if (option.tool) {
      this._injectTool(option.tool);
    }
  }

  listen(option) {
    this._observes.push(option);
    if (option.layers) {
      for (let layer of option.layers) {
        layer._listeners.push(option.frameCommand);
      }
    } else if (option.layer) {
      option.layer._listeners.push(option.frameCommand);
    }
  }
}

Layer.register = function register(name, optionOrLayer) {
  let option;
  if (optionOrLayer instanceof Layer) {
    option = optionOrLayer._toTemplate();
    option.constructor = optionOrLayer.constructor;
  } else {
    option = optionOrLayer;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Layer;
  }
  registeredLayers[name] = option;
  return true;
};

Layer.unregister = function unregister(name) {
  delete registeredLayers[name];
  return true;
};

Layer.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredLayers[name])) {
    const layer = new option.constructor(
      name,
      ...(option.extraParams || []),
      ...params
    );
    for (let tool of option.attach || []) {
      layer.attach(tool);
    }
    for (let anotherLayer of option.listen || []) {
      layer.listen(anotherLayer);
    }
    return layer;
  }
  return null;
};

Layer.query = function query(name) {
  return instanceLayers.filter((layer) => layer._name === name);
};

Layer.register("Layer", { constructor: Layer });
