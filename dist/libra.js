// dist/esm/command/command.js
var registeredCommands = {};
var instanceCommands = [];
var Command = class {
  constructor(baseName, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
    this._feedbacks = (_b = options.feedback) !== null && _b !== void 0 ? _b : [];
    this._undo = (_c = options.undo) !== null && _c !== void 0 ? _c : null;
    this._redo = (_d = options.redo) !== null && _d !== void 0 ? _d : null;
    this._execute = (_e = options.execute) !== null && _e !== void 0 ? _e : null;
    this._preInitialize = (_f = options.preInitialize) !== null && _f !== void 0 ? _f : null;
    this._postInitialize = (_g = options.postInitialize) !== null && _g !== void 0 ? _g : null;
    this._preExecute = (_h = options.preExecute) !== null && _h !== void 0 ? _h : null;
    this._postExecute = (_j = options.postExecute) !== null && _j !== void 0 ? _j : null;
    options.postInitialize && options.postInitialize.call(this, this);
  }
  undo() {
    this._undo && this._undo.call(this);
  }
  redo() {
    this._redo && this._redo.call(this);
  }
  execute(options) {
    this.preExecute();
    this._execute && this._execute.call(this, options);
    this.postExecute();
  }
  preExecute() {
    this._preExecute && this._preExecute.call(this, this);
  }
  postExecute() {
    this._postExecute && this._postExecute.call(this, this);
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
};
function register(baseName, options) {
  registeredCommands[baseName] = options;
}
function initialize(baseName, options) {
  var _a;
  const mergedOptions = Object.assign({}, (_a = registeredCommands[baseName]) !== null && _a !== void 0 ? _a : { constructor: Command }, options);
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
function findCommand(baseNameOrRealName) {
  return instanceCommands.filter((command) => command.isInstanceOf(baseNameOrRealName));
}
Command.register = register;
Command.initialize = initialize;
Command.findCommand = findCommand;

// dist/esm/command/index.js
var Command2 = Command;

// dist/esm/instrument/instrument.js
var registeredInstruments = {};
var instanceInstruments = [];
var Instrument = class {
  constructor(baseName, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    options.preInitialize && options.preInitialize.call(this, this);
    this._preInitialize = (_a = options.preInitialize) !== null && _a !== void 0 ? _a : null;
    this._postInitialize = (_b = options.postInitialize) !== null && _b !== void 0 ? _b : null;
    this._preUse = (_c = options.preUse) !== null && _c !== void 0 ? _c : null;
    this._postUse = (_d = options.postUse) !== null && _d !== void 0 ? _d : null;
    this._baseName = baseName;
    this._userOptions = options;
    this._name = (_e = options.name) !== null && _e !== void 0 ? _e : baseName;
    this._on = (_f = options.on) !== null && _f !== void 0 ? _f : {};
    this._interactors = (_g = options.interactors) !== null && _g !== void 0 ? _g : [];
    this._layers = [];
    if (options.layers) {
      options.layers.forEach((layer) => {
        if ("options" in layer) {
          this.attach(layer.layer, layer.options);
        } else {
          this.attach(layer);
        }
      });
    }
    this._sharedVar = (_h = options.sharedVar) !== null && _h !== void 0 ? _h : {};
    options.postInitialize && options.postInitialize.call(this, this);
  }
  on(action, feedforwardOrCommand) {
    this._on[action] = feedforwardOrCommand;
  }
  use(interactor, options) {
    interactor.preUse(this);
    if (arguments.length >= 2) {
      this._interactors.push({ interactor, options });
    } else {
      this._interactors.push(interactor);
    }
    interactor.postUse(this);
  }
  attach(layer, options) {
    this.preUse(layer);
    if (arguments.length >= 2) {
      this._layers.push({ layer, options });
    } else {
      this._layers.push(layer);
    }
    this.postUse(layer);
  }
  getSharedVar(sharedName, options) {
    if (!(sharedName in this._sharedVar) && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }
  setSharedVar(sharedName, value, options) {
    this._sharedVar[sharedName] = value;
    if (this._on[`update:${sharedName}`]) {
      const feedforwardOrCommand = this._on[`update:${sharedName}`];
      if (feedforwardOrCommand instanceof Command2) {
        feedforwardOrCommand.execute({
          self: this,
          layer: null,
          instrument: this,
          interactor: null
        });
      } else {
        feedforwardOrCommand({
          self: this,
          layer: null,
          instrument: this,
          interactor: null
        });
      }
    }
  }
  watchSharedVar(sharedName, handler) {
    this.on(`update:${sharedName}`, handler);
  }
  preUse(layer) {
    this._preUse && this._preUse.call(this, this, layer);
  }
  postUse(layer) {
    this._postUse && this._postUse.call(this, this, layer);
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
};
function register2(baseName, options) {
  registeredInstruments[baseName] = options;
}
function initialize2(baseName, options) {
  var _a, _b, _c, _d;
  const mergedOptions = Object.assign({}, (_a = registeredInstruments[baseName]) !== null && _a !== void 0 ? _a : { constructor: Instrument }, options, {
    on: Object.assign({}, (_c = ((_b = registeredInstruments[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options.on) !== null && _d !== void 0 ? _d : {})
  });
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
function findInstrument(baseNameOrRealName) {
  return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
}
Instrument.register = register2;
Instrument.initialize = initialize2;
Instrument.findInstrument = findInstrument;

// dist/esm/instrument/index.js
var Instrument2 = Instrument;

// dist/esm/helpers.js
function makeFindableList(list) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return (name) => makeFindableList(target.filter((item) => item.isInstanceOf(name)));
      }
    }
  });
}
function parseEventSelector(selector) {
  return parseMerge(selector.trim()).map(parseSelector);
}
var VIEW = "view";
var LBRACK = "[";
var RBRACK = "]";
var LBRACE = "{";
var RBRACE = "}";
var COLON = ":";
var COMMA = ",";
var NAME = "@";
var GT = ">";
var ILLEGAL = /[[\]{}]/;
var DEFAULT_SOURCE = VIEW;
var DEFAULT_MARKS = {
  "*": 1,
  arc: 1,
  area: 1,
  group: 1,
  image: 1,
  line: 1,
  path: 1,
  rect: 1,
  rule: 1,
  shape: 1,
  symbol: 1,
  text: 1,
  trail: 1
};
var MARKS = DEFAULT_MARKS;
function isMarkType(type) {
  return MARKS.hasOwnProperty(type);
}
function find(s, i, endChar, pushChar, popChar) {
  let count = 0, c;
  const n = s.length;
  for (; i < n; ++i) {
    c = s[i];
    if (!count && c === endChar)
      return i;
    else if (popChar && popChar.indexOf(c) >= 0)
      --count;
    else if (pushChar && pushChar.indexOf(c) >= 0)
      ++count;
  }
  return i;
}
function parseMerge(s) {
  const output = [], n = s.length;
  let start = 0, i = 0;
  while (i < n) {
    i = find(s, i, COMMA, LBRACK + LBRACE, RBRACK + RBRACE);
    output.push(s.substring(start, i).trim());
    start = ++i;
  }
  if (output.length === 0) {
    throw "Empty event selector: " + s;
  }
  return output;
}
function parseSelector(s) {
  return s[0] === "[" ? parseBetween(s) : parseStream(s);
}
function parseBetween(s) {
  const n = s.length;
  let i = 1, b, stream;
  i = find(s, i, RBRACK, LBRACK, RBRACK);
  if (i === n) {
    throw "Empty between selector: " + s;
  }
  b = parseMerge(s.substring(1, i));
  if (b.length !== 2) {
    throw "Between selector must have two elements: " + s;
  }
  s = s.slice(i + 1).trim();
  if (s[0] !== GT) {
    throw "Expected '>' after between selector: " + s;
  }
  const bt = b.map(parseSelector);
  stream = parseSelector(s.slice(1).trim());
  if (stream.between) {
    return {
      between: bt,
      stream
    };
  } else {
    stream.between = bt;
  }
  return stream;
}
function parseStream(s) {
  const stream = {
    source: DEFAULT_SOURCE,
    type: ""
  }, source = [];
  let throttle = [0, 0], markname = 0, start = 0, n = s.length, i = 0, j, filter;
  if (s[n - 1] === RBRACE) {
    i = s.lastIndexOf(LBRACE);
    if (i >= 0) {
      try {
        throttle = parseThrottle(s.substring(i + 1, n - 1));
      } catch (e) {
        throw "Invalid throttle specification: " + s;
      }
      s = s.slice(0, i).trim();
      n = s.length;
    } else
      throw "Unmatched right brace: " + s;
    i = 0;
  }
  if (!n)
    throw s;
  if (s[0] === NAME)
    markname = ++i;
  j = find(s, i, COLON);
  if (j < n) {
    source.push(s.substring(start, j).trim());
    start = i = ++j;
  }
  i = find(s, i, LBRACK);
  if (i === n) {
    source.push(s.substring(start, n).trim());
  } else {
    source.push(s.substring(start, i).trim());
    filter = [];
    start = ++i;
    if (start === n)
      throw "Unmatched left bracket: " + s;
  }
  while (i < n) {
    i = find(s, i, RBRACK);
    if (i === n)
      throw "Unmatched left bracket: " + s;
    filter.push(s.substring(start, i).trim());
    if (i < n - 1 && s[++i] !== LBRACK)
      throw "Expected left bracket: " + s;
    start = ++i;
  }
  if (!(n = source.length) || ILLEGAL.test(source[n - 1])) {
    throw "Invalid event selector: " + s;
  }
  if (n > 1) {
    stream.type = source[1];
    if (markname) {
      stream.markname = source[0].slice(1);
    } else if (isMarkType(source[0])) {
      stream.marktype = source[0];
    } else {
      stream.source = source[0];
    }
  } else {
    stream.type = source[0];
  }
  if (stream.type.slice(-1) === "!") {
    stream.consume = true;
    stream.type = stream.type.slice(0, -1);
  }
  if (filter != null)
    stream.filter = filter;
  if (throttle[0])
    stream.throttle = throttle[0];
  if (throttle[1])
    stream.debounce = throttle[1];
  return stream;
}
function parseThrottle(s) {
  const a = s.split(COMMA);
  if (!s.length || a.length > 2)
    throw s;
  return a.map(function(_) {
    const x = +_;
    if (x !== x)
      throw s;
    return x;
  });
}

// dist/esm/interactor/interactor.js
var registeredInteractors = {};
var instanceInteractors = [];
var Interactor = class {
  constructor(baseName, options) {
    var _a, _b, _c, _d, _e, _f;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
    this._state = options.state;
    this._actions = (_b = options.actions) !== null && _b !== void 0 ? _b : [];
    this._preInitialize = (_c = options.preInitialize) !== null && _c !== void 0 ? _c : null;
    this._postInitialize = (_d = options.postInitialize) !== null && _d !== void 0 ? _d : null;
    this._preUse = (_e = options.preUse) !== null && _e !== void 0 ? _e : null;
    this._postUse = (_f = options.postUse) !== null && _f !== void 0 ? _f : null;
    options.postInitialize && options.postInitialize.call(this, this);
  }
  getActions() {
    return this._actions.slice(0);
  }
  setActions(actions) {
    this._actions = this._actions.concat(actions);
  }
  _parseEvent(event) {
    const flatStream = (stream) => "stream" in stream ? stream.stream.flatMap(flatStream) : stream.type;
    return parseEventSelector(event).flatMap(flatStream);
  }
  getAcceptEvents() {
    return this._actions.flatMap((action) => action.events.flatMap((event) => this._parseEvent(event)));
  }
  dispatch(event) {
    const moveAction = this._actions.find((action) => action.events.includes(event) && (!action.transition || action.transition.find((transition) => transition[0] === this._state)));
    if (moveAction) {
      const moveTransition = moveAction.transition && moveAction.transition.find((transition) => transition[0] === this._state);
      if (moveTransition) {
        this._state = moveTransition[1];
      }
      if (moveAction.sideEffect) {
        moveAction.sideEffect({
          self: this,
          layer: null,
          instrument: null,
          interactor: this
        });
      }
    }
  }
  preUse(instrument) {
    this._preUse && this._preUse.call(this, this, instrument);
  }
  postUse(instrument) {
    this._postUse && this._postUse.call(this, this, instrument);
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
};
function register3(baseName, options) {
  registeredInteractors[baseName] = options;
}
function initialize3(baseName, options) {
  var _a;
  const mergedOptions = Object.assign({}, (_a = registeredInteractors[baseName]) !== null && _a !== void 0 ? _a : { constructor: Interactor }, options);
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
function findInteractor(baseNameOrRealName) {
  return instanceInteractors.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
}
Interactor.register = register3;
Interactor.initialize = initialize3;
Interactor.findInteractor = findInteractor;

// dist/esm/interactor/index.js
var Interactor2 = Interactor;

// dist/esm/service/service.js
var registeredServices = {};
var instanceServices = [];
var InteractionService = class {
  constructor(baseName, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
    this._on = (_b = options.on) !== null && _b !== void 0 ? _b : {};
    this._sharedVar = (_c = options.sharedVar) !== null && _c !== void 0 ? _c : {};
    this._layerInstances = [];
    this._preInitialize = (_d = options.preInitialize) !== null && _d !== void 0 ? _d : null;
    this._postInitialize = (_e = options.postInitialize) !== null && _e !== void 0 ? _e : null;
    this._preUpdate = (_f = options.preUpdate) !== null && _f !== void 0 ? _f : null;
    this._postUpdate = (_g = options.postUpdate) !== null && _g !== void 0 ? _g : null;
    this._preUse = (_h = options.preUse) !== null && _h !== void 0 ? _h : null;
    this._postUse = (_j = options.postUse) !== null && _j !== void 0 ? _j : null;
    options.postInitialize && options.postInitialize.call(this, this);
  }
  on(action, command) {
    this._on[action] = command;
  }
  getSharedVar(sharedName, options) {
    if (!(sharedName in this._sharedVar) && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }
  setSharedVar(sharedName, value, options) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (this._on.update) {
      this._on.update.execute({
        self: this,
        layer: null,
        instrument: null,
        interactor: null
      });
    }
    if (this._on[`update:${sharedName}`]) {
      this._on[`update:${sharedName}`].execute({
        self: this,
        layer: null,
        instrument: null,
        interactor: null
      });
    }
    this.postUpdate();
  }
  watchSharedVar(sharedName, handler) {
    this.on(`update:${sharedName}`, handler);
  }
  preUpdate() {
    this._preUpdate && this._preUpdate.call(this, this);
  }
  postUpdate() {
    this._postUpdate && this._postUpdate.call(this, this);
  }
  preUse(layer) {
    this._preUse && this._preUse.call(this, this, layer);
    this._layerInstances.push(layer);
  }
  postUse(layer) {
    this._postUse && this._postUse.call(this, this, layer);
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
};
function register4(baseName, options) {
  registeredServices[baseName] = options;
}
function initialize4(baseName, options) {
  var _a, _b, _c, _d, _e, _f, _g;
  const mergedOptions = Object.assign({}, (_a = registeredServices[baseName]) !== null && _a !== void 0 ? _a : { constructor: InteractionService }, options, {
    on: Object.assign({}, (_c = ((_b = registeredServices[baseName]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options.on) !== null && _d !== void 0 ? _d : {}),
    sharedVar: Object.assign({}, (_f = ((_e = registeredServices[baseName]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options.sharedVar) !== null && _g !== void 0 ? _g : {})
  });
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
function findService(baseNameOrRealName) {
  return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
}
InteractionService.register = register4;
InteractionService.initialize = initialize4;
InteractionService.findService = findService;

// dist/esm/service/index.js
var findService2 = findService;
var InteractionService2 = InteractionService;

// dist/esm/layer/layer.js
var registeredLayers = {};
var instanceLayers = [];
var Layer = class {
  constructor(baseName, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName;
    this._transformation = (_b = options.transformation) !== null && _b !== void 0 ? _b : {};
    this._services = (_c = options.services) !== null && _c !== void 0 ? _c : [];
    this._container = options.container;
    this._sharedVar = (_d = options.sharedVar) !== null && _d !== void 0 ? _d : {};
    this._sharedVarWatcher = {};
    this._transformationWatcher = {};
    this._serviceInstances = [];
    this._redraw = options.redraw;
    this._preInitialize = (_e = options.preInitialize) !== null && _e !== void 0 ? _e : null;
    this._postInitialize = (_f = options.postInitialize) !== null && _f !== void 0 ? _f : null;
    this._preUpdate = (_g = options.preUpdate) !== null && _g !== void 0 ? _g : null;
    this._postUpdate = (_h = options.postUpdate) !== null && _h !== void 0 ? _h : null;
    this._services.forEach((service) => {
      if (typeof service === "string" || !("options" in service)) {
        this.use(service);
      } else {
        this.use(service.service, service.options);
      }
    });
    instanceLayers.push(this);
    this._postInitialize && this._postInitialize.call(this, this);
  }
  getGraphic() {
    return this._graphic;
  }
  getContainerGraphic() {
    return this._container;
  }
  getVisualElements() {
    return [];
  }
  getSharedVar(sharedName, defaultValue) {
    if (sharedName in this._sharedVar) {
      return this._sharedVar[sharedName];
    } else {
      this.setSharedVar(sharedName, defaultValue);
      return defaultValue;
    }
  }
  setSharedVar(sharedName, value) {
    this.preUpdate();
    const oldValue = this._sharedVar[sharedName];
    this._sharedVar[sharedName] = value;
    if (sharedName in this._sharedVarWatcher) {
      this._sharedVarWatcher[sharedName].forEach((callback) => {
        if (callback instanceof Command2) {
          callback.execute({
            self: this,
            layer: this,
            instrument: null,
            interactor: null,
            value,
            oldValue
          });
        } else {
          callback({ value, oldValue });
        }
      });
    }
    this.postUpdate();
  }
  watchSharedVar(sharedName, handler) {
    if (!(sharedName in this._sharedVarWatcher)) {
      this._sharedVarWatcher[sharedName] = [];
    }
    this._sharedVarWatcher[sharedName].push(handler);
  }
  getTransformation(scaleName, defaultValue) {
    if (scaleName in this._transformation) {
      return this._transformation[scaleName];
    } else {
      this.setTransformation(scaleName, defaultValue);
      return defaultValue;
    }
  }
  setTransformation(scaleName, transformation) {
    this.preUpdate();
    const oldValue = this._transformation[scaleName];
    this._transformation[scaleName] = transformation;
    if (scaleName in this._transformationWatcher) {
      this._transformationWatcher[scaleName].forEach((callback) => {
        if (callback instanceof Command2) {
          callback.execute({
            self: this,
            layer: this,
            instrument: null,
            interactor: null,
            value: transformation,
            oldValue
          });
        } else {
          callback({ value: transformation, oldValue });
        }
      });
    }
    this.postUpdate();
  }
  watchTransformation(scaleName, handler) {
    if (!(scaleName in this._transformationWatcher)) {
      this._transformationWatcher[scaleName] = [];
    }
    this._transformationWatcher[scaleName].push(handler);
  }
  redraw(data, scale, selection) {
    this.preUpdate();
    if (this._redraw && this._redraw instanceof Function) {
      this._redraw(data, scale, selection);
    }
    this.postUpdate();
  }
  preUpdate() {
    this._preUpdate && this._preUpdate.call(this, this);
  }
  postUpdate() {
    this._postUpdate && this._postUpdate.call(this, this);
  }
  query(options) {
    return [];
  }
  _use(service, options) {
    service.preUse(this);
    this._serviceInstances.push(service);
    service.postUse(this);
  }
  use(service, options) {
    if (this._services.includes(service)) {
      return;
    }
    if (arguments.length >= 2) {
      this._services.push({ service, options });
    } else {
      this._services.push(service);
    }
    if (typeof service === "string") {
      const services = findService2(service);
      services.forEach((service2) => this._use(service2, options));
    } else {
      this._use(service, options);
    }
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
  get services() {
    return makeFindableList(this._serviceInstances.slice(0));
  }
};
function register5(baseName, options) {
  registeredLayers[baseName] = options;
}
function initialize5(baseName, options) {
  var _a, _b, _c, _d, _e, _f, _g;
  const mergedOptions = Object.assign({}, (_a = registeredLayers[baseName]) !== null && _a !== void 0 ? _a : { constructor: Layer }, options, {
    transformation: Object.assign({}, (_c = ((_b = registeredLayers[baseName]) !== null && _b !== void 0 ? _b : {}).transformation) !== null && _c !== void 0 ? _c : {}, (_d = options.transformation) !== null && _d !== void 0 ? _d : {}),
    sharedVar: Object.assign({}, (_f = ((_e = registeredLayers[baseName]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options.sharedVar) !== null && _g !== void 0 ? _g : {})
  });
  const layer = new mergedOptions.constructor(baseName, mergedOptions);
  return layer;
}
function findLayer(baseNameOrRealName) {
  return instanceLayers.filter((layer) => layer.isInstanceOf(baseNameOrRealName));
}
Layer.register = register5;
Layer.initialize = initialize5;
Layer.findLayer = findLayer;

// dist/esm/layer/index.js
var Layer2 = Layer;

// dist/esm/index.js
var esm_default = {
  Command: Command2,
  Instrument: Instrument2,
  Interactor: Interactor2,
  Layer: Layer2,
  InteractionService: InteractionService2
};
export {
  Command2 as Command,
  Instrument2 as Instrument,
  InteractionService2 as InteractionService,
  Interactor2 as Interactor,
  Layer2 as Layer,
  esm_default as default
};
