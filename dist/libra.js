// dist/esm/command/command.js
var registeredCommands = {};
var instanceCommands = [];
var Command = class {
  constructor(baseName2, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName2;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName2;
    this._feedbacks = (_b = options.feedbacks) !== null && _b !== void 0 ? _b : [];
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
    this._feedbacks.forEach((feedback) => feedback.call(this, options));
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
  static register(baseName2, options) {
    registeredCommands[baseName2] = options;
  }
  static unregister(baseName2) {
    delete registeredCommands[baseName2];
    return true;
  }
  static initialize(baseName2, options) {
    var _a;
    const mergedOptions = Object.assign({}, (_a = registeredCommands[baseName2]) !== null && _a !== void 0 ? _a : { constructor: Command }, options !== null && options !== void 0 ? options : {});
    const service = new mergedOptions.constructor(baseName2, mergedOptions);
    return service;
  }
  static findCommand(baseNameOrRealName) {
    return instanceCommands.filter((command) => command.isInstanceOf(baseNameOrRealName));
  }
};
var register = Command.register;
var unregister = Command.unregister;
var initialize = Command.initialize;
var findCommand = Command.findCommand;

// dist/esm/command/index.js
var Command2 = Command;

// dist/esm/helpers.js
var QueryType;
(function(QueryType2) {
  QueryType2[QueryType2["Shape"] = 0] = "Shape";
  QueryType2[QueryType2["Data"] = 1] = "Data";
  QueryType2[QueryType2["Attr"] = 2] = "Attr";
})(QueryType || (QueryType = {}));
var ShapeQueryType;
(function(ShapeQueryType2) {
  ShapeQueryType2[ShapeQueryType2["SurfacePoint"] = 0] = "SurfacePoint";
  ShapeQueryType2[ShapeQueryType2["Point"] = 1] = "Point";
  ShapeQueryType2[ShapeQueryType2["Circle"] = 2] = "Circle";
  ShapeQueryType2[ShapeQueryType2["Rect"] = 3] = "Rect";
  ShapeQueryType2[ShapeQueryType2["Polygon"] = 4] = "Polygon";
})(ShapeQueryType || (ShapeQueryType = {}));
var DataQueryType;
(function(DataQueryType2) {
  DataQueryType2[DataQueryType2["Quantitative"] = 0] = "Quantitative";
  DataQueryType2[DataQueryType2["Quantitative2D"] = 1] = "Quantitative2D";
  DataQueryType2[DataQueryType2["Nominal"] = 2] = "Nominal";
  DataQueryType2[DataQueryType2["Temporal"] = 3] = "Temporal";
})(DataQueryType || (DataQueryType = {}));
function makeFindableList(list, typing, addFunc) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return (name, defaultValue) => {
          const filteredResult = target.filter((item) => item.isInstanceOf(name));
          if (filteredResult.length <= 0 && defaultValue) {
            const newElement = typing.initialize(defaultValue);
            addFunc(newElement);
            filteredResult.push(newElement);
          }
          return makeFindableList(filteredResult, typing, addFunc);
        };
      } else if (p in target) {
        return target[p];
      } else {
        return function() {
          return target.map((t) => t[p].apply(t, arguments));
        };
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
function isMarkType(type2) {
  return MARKS.hasOwnProperty(type2);
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
  let start2 = 0, i = 0;
  while (i < n) {
    i = find(s, i, COMMA, LBRACK + LBRACE, RBRACK + RBRACE);
    output.push(s.substring(start2, i).trim());
    start2 = ++i;
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
  let throttle = [0, 0], markname = 0, start2 = 0, n = s.length, i = 0, j, filter2;
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
    source.push(s.substring(start2, j).trim());
    start2 = i = ++j;
  }
  i = find(s, i, LBRACK);
  if (i === n) {
    source.push(s.substring(start2, n).trim());
  } else {
    source.push(s.substring(start2, i).trim());
    filter2 = [];
    start2 = ++i;
    if (start2 === n)
      throw "Unmatched left bracket: " + s;
  }
  while (i < n) {
    i = find(s, i, RBRACK);
    if (i === n)
      throw "Unmatched left bracket: " + s;
    filter2.push(s.substring(start2, i).trim());
    if (i < n - 1 && s[++i] !== LBRACK)
      throw "Expected left bracket: " + s;
    start2 = ++i;
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
  if (filter2 != null)
    stream.filter = filter2;
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
  constructor(baseName2, options) {
    var _a, _b, _c, _d, _e, _f;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName2;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName2;
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
    const mergeActions = actions.concat(this._actions);
    this._actions = mergeActions.filter((action, i) => i === mergeActions.findIndex((a) => a.action === action.action));
  }
  _parseEvent(event) {
    const flatStream = (stream) => "stream" in stream ? stream.between.concat(stream.stream).flatMap(flatStream) : "between" in stream ? stream.between.concat([{ type: stream.type }]).flatMap(flatStream) : stream.type;
    return parseEventSelector(event).flatMap(flatStream);
  }
  getAcceptEvents() {
    return this._actions.flatMap((action) => action.events.flatMap((event) => this._parseEvent(event)));
  }
  dispatch(event, layer) {
    const moveAction = this._actions.find((action) => (event instanceof Event ? action.events.includes(event.type) : action.events.includes(event)) && (!action.transition || action.transition.find((transition2) => transition2[0] === this._state)));
    if (moveAction) {
      if (event instanceof Event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const moveTransition = moveAction.transition && moveAction.transition.find((transition2) => transition2[0] === this._state);
      if (moveTransition) {
        this._state = moveTransition[1];
      }
      if (moveAction.sideEffect) {
        moveAction.sideEffect({
          self: this,
          layer,
          instrument: null,
          interactor: this,
          event
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
  static register(baseName2, options) {
    registeredInteractors[baseName2] = options;
  }
  static unregister(baseName2) {
    delete registeredInteractors[baseName2];
    return true;
  }
  static initialize(baseName2, options) {
    var _a;
    const mergedOptions = Object.assign({}, (_a = registeredInteractors[baseName2]) !== null && _a !== void 0 ? _a : { constructor: Interactor }, options !== null && options !== void 0 ? options : {});
    const service = new mergedOptions.constructor(baseName2, mergedOptions);
    return service;
  }
  static findInteractor(baseNameOrRealName) {
    return instanceInteractors.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
  }
};
var register2 = Interactor.register;
var unregister2 = Interactor.unregister;
var initialize2 = Interactor.initialize;
var findInteractor = Interactor.findInteractor;

// dist/esm/interactor/builtin.js
Interactor.register("MousePositionInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "hover",
      events: ["mousemove"]
    }
  ]
});
Interactor.register("MouseTraceInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "dragstart",
      events: ["mousedown"],
      transition: [["start", "drag"]]
    },
    {
      action: "drag",
      events: ["mousemove"],
      transition: [["drag", "drag"]]
    },
    {
      action: "dragend",
      events: ["mouseup"],
      transition: [["drag", "start"]]
    },
    {
      action: "dragabort",
      events: ["contextmenu"],
      transition: [
        ["drag", "start"],
        ["start", "start"]
      ]
    }
  ]
});

// dist/esm/interactor/index.js
var register3 = Interactor.register;
var initialize3 = Interactor.initialize;
var findInteractor2 = Interactor.findInteractor;
var Interactor2 = Interactor;

// dist/esm/service/service.js
var registeredServices = {};
var instanceServices = [];
var InteractionService = class {
  constructor(baseName2, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName2;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName2;
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
    if (!this._on[action]) {
      this._on[action] = [];
    }
    this._on[action].push(command);
  }
  getSharedVar(sharedName, options) {
    if (!(sharedName in this._sharedVar) && options && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }
  setSharedVar(sharedName, value, options) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (this._on.update) {
      this._on.update.forEach((command) => {
        var _a, _b, _c;
        return command.execute({
          self: this,
          layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : null,
          instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
          interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
        });
      });
    }
    if (this._on[`update:${sharedName}`]) {
      this._on[`update:${sharedName}`].forEach((command) => {
        var _a, _b, _c;
        return command.execute({
          self: this,
          layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : null,
          instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
          interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
        });
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
  static register(baseName2, options) {
    registeredServices[baseName2] = options;
  }
  static unregister(baseName2) {
    delete registeredServices[baseName2];
    return true;
  }
  static initialize(baseName2, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const mergedOptions = Object.assign({}, (_a = registeredServices[baseName2]) !== null && _a !== void 0 ? _a : { constructor: InteractionService }, options !== null && options !== void 0 ? options : {}, {
      on: Object.assign({}, (_c = ((_b = registeredServices[baseName2]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.on) !== null && _d !== void 0 ? _d : {}),
      sharedVar: Object.assign({}, (_f = ((_e = registeredServices[baseName2]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options === null || options === void 0 ? void 0 : options.sharedVar) !== null && _g !== void 0 ? _g : {})
    });
    const service = new mergedOptions.constructor(baseName2, mergedOptions);
    return service;
  }
  static findService(baseNameOrRealName) {
    return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
  }
};
var register4 = InteractionService.register;
var unregister3 = InteractionService.unregister;
var initialize4 = InteractionService.initialize;
var findService = InteractionService.findService;

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
      throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n)
        if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name)))
          return t;
      return;
    }
    if (callback != null && typeof callback !== "function")
      throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type)
        _[t] = set(_[t], typename.name, callback);
      else if (callback == null)
        for (t in _)
          _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _)
      copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type2, that) {
    if ((n = arguments.length - 2) > 0)
      for (var args = new Array(n), i = 0, n, t; i < n; ++i)
        args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type2))
      throw new Error("unknown type: " + type2);
    for (t = this._[type2], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  },
  apply: function(type2, that, args) {
    if (!this._.hasOwnProperty(type2))
      throw new Error("unknown type: " + type2);
    for (var t = this._[type2], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  }
};
function get(type2, name) {
  for (var i = 0, n = type2.length, c; i < n; ++i) {
    if ((c = type2[i]).name === name) {
      return c.value;
    }
  }
}
function set(type2, name, callback) {
  for (var i = 0, n = type2.length; i < n; ++i) {
    if (type2[i].name === name) {
      type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
      break;
    }
  }
  if (callback != null)
    type2.push({ name, value: callback });
  return type2;
}
var dispatch_default = dispatch;

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function")
    select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array_default(x) {
  return typeof x === "object" && "length" in x ? x : Array.from(x);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    var group = select.apply(this, arguments);
    return group == null ? [] : array_default(group);
  };
}
function selectAll_default(select) {
  if (typeof select === "function")
    select = arrayAll(select);
  else
    select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find2 = Array.prototype.find;
function childFind(match) {
  return function() {
    return find2.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return this.children;
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function")
    match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function")
    value = constant_default(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = array_default(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
  if (onupdate != null)
    update = onupdate(update);
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(selection2) {
  if (!(selection2 instanceof Selection))
    throw new Error("invalid merge");
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare)
    compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node)
        return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create2 = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames2(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type2, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type2, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params)
      event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
    else
      event.initEvent(type2, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params);
  };
}
function dispatchFunction(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params.apply(this, arguments));
  };
}
function dispatch_default2(type2, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default2,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}

