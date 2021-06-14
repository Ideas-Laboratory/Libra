const registeredLayers = {};
const instanceLayers = [];

export default class Layer {
  _root = document.body;
  _container = window;
  _name;
  _listeners = [];
  _initOptions = [];
  _sharedScale = {};
  _notifyTimer = null;

  constructor(name = "Layer") {
    this._name = name;
    instanceLayers.push(this);
  }

  _toTemplate() {
    return {
      listen: this._initOptions.slice(0),
    };
  }

  _injectTool(tool, options) {
    Object.entries(options).forEach(([command, callback]) => {
      if (!command.endsWith("Command")) return;
      const _this = this;
      tool._listeners[command].set(function () {
        callback.apply(_this, arguments);
        clearTimeout(_this._notifyTimer);
        _this._notifyTimer = setTimeout(_this._notify.bind(_this), 0);
      });
    });
    if (!tool._query?.layers.length) {
      tool._query?.bindLayer(this);
    }
  }

  _notify() {
    this._listeners.forEach((listener) => {
      if (listener instanceof Function) {
        listener();
      }
    });
  }

  listen(options) {
    console.log("options", options);
    this._initOptions.push(options);
    if (options.layers) {
      for (let layer of options.layers) {
        layer._listeners.push(options.updateCommand);
      }
    } else if (options.layer) {
      options.layer._listeners.push(options.updateCommand);
    } else if (options.tools) {
      for (let tool of options.tools) {
        this._injectTool(tool, options);
      }
    } else if (options.tool) {
      this._injectTool(options.tool, options);
    }
  }

  getGraphic() {
    return this._root;
  }

  getRootGraphic() {
    return this._container;
  }

  getObjects() {
    return [];
  }

  onObject() {
    return false;
  }

  query() {
    return [];
  }

  pick() {
    return [];
  }

  find() {
    return [];
  }

  getSharedScale(name) {
    return this._sharedScale[name];
  }

  setSharedScale(name, scale) {
    this._sharedScale[name] = scale;
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
  let options;
  if ((options = registeredLayers[name])) {
    const layer = new options.constructor(
      name,
      ...(options.extraParams || []),
      ...params
    );
    if (options.preInstall && options.preInstall instanceof Function) {
      options.preInstall.call(layer, layer);
    }
    const remapping = new Map();
    for (let option of options.listen || []) {
      if (option.tools) {
        option.tools = option.tools.slice(0);
        for (let i in option.tools) {
          const t = option.tools[i];
          if (remapping.has(t)) {
            option.tools[i] = remapping.get(t);
          } else {
            option.tools[i] = option.tools[i].clone();
            remapping.set(t, option.tools[i]);
          }
        }
      } else if (option.tool) {
        const t = option.tool;
        if (remapping.has(t)) {
          option.tool = remapping.get(t);
        } else {
          option.tool = option.tool.clone();
          remapping.set(t, option.tool);
        }
      }
      layer.listen(option);
    }
    if (options.postInstall && options.postInstall instanceof Function) {
      options.postInstall.call(layer, layer);
    }
    return layer;
  }
  return null;
};

Layer.query = function query(name) {
  return instanceLayers.filter((layer) => layer._name === name);
};

Layer.register("Layer", { constructor: Layer });
