import { deepClone } from "../helpers";

const registeredLayers = {};
const globalVars = {};
export const instanceLayers = [];

export default class Layer {
  _root = document.body;
  _container = window;
  _name;
  _listeners = [];
  _initOptions = [];
  _sharedVar = {};
  _notifyTimer = null;
  _props = {};

  constructor(name = "Layer") {
    this._name = name;
    instanceLayers.push(this);
  }

  _toTemplate() {
    return {
      listen: this._initOptions.slice(0),
      props: deepClone(this._props)
    };
  }

  _injectInstrument(instrument, options) {
    instrument._layers.push(this);
    Object.entries(options).forEach(([command, callback]) => {
      if (!command.endsWith("Command") && !command.endsWith("Feedback")) return;
      const _this = this;
      instrument._listeners[command].set(function () {
        callback.apply(_this, arguments);
        clearTimeout(_this._notifyTimer);
        _this._notifyTimer = setTimeout(_this._notify.bind(_this), 0);
      });
    });
    if (!instrument._selectionManager?.layers.length) {
      instrument._selectionManager?.bindLayer(this);
    }
  }

  _notify() {
    this._listeners.forEach((listener) => {
      if (listener && listener.handler instanceof Function) {
        listener.handler.call(listener.layer, this);
      }
    });
  }

  listen(options) {
    this._initOptions.push(options);
    if (options.layers) {
      for (let layer of options.layers) {
        options.updateCommand &&
          layer._listeners.unshift({
            layer: this,
            handler: options.updateCommand,
          });
        options.updateFeedback &&
          layer._listeners.push({
            layer: this,
            handler: options.updateFeedback,
          });
      }
    } else if (options.layer) {
      options.updateCommand &&
        options.layer._listeners.unshift({
          layer: this,
          handler: options.updateCommand,
        });
      options.updateFeedback &&
        options.layer._listeners.push({
          layer: this,
          handler: options.updateFeedback,
        });
    } else if (options.instruments) {
      for (let instrument of options.instruments) {
        this._injectInstrument(instrument, options);
      }
    } else if (options.instrument) {
      this._injectInstrument(options.instrument, options);
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

  getSharedVar(name) {
    return this._sharedVar[name];
  }

  setSharedVar(name, scale) {
    this._sharedVar[name] = scale;
  }

    prop(key, value) {
    if (arguments.length <= 0) {
      console.warn("Instrument.prop should have at least one param.");
      return undefined;
    }
    if (arguments.length <= 1) return this._props[key];
    this._props[key] = value;
  }

  getProp(key) {
    return this.prop(key);
  }

  setProp(key, value) {
    return this.prop(key, value);
  }

  props(props) {
    if (arguments.length <= 0) {
      console.warn("Instrument.props should have at least one param.");
      return undefined;
    }
    if (arguments.length <= 1) return props.map((key) => this._props[key]);
    Object.assign(this._props, props);
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

Layer.initialize = function initialize(name, userDefinedProps, ...params) {
  if(typeof userDefinedProps !== "object") {
    params.unshift(userDefinedProps);
  }
  let options;
  
  if ((options = registeredLayers[name])) {
    const layer = new options.constructor(
      name,
      ...(options.extraParams || []),
      ...params
    );
    if (options.props || userDefinedProps) {
      const mergedProps = Object.assign({}, options.props);
      Object.assign(mergedProps, userDefinedProps);
      Object.entries(mergedProps).forEach(([k, v]) => {
        layer.prop(k, v);
      });
    }
    if (options.preInstall && options.preInstall instanceof Function) {
      options.preInstall.call(layer, layer);
    }
    const remapping = new Map();
    for (let option of options.listen || []) {
      if (option.instruments) {
        option.instruments = option.instruments.slice(0);
        for (let i in option.instruments) {
          const t = option.instruments[i];
          if (remapping.has(t)) {
            option.instruments[i] = remapping.get(t);
          } else {
            option.instruments[i] = option.instruments[i].clone();
            remapping.set(t, option.instruments[i]);
          }
        }
      } else if (option.instrument) {
        const t = option.instrument;
        if (remapping.has(t)) {
          option.instrument = remapping.get(t);
        } else {
          option.instrument = option.instrument.clone();
          remapping.set(t, option.instrument);
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

Layer.getGlobalVar = function(name){
  if(name) return globalVars[name];
}

Layer.setGlobalVar = function(name, value){
  globalVars[name] = value;
}

Layer.register("Layer", { constructor: Layer });