// node_modules/d3-selection/src/selectAll.js
function selectAll_default2(selector) {
  return typeof selector === "string" ? new Selection([document.querySelectorAll(selector)], [document.documentElement]) : new Selection([selector == null ? [] : array_default(selector)], root);
}

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}
function rgb_formatRgb() {
  var a = this.opacity;
  a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (a === 1 ? ")" : ", " + a + ")");
}
function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0)
    h = s = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s = NaN;
  else if (s <= 0)
    h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Hsl();
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
  if (s) {
    if (r === max)
      h = (g - b) / s + (g < b) * 6;
    else if (g === max)
      h = (b - r) / s + 2;
    else
      h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(") + (this.h || 0) + ", " + (this.s || 0) * 100 + "%, " + (this.l || 0) * 100 + "%" + (a === 1 ? ")" : ", " + a + ")");
  }
}));
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

// node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default2 = (x) => () => x;

// node_modules/d3-interpolate/src/color.js
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb2(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i])
        s[i] += bm;
      else
        s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i])
      s[i] += bs;
    else
      s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2)
      s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b))
    a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d)
    c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d))
    c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c)
    a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null)
    return identity;
  if (!svgNode)
    svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate()))
    return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180)
        b += 360;
      else if (b - a > 180)
        a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function")
      throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail)
        taskTail._next = this;
      else
        taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0)
      t._call.call(null, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay)
    clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time)
        time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame)
    return;
  if (timeout)
    timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity)
      timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval)
      interval = clearInterval(interval);
  } else {
    if (!interval)
      clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules)
    node.__transition = {};
  else if (id2 in schedules)
    return;
  create(node, id2, {
    name,
    index,
    group,
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > CREATED)
    throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > STARTED)
    throw new Error("too late; already running");
  return schedule;
}
function get2(node, id2) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id2]))
    throw new Error("transition not found");
  return schedule;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule, 0, self.time);
  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed)
      start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED)
      return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name)
        continue;
      if (o.state === STARTED)
        return timeout_default(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING)
      return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules)
      return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name) {
  var schedules = node.__transition, schedule, active, empty2 = true, i;
  if (!schedules)
    return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty2)
    delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function")
    throw new Error();
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n)
        tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition2, name, value) {
  var id2 = transition2._id;
  transition2.each(function() {
    var schedule = set2(this, id2);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id2).value[name];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
  var c;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name, value) {
  var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  var fullname = namespace_default(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function delay_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id2, value) {
  return function() {
    set2(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set2(this, id2).duration = value;
  };
}
function duration_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id2, value) {
  if (typeof value !== "function")
    throw new Error();
  return function() {
    set2(this, id2).ease = value;
  };
}
function ease_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function")
      throw new Error();
    set2(this, id2).ease = v;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function")
    throw new Error();
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function")
    match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition2) {
  if (transition2._id !== this._id)
    throw new Error();
  for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0)
      t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set2;
  return function() {
    var schedule = sit(this, id2), on = schedule.on;
    if (on !== on0)
      (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function on_default2(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition)
      if (+i !== id2)
        return;
    if (parent)
      parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default3(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function")
    select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default3(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function")
    select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule_default(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null)
      string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
    if (on !== on0 || listener0 !== listener)
      (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get2(node, id0);
        schedule_default(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0)
        resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id2), on = schedule.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0)
      resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function transition(name) {
  return selection_default().transition(name);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default3,
  selectAll: selectAll_default3,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/brush.js
function number1(e) {
  return [+e[0], +e[1]];
}
function number2(e) {
  return [number1(e[0]), number1(e[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x, e) {
    return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e) {
    return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number2(xy);
  },
  output: function(xy) {
    return xy;
  }
};
function type(t) {
  return { type: t };
}

// node_modules/d3-zoom/src/transform.js
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity2 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom)
    if (!(node = node.parentNode))
      return identity2;
  return node.__zoom;
}

// dist/esm/service/selectionManager.js
var SelectionManager = class extends InteractionService {
  constructor() {
    super(...arguments);
    this._oldResult = [];
    this._result = [];
    this._nextTick = 0;
  }
  setSharedVar(sharedName, value, options) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (((options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances.length == 1) && this._userOptions.query) {
      const layer = (options === null || options === void 0 ? void 0 : options.layer) || this._layerInstances[0];
      if (this._nextTick) {
        cancelAnimationFrame(this._nextTick);
      }
      this._nextTick = requestAnimationFrame(() => {
        this._oldResult = this._result;
        this._result = layer.query({
          ...this._userOptions.query,
          ...this._sharedVar
        });
        const selectionLayer = layer.getSiblingLayer("selectionLayer").getGraphic();
        while (selectionLayer.firstChild) {
          selectionLayer.removeChild(selectionLayer.lastChild);
        }
        this._result.forEach((node) => selectionLayer.appendChild(select_default2(node).clone(false).node()));
        this._nextTick = 0;
        if (this._on.update) {
          this._on.update.forEach((command) => {
            var _a, _b, _c;
            return command.execute({
              self: this,
              layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : this._layerInstances.length == 1 ? this._layerInstances[0] : null,
              instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
              interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
            });
          });
        }
        if (this._on[`update:${sharedName}`]) {
          this._on[`update:${sharedName}`].forEach((command) => {
            var _a, _b, _c;
            return command.execute({
              self: this,
              layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : this._layerInstances.length == 1 ? this._layerInstances[0] : null,
              instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
              interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
            });
          });
        }
        this.postUpdate();
      });
    } else {
      if (this._on.update) {
        this._on.update.forEach((command) => {
          var _a, _b, _c;
          return command.execute({
            self: this,
            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : this._layerInstances.length == 1 ? this._layerInstances[0] : null,
            instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
            interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
          });
        });
      }
      if (this._on[`update:${sharedName}`]) {
        this._on[`update:${sharedName}`].forEach((command) => {
          var _a, _b, _c;
          return command.execute({
            self: this,
            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : this._layerInstances.length == 1 ? this._layerInstances[0] : null,
            instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
            interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null
          });
        });
      }
      this.postUpdate();
    }
  }
  isInstanceOf(name) {
    return name === "SelectionManager" || this._baseName === name || this._name === name;
  }
  get results() {
    return this._result;
  }
  get oldResults() {
    return this._oldResult;
  }
};
InteractionService.register("SelectionManager", {
  constructor: SelectionManager
});
InteractionService.register("SurfacePointSelectionManager", {
  constructor: SelectionManager,
  query: {
    baseOn: QueryType.Shape,
    type: ShapeQueryType.SurfacePoint,
    x: 0,
    y: 0
  }
});
InteractionService.register("PointSelectionManager", {
  constructor: SelectionManager,
  query: {
    baseOn: QueryType.Shape,
    type: ShapeQueryType.Point,
    x: 0,
    y: 0
  }
});
InteractionService.register("RectSelectionManager", {
  constructor: SelectionManager,
  query: {
    baseOn: QueryType.Shape,
    type: ShapeQueryType.Rect,
    x: 0,
    y: 0,
    width: 1,
    height: 1
  }
});
InteractionService.register("CircleSelectionManager", {
  constructor: SelectionManager,
  query: {
    baseOn: QueryType.Shape,
    type: ShapeQueryType.Circle,
    x: 0,
    y: 0,
    r: 1
  }
});
InteractionService.register("PolygonSelectionManager", {
  constructor: SelectionManager,
  query: {
    baseOn: QueryType.Shape,
    type: ShapeQueryType.Polygon,
    points: []
  }
});

// dist/esm/service/index.js
var findService2 = findService;
var InteractionService2 = InteractionService;

// dist/esm/layer/layer.js
var registeredLayers = {};
var instanceLayers = [];
var siblingLayers = new Map();
var Layer = class {
  constructor(baseName2, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName2;
    this._userOptions = options;
    this._name = (_a = options.name) !== null && _a !== void 0 ? _a : baseName2;
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
  redraw(data, scale, selection2) {
    this.preUpdate();
    if (this._redraw && this._redraw instanceof Function) {
      this._redraw(data, scale, selection2);
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
  getSiblingLayer(siblingLayerName) {
    if (!siblingLayers.has(this)) {
      siblingLayers.set(this, { [this._name]: this });
    }
    const siblings = siblingLayers.get(this);
    if (!(siblingLayerName in siblings)) {
      const layer = Layer.initialize(this._baseName, {
        ...this._userOptions,
        name: siblingLayerName
      });
      siblings[siblingLayerName] = layer;
      layer.getGraphic() && layer.getGraphic().style && (layer.getGraphic().style.pointerEvents = "none");
    }
    return siblings[siblingLayerName];
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
  get services() {
    return makeFindableList(this._serviceInstances.slice(0), InteractionService2, this.use.bind(this));
  }
};
function register5(baseName2, options) {
  registeredLayers[baseName2] = options;
}
function initialize5(baseName2, options) {
  var _a, _b, _c, _d, _e, _f, _g;
  const mergedOptions = Object.assign({}, (_a = registeredLayers[baseName2]) !== null && _a !== void 0 ? _a : { constructor: Layer }, options !== null && options !== void 0 ? options : {}, {
    transformation: Object.assign({}, (_c = ((_b = registeredLayers[baseName2]) !== null && _b !== void 0 ? _b : {}).transformation) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.transformation) !== null && _d !== void 0 ? _d : {}),
    sharedVar: Object.assign({}, (_f = ((_e = registeredLayers[baseName2]) !== null && _e !== void 0 ? _e : {}).sharedVar) !== null && _f !== void 0 ? _f : {}, (_g = options === null || options === void 0 ? void 0 : options.sharedVar) !== null && _g !== void 0 ? _g : {})
  });
  const layer = new mergedOptions.constructor(baseName2, mergedOptions);
  return layer;
}
function findLayer(baseNameOrRealName) {
  return instanceLayers.filter((layer) => layer.isInstanceOf(baseNameOrRealName));
}
Layer.register = register5;
Layer.initialize = initialize5;
Layer.findLayer = findLayer;

// dist/esm/layer/d3Layer.js
var baseName = "D3Layer";
var backgroundClassName = "ig-layer-background";
var D3Layer = class extends Layer {
  constructor(baseName2, options) {
    super(baseName2, options);
    this._width = options.width;
    this._height = options.height;
    this._graphic = select_default2(options.container).append("g").node();
    select_default2(this._graphic).append("rect").attr("class", backgroundClassName).attr("width", this._width).attr("height", this._height).attr("opacity", 0);
    let tempElem = this._container;
    while (tempElem && tempElem.tagName !== "svg")
      tempElem = tempElem.parentElement;
    if (tempElem.tagName !== "svg")
      throw Error("Container must be wrapped in SVGSVGElement");
    this._svg = tempElem;
    this._postInitialize && this._postInitialize.call(this, this);
  }
  getVisualElements() {
    const elems = [
      ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`)
    ];
    return elems;
  }
  select(selector) {
    return this._graphic.querySelectorAll(selector);
  }
  query(options) {
    if (options.baseOn === QueryType.Shape) {
      return this._shapeQuery(options);
    } else if (options.baseOn === QueryType.Data) {
      return this._dataQuery(options);
    } else if (options.baseOn === QueryType.Attr) {
      return this._attrQuery(options);
    }
    return [];
  }
  _isElementInLayer(elem) {
    return this._graphic.contains(elem) && !elem.classList.contains(backgroundClassName);
  }
  _shapeQuery(options) {
    let result = [];
    const svgBCR = this._svg.getBoundingClientRect();
    const layerBCR = this._graphic.getBoundingClientRect();
    if (options.type === ShapeQueryType.SurfacePoint) {
      const { x, y } = options;
      if (!isFinite(x) || !isFinite(y)) {
        return [];
      }
      result = [document.elementFromPoint(x, y)];
      if (!this._isElementInLayer(result[0])) {
        result = [];
      }
    } else if (options.type === ShapeQueryType.Point) {
      const { x, y } = options;
      if (!isFinite(x) || !isFinite(y)) {
        return [];
      }
      result = document.elementsFromPoint(x, y).filter(this._isElementInLayer.bind(this));
    } else if (options.type === ShapeQueryType.Circle) {
      const x = options.x - svgBCR.left, y = options.y - svgBCR.top, r = options.r;
      const innerRectWidth = Math.floor(r * Math.sin(Math.PI / 4)) << 1;
      const innerRectX = x - (innerRectWidth >>> 1);
      const innerRectY = y - (innerRectWidth >>> 1);
      const elemSet = new Set();
      const innerRect = this._svg.createSVGRect();
      innerRect.x = innerRectX;
      innerRect.y = innerRectY;
      innerRect.width = innerRectWidth;
      innerRect.height = innerRectWidth;
      this._svg.getIntersectionList(innerRect, this._graphic).forEach((elem) => elemSet.add(elem));
      for (let i = x - r; i <= x + r; i++) {
        for (let j = y - r; j <= y + r; j++) {
          if (innerRect.x < i && i < innerRect.x + innerRect.width && innerRect.y < j && j < innerRect.y + innerRect.y + innerRect.height)
            continue;
          document.elementsFromPoint(i + svgBCR.left, j + svgBCR.top).forEach((elem) => elemSet.add(elem));
        }
      }
      result = [...elemSet].filter(this._isElementInLayer);
    } else if (options.type === ShapeQueryType.Rect) {
      const { x, y, width, height } = options;
      const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
      const rect = this._svg.createSVGRect();
      rect.x = x0;
      rect.y = y0;
      rect.width = absWidth;
      rect.height = absHeight;
      result = [...this._svg.getIntersectionList(rect, this._graphic)].filter((elem) => !elem.classList.contains(backgroundClassName));
    } else if (options.type === ShapeQueryType.Polygon) {
    }
    const resultWithSVGGElement = [];
    while (result.length > 0) {
      const elem = result.shift();
      resultWithSVGGElement.push(elem);
      if (elem.parentElement.tagName === "g")
        result.push(elem.parentElement);
    }
    return resultWithSVGGElement;
  }
  _dataQuery(options) {
    let result = [];
    const visualElements = selectAll_default2(this.getVisualElements());
    if (options.type === DataQueryType.Quantitative) {
      const { attrName, extent } = options;
      result = visualElements.filter((d) => extent[0] < d[attrName] && d[attrName] < extent[1]).nodes();
    }
    if (options.type === DataQueryType.Quantitative2D) {
      const { attrNameX, extentX, attrNameY, extentY } = options;
      result = visualElements.filter((d) => extentX[0] < d[attrNameX] && d[attrNameX] < extentX[1] && extentY[0] < d[attrNameY] && d[attrNameY] < extentY[1]).nodes();
    } else if (options.type === DataQueryType.Nominal) {
      const { attrName, extent } = options;
      result = visualElements.filter((d) => extent.find(d[attrName])).nodes();
    } else if (options.type === DataQueryType.Temporal) {
      const { attrName, extent } = options;
      const dateParser = options.dateParser || ((d) => d);
      result = visualElements.filter((d) => extent[0].getTime() < dateParser(d[attrName]).getTime() && dateParser(d[attrName]).getTime() < extent[1].getTime()).nodes();
    }
    return result;
  }
  _attrQuery(options) {
    const { attrName, value } = options;
    const result = select_default2(this._graphic).filter((d) => d[attrName] === value).nodes();
    return result;
  }
};
Layer.D3Layer = D3Layer;
Layer.register(baseName, { constructor: D3Layer });
Layer.register(baseName, { constructor: D3Layer });

// dist/esm/layer/index.js
var Layer2 = Layer;

// dist/esm/instrument/instrument.js
var registeredInstruments = {};
var instanceInstruments = [];
var Instrument = class {
  constructor(baseName2, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    options.preInitialize && options.preInitialize.call(this, this);
    this._preInitialize = (_a = options.preInitialize) !== null && _a !== void 0 ? _a : null;
    this._postInitialize = (_b = options.postInitialize) !== null && _b !== void 0 ? _b : null;
    this._preUse = (_c = options.preUse) !== null && _c !== void 0 ? _c : null;
    this._postUse = (_d = options.postUse) !== null && _d !== void 0 ? _d : null;
    this._baseName = baseName2;
    this._userOptions = options;
    this._name = (_e = options.name) !== null && _e !== void 0 ? _e : baseName2;
    this._on = (_f = options.on) !== null && _f !== void 0 ? _f : {};
    this._interactors = [];
    this._layers = [];
    if (options.interactors) {
      options.interactors.forEach((interactor) => {
        if (typeof interactor === "string") {
          this.use(Interactor2.initialize(interactor));
        } else if ("options" in interactor) {
          if (typeof interactor.interactor === "string") {
            this.use(Interactor2.initialize(interactor.interactor, interactor.options));
          } else {
            this.use(interactor.interactor, interactor.options);
          }
        } else {
          this.use(interactor);
        }
      });
    }
    if (options.layers) {
      options.layers.forEach((layer) => {
        if ("options" in layer) {
          this.attach(layer.layer, layer.options);
        } else {
          this.attach(layer);
        }
      });
    }
    this._sharedVar = (_g = options.sharedVar) !== null && _g !== void 0 ? _g : {};
    options.postInitialize && options.postInitialize.call(this, this);
  }
  on(action, feedforwardOrCommand) {
    if (!this._on[action]) {
      this._on[action] = [];
    }
    this._on[action].push(feedforwardOrCommand);
  }
  off(action, feedforwardOrCommand) {
    if (!this._on[action])
      return;
    if (this._on[action].includes(feedforwardOrCommand)) {
      this._on[action].splice(this._on[action].indexOf(feedforwardOrCommand), 1);
    }
  }
  use(interactor, options) {
    interactor.preUse(this);
    if (arguments.length >= 2) {
      this._interactors.push({ interactor, options });
    } else {
      this._interactors.push(interactor);
    }
    interactor.setActions(interactor.getActions().map((action) => ({
      ...action,
      sideEffect: (options2) => {
        action.sideEffect && action.sideEffect(options2);
        this._on[action.action] && this._on[action.action].forEach((command) => {
          if (command instanceof Command2) {
            command.execute({
              ...options2,
              self: this,
              instrument: this
            });
          } else {
            command({
              ...options2,
              self: this,
              instrument: this
            });
          }
        });
      }
    })));
    this._layers.forEach((layer) => {
      let layr;
      if (layer instanceof Layer2) {
        layr = layer;
      } else {
        layr = layer.layer;
      }
      interactor.getAcceptEvents().forEach((event) => layr.getContainerGraphic().addEventListener(event, (e) => interactor.dispatch(e, layr)));
    });
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
    if (!(sharedName in this._sharedVar) && options && "defaultValue" in options) {
      this.setSharedVar(sharedName, options.defaultValue, options);
    }
    return this._sharedVar[sharedName];
  }
  setSharedVar(sharedName, value, options) {
    this._sharedVar[sharedName] = value;
    if (this._on[`update:${sharedName}`]) {
      const feedforwardOrCommands = this._on[`update:${sharedName}`];
      feedforwardOrCommands.forEach((feedforwardOrCommand) => {
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
      });
    }
  }
  watchSharedVar(sharedName, handler) {
    this.on(`update:${sharedName}`, handler);
  }
  preUse(layer) {
    this._preUse && this._preUse.call(this, this, layer);
    this._interactors.forEach((interactor) => {
      let inter;
      if (interactor instanceof Interactor2) {
        inter = interactor;
      } else {
        inter = interactor.interactor;
      }
      inter.getAcceptEvents().forEach((event) => layer.getContainerGraphic().addEventListener(event, (e) => inter.dispatch(e, layer)));
    });
  }
  postUse(layer) {
    this._postUse && this._postUse.call(this, this, layer);
  }
  isInstanceOf(name) {
    return this._baseName === name || this._name === name;
  }
  static register(baseName2, options) {
    registeredInstruments[baseName2] = options;
  }
  static unregister(baseName2) {
    delete registeredInstruments[baseName2];
    return true;
  }
  static initialize(baseName2, options) {
    var _a, _b, _c, _d;
    const mergedOptions = Object.assign({}, (_a = registeredInstruments[baseName2]) !== null && _a !== void 0 ? _a : { constructor: Instrument }, options !== null && options !== void 0 ? options : {}, {
      on: Object.assign({}, (_c = ((_b = registeredInstruments[baseName2]) !== null && _b !== void 0 ? _b : {}).on) !== null && _c !== void 0 ? _c : {}, (_d = options === null || options === void 0 ? void 0 : options.on) !== null && _d !== void 0 ? _d : {})
    });
    const service = new mergedOptions.constructor(baseName2, mergedOptions);
    return service;
  }
  static findInstrument(baseNameOrRealName) {
    return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
  }
};
var register6 = Instrument.register;
var unregister4 = Instrument.unregister;
var initialize6 = Instrument.initialize;
var findInstrument = Instrument.findInstrument;

// dist/esm/instrument/builtin.js
Instrument.register("HoverInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor"],
  on: {
    hover: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", event.clientY);
        });
      }
    ]
  },
  preUse: (instrument, layer) => {
    layer.services.find("SelectionManager", "SurfacePointSelectionManager");
  }
});
Instrument.register("BrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", event.clientY);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", 1);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("starty", event.clientY);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const startx = service.getSharedVar("startx");
          const starty = service.getSharedVar("starty");
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("y", Math.min(event.clientY, starty));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("height", Math.abs(event.clientY - starty));
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x} y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(event.clientX - startx)} height=${Math.abs(event.clientY - starty)} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      }
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          if (!instrument.getSharedVar("keepTransient")) {
            const transientLayer = layer.getSiblingLayer("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      }
    ],
    dragabort: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", 0);
          service.setSharedVar("y", 0);
          service.setSharedVar("width", 0);
          service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ]
  },
  preUse: (instrument, layer) => {
    layer.services.find("SelectionManager", "RectSelectionManager");
  }
});
Instrument.register("BrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", baseBBox.y);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", baseBBox.height);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("currentx", event.clientX);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const startx = service.getSharedVar("startx");
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("currentx", event.clientX);
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x}" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height}" class="transientRect" fill="#000" opacity="0.3" />`;
        });
      }
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("endx", event.clientX);
          if (!instrument.getSharedVar("keepTransient")) {
            const transientLayer = layer.getSiblingLayer("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      }
    ],
    dragabort: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", 0);
          service.setSharedVar("y", 0);
          service.setSharedVar("width", 0);
          service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("endx", event.clientX);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ]
  },
  preUse: (instrument, layer) => {
    layer.services.find("SelectionManager", "RectSelectionManager");
  }
});
Instrument.register("HelperBarInstrument", {
  constructor: Instrument,
  interactors: ["MousePositionInteractor"],
  on: {
    hover: [
      ({ event, layer, instrument }) => {
        console.log("hover");
        const height = layer.getSharedVar("height", 100);
        const transientLayer = layer.getSiblingLayer("transientLayer");
        const helperBar = transientLayer.getGraphic().querySelector("line");
        helperBar.setAttribute("transform", `translate(${event.offsetX - 50}, 0)`);
        instrument.setSharedVar("barX", event.offsetX - 50, {});
      }
    ]
  },
  preUse: function(instrument, layer) {
    console.log("preuse");
    const height = layer.getSharedVar("height", 100);
    const transientLayer = layer.getSiblingLayer("transientLayer");
    const helperBar = document.createElementNS("http://www.w3.org/2000/svg", "line");
    helperBar.setAttribute("x1", "0");
    helperBar.setAttribute("y1", "0");
    helperBar.setAttribute("x2", "0");
    helperBar.setAttribute("y2", `${height}`);
    helperBar.setAttribute("stroke", `black`);
    helperBar.setAttribute("stroke-width", `1px`);
    transientLayer.getGraphic().append(helperBar);
  }
});
Instrument.register("DataBrushInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", event.clientY);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", 1);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("starty", event.clientY);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("attrNameX", layer.getSharedVar("fieldX", service.getSharedVar("attrNameX")));
          service.setSharedVar("attrNameY", layer.getSharedVar("fieldY", service.getSharedVar("attrNameY")));
          service.setSharedVar("extentX", [0, 0]);
          service.setSharedVar("extentY", [0, 0]);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          const startx = service.getSharedVar("startx");
          const starty = service.getSharedVar("starty");
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("y", Math.min(event.clientY, starty));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("height", Math.abs(event.clientY - starty));
          service.setSharedVar("extentX", [event.clientX, startx].map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x)).sort((a, b) => a - b));
          service.setSharedVar("extentY", [event.clientY, starty].map((y) => layer.getSharedVar("scaleY").invert(y - baseBBox.y)).sort((a, b) => a - b));
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=${Math.min(event.clientX, startx) - baseBBox.x} y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(event.clientX - startx)} height=${Math.abs(event.clientY - starty)} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      }
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          if (!instrument.getSharedVar("keepTransient")) {
            const transientLayer = layer.getSiblingLayer("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      }
    ],
    dragabort: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", 0);
          service.setSharedVar("y", 0);
          service.setSharedVar("width", 0);
          service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("currenty", event.clientY);
          service.setSharedVar("endx", event.clientX);
          service.setSharedVar("endy", event.clientY);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ]
  },
  preUse: (instrument, layer) => {
    layer.services.find("SelectionManager", "RectSelectionManager");
  }
});
Instrument.register("DataBrushXInstrument", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          service.setSharedVar("x", event.clientX);
          service.setSharedVar("y", baseBBox.y);
          service.setSharedVar("width", 1);
          service.setSharedVar("height", baseBBox.height);
          service.setSharedVar("startx", event.clientX);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("attrName", layer.getSharedVar("fieldX", service.getSharedVar("attrName")));
          service.setSharedVar("extent", [0, 0]);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ],
    drag: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          const startx = service.getSharedVar("startx");
          const baseBBox = layer.getGraphic().getBoundingClientRect();
          service.setSharedVar("x", Math.min(event.clientX, startx));
          service.setSharedVar("width", Math.abs(event.clientX - startx));
          service.setSharedVar("extent", [event.clientX, startx].map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x)).sort((a, b) => a - b));
          service.setSharedVar("currentx", event.clientX);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x="${Math.min(event.clientX, startx) - baseBBox.x}" y="0" width="${Math.abs(event.clientX - startx)}" height="${baseBBox.height}" class="transientRect" fill="#000" opacity="0.3" />`;
        });
      }
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("endx", event.clientX);
          if (!instrument.getSharedVar("keepTransient")) {
            const transientLayer = layer.getSiblingLayer("transientLayer");
            transientLayer.getGraphic().innerHTML = "";
          }
        });
      }
    ],
    dragabort: [
      ({ event, layer }) => {
        layer.services.find("SelectionManager").forEach((service) => {
          service.setSharedVar("x", 0);
          service.setSharedVar("y", 0);
          service.setSharedVar("width", 0);
          service.setSharedVar("height", 0);
          service.setSharedVar("currentx", event.clientX);
          service.setSharedVar("endx", event.clientX);
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
      }
    ]
  },
  preUse: (instrument, layer) => {
    layer.services.find("SelectionManager", "RectSelectionManager");
  }
});

// dist/esm/instrument/index.js
var Instrument2 = Instrument;

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
