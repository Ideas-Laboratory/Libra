var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/esm/transformer/transformer.js
var _a, registeredTransformers, instanceTransformers, transientQueue, transientCleaner, GraphicalTransformer, register, unregister, initialize, findTransformer;
var init_transformer = __esm({
  "dist/esm/transformer/transformer.js"() {
    init_helpers();
    registeredTransformers = {};
    instanceTransformers = [];
    transientQueue = [];
    transientCleaner = () => {
      let transientElement;
      while (transientElement = transientQueue.pop()) {
        try {
          transientElement.remove();
        } catch (e) {
        }
      }
      if (!global.stopTransient) {
        instanceTransformers.filter((transformer) => transformer._transient).forEach((transformer) => transformer.redraw());
      }
      requestAnimationFrame(transientCleaner);
    };
    requestAnimationFrame(transientCleaner);
    GraphicalTransformer = class {
      constructor(baseName4, options) {
        this[_a] = true;
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? this._baseName;
        this._sharedVar = options.sharedVar ?? {};
        this._redraw = options.redraw ?? (() => {
        });
        this._layer = options.layer;
        this._transient = options.transient ?? false;
        try {
          this.redraw();
        } catch (e) {
        }
      }
      getSharedVar(name) {
        return this._sharedVar[name];
      }
      setSharedVar(name, value) {
        this._sharedVar[name] = value;
        this.redraw();
      }
      setSharedVars(obj) {
        Object.entries(obj).forEach(([k, v]) => this._sharedVar[k] = v);
        this.redraw();
      }
      redraw(transient = false) {
        if (!this._layer && !this.getSharedVar("layer"))
          return;
        const layer = this._layer || this.getSharedVar("layer");
        transient = transient || this._transient;
        let preDrawElements = [], postDrawElements = [], changedLayers = new Set([layer]);
        if (transient) {
          preDrawElements = layer.getVisualElements();
          if (!layer._getLayerFromQueue) {
            layer._getLayerFromQueue = layer.getLayerFromQueue;
            layer.getLayerFromQueue = function() {
              const result = layer._getLayerFromQueue(...arguments);
              preDrawElements = preDrawElements.concat(result.getVisualElements());
              changedLayers.add(result);
              return result;
            };
          }
        }
        this._redraw({
          layer,
          transformer: this
        });
        if (transient) {
          layer.getLayerFromQueue = layer._getLayerFromQueue;
          delete layer._getLayerFromQueue;
          changedLayers.forEach((layer2) => {
            postDrawElements = postDrawElements.concat(Array.prototype.slice.call(layer2.getGraphic()?.childNodes ?? []));
            const transientElements = postDrawElements.filter((el) => !preDrawElements.includes(el));
            transientQueue = transientQueue.concat(transientElements);
          });
        }
      }
      isInstanceOf(name) {
        return this._baseName === name || this._name === name || (this._userOptions.className ?? []).includes(name);
      }
      static register(baseName4, options) {
        registeredTransformers[baseName4] = options;
      }
      static unregister(baseName4) {
        delete registeredTransformers[baseName4];
        return true;
      }
      static initialize(baseName4, options) {
        const mergedOptions = Object.assign({ constructor: GraphicalTransformer }, registeredTransformers[baseName4] ?? {}, options ?? {}, {
          sharedVar: Object.assign({}, (registeredTransformers[baseName4] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {})
        });
        const transformer = new mergedOptions.constructor(baseName4, mergedOptions);
        instanceTransformers.push(transformer);
        return transformer;
      }
      static findTransformer(baseNameOrRealName) {
        return instanceTransformers.filter((transformer) => transformer.isInstanceOf(baseNameOrRealName));
      }
      static findTransformerByLayer(layer) {
        return instanceTransformers.filter((t) => t._layer === layer || t.getSharedVar("layer") === layer);
      }
    };
    _a = LibraSymbol;
    register = GraphicalTransformer.register;
    unregister = GraphicalTransformer.unregister;
    initialize = GraphicalTransformer.initialize;
    findTransformer = GraphicalTransformer.findTransformer;
  }
});

// node_modules/d3/dist/package.js
var init_package = __esm({
  "node_modules/d3/dist/package.js"() {
  }
});

// node_modules/d3/node_modules/d3-array/src/mean.js
function mean(values, valueof) {
  let count = 0;
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  }
  if (count)
    return sum2 / count;
}
var init_mean = __esm({
  "node_modules/d3/node_modules/d3-array/src/mean.js"() {
  }
});

// node_modules/d3/node_modules/d3-array/src/sum.js
function sum(values, valueof) {
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value = +value) {
        sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum2 += value;
      }
    }
  }
  return sum2;
}
var init_sum = __esm({
  "node_modules/d3/node_modules/d3-array/src/sum.js"() {
  }
});

// node_modules/d3/node_modules/d3-array/src/index.js
var init_src = __esm({
  "node_modules/d3/node_modules/d3-array/src/index.js"() {
    init_mean();
    init_sum();
  }
});

// node_modules/d3-axis/src/index.js
var init_src2 = __esm({
  "node_modules/d3-axis/src/index.js"() {
  }
});

// node_modules/d3-dispatch/src/dispatch.js
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
var noop, dispatch_default;
var init_dispatch = __esm({
  "node_modules/d3-dispatch/src/dispatch.js"() {
    noop = { value: () => {
    } };
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
    dispatch_default = dispatch;
  }
});

// node_modules/d3-dispatch/src/index.js
var init_src3 = __esm({
  "node_modules/d3-dispatch/src/index.js"() {
    init_dispatch();
  }
});

// node_modules/d3-selection/src/namespaces.js
var xhtml, namespaces_default;
var init_namespaces = __esm({
  "node_modules/d3-selection/src/namespaces.js"() {
    xhtml = "http://www.w3.org/1999/xhtml";
    namespaces_default = {
      svg: "http://www.w3.org/2000/svg",
      xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };
  }
});

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}
var init_namespace = __esm({
  "node_modules/d3-selection/src/namespace.js"() {
    init_namespaces();
  }
});

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
var init_creator = __esm({
  "node_modules/d3-selection/src/creator.js"() {
    init_namespace();
    init_namespaces();
  }
});

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}
var init_selector = __esm({
  "node_modules/d3-selection/src/selector.js"() {
  }
});

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
var init_select = __esm({
  "node_modules/d3-selection/src/selection/select.js"() {
    init_selection();
    init_selector();
  }
});

// node_modules/d3-selection/src/array.js
function array_default(x) {
  return typeof x === "object" && "length" in x ? x : Array.from(x);
}
var init_array = __esm({
  "node_modules/d3-selection/src/array.js"() {
  }
});

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}
var init_selectorAll = __esm({
  "node_modules/d3-selection/src/selectorAll.js"() {
  }
});

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
var init_selectAll = __esm({
  "node_modules/d3-selection/src/selection/selectAll.js"() {
    init_selection();
    init_array();
    init_selectorAll();
  }
});

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
var init_matcher = __esm({
  "node_modules/d3-selection/src/matcher.js"() {
  }
});

// node_modules/d3-selection/src/selection/selectChild.js
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var find;
var init_selectChild = __esm({
  "node_modules/d3-selection/src/selection/selectChild.js"() {
    init_matcher();
    find = Array.prototype.find;
  }
});

// node_modules/d3-selection/src/selection/selectChildren.js
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
var filter;
var init_selectChildren = __esm({
  "node_modules/d3-selection/src/selection/selectChildren.js"() {
    init_matcher();
    filter = Array.prototype.filter;
  }
});

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
var init_filter = __esm({
  "node_modules/d3-selection/src/selection/filter.js"() {
    init_selection();
    init_matcher();
  }
});

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}
var init_sparse = __esm({
  "node_modules/d3-selection/src/selection/sparse.js"() {
  }
});

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
var init_enter = __esm({
  "node_modules/d3-selection/src/selection/enter.js"() {
    init_sparse();
    init_selection();
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
  }
});

// node_modules/d3-selection/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}
var init_constant = __esm({
  "node_modules/d3-selection/src/constant.js"() {
  }
});

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
var init_data = __esm({
  "node_modules/d3-selection/src/selection/data.js"() {
    init_selection();
    init_enter();
    init_array();
    init_constant();
  }
});

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}
var init_exit = __esm({
  "node_modules/d3-selection/src/selection/exit.js"() {
    init_sparse();
    init_selection();
  }
});

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
var init_join = __esm({
  "node_modules/d3-selection/src/selection/join.js"() {
  }
});

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
var init_merge = __esm({
  "node_modules/d3-selection/src/selection/merge.js"() {
    init_selection();
  }
});

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
var init_order = __esm({
  "node_modules/d3-selection/src/selection/order.js"() {
  }
});

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
var init_sort = __esm({
  "node_modules/d3-selection/src/selection/sort.js"() {
    init_selection();
  }
});

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
var init_call = __esm({
  "node_modules/d3-selection/src/selection/call.js"() {
  }
});

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}
var init_nodes = __esm({
  "node_modules/d3-selection/src/selection/nodes.js"() {
  }
});

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
var init_node = __esm({
  "node_modules/d3-selection/src/selection/node.js"() {
  }
});

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}
var init_size = __esm({
  "node_modules/d3-selection/src/selection/size.js"() {
  }
});

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}
var init_empty = __esm({
  "node_modules/d3-selection/src/selection/empty.js"() {
  }
});

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
var init_each = __esm({
  "node_modules/d3-selection/src/selection/each.js"() {
  }
});

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
var init_attr = __esm({
  "node_modules/d3-selection/src/selection/attr.js"() {
    init_namespace();
  }
});

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
var init_window = __esm({
  "node_modules/d3-selection/src/window.js"() {
  }
});

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
var init_style = __esm({
  "node_modules/d3-selection/src/selection/style.js"() {
    init_window();
  }
});

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
var init_property = __esm({
  "node_modules/d3-selection/src/selection/property.js"() {
  }
});

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
var init_classed = __esm({
  "node_modules/d3-selection/src/selection/classed.js"() {
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
  }
});

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
var init_text = __esm({
  "node_modules/d3-selection/src/selection/text.js"() {
  }
});

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
var init_html = __esm({
  "node_modules/d3-selection/src/selection/html.js"() {
  }
});

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}
var init_raise = __esm({
  "node_modules/d3-selection/src/selection/raise.js"() {
  }
});

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}
var init_lower = __esm({
  "node_modules/d3-selection/src/selection/lower.js"() {
  }
});

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create2 = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
var init_append = __esm({
  "node_modules/d3-selection/src/selection/append.js"() {
    init_creator();
  }
});

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
var init_insert = __esm({
  "node_modules/d3-selection/src/selection/insert.js"() {
    init_creator();
    init_selector();
  }
});

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}
var init_remove = __esm({
  "node_modules/d3-selection/src/selection/remove.js"() {
  }
});

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
var init_clone = __esm({
  "node_modules/d3-selection/src/selection/clone.js"() {
  }
});

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
var init_datum = __esm({
  "node_modules/d3-selection/src/selection/datum.js"() {
  }
});

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
var init_on = __esm({
  "node_modules/d3-selection/src/selection/on.js"() {
  }
});

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
var init_dispatch2 = __esm({
  "node_modules/d3-selection/src/selection/dispatch.js"() {
    init_window();
  }
});

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}
var init_iterator = __esm({
  "node_modules/d3-selection/src/selection/iterator.js"() {
  }
});

// node_modules/d3-selection/src/selection/index.js
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
var root, selection_default;
var init_selection = __esm({
  "node_modules/d3-selection/src/selection/index.js"() {
    init_select();
    init_selectAll();
    init_selectChild();
    init_selectChildren();
    init_filter();
    init_data();
    init_enter();
    init_exit();
    init_join();
    init_merge();
    init_order();
    init_sort();
    init_call();
    init_nodes();
    init_node();
    init_size();
    init_empty();
    init_each();
    init_attr();
    init_style();
    init_property();
    init_classed();
    init_text();
    init_html();
    init_raise();
    init_lower();
    init_append();
    init_insert();
    init_remove();
    init_clone();
    init_datum();
    init_on();
    init_dispatch2();
    init_iterator();
    root = [null];
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
    selection_default = selection;
  }
});

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}
var init_select2 = __esm({
  "node_modules/d3-selection/src/select.js"() {
    init_selection();
  }
});

// node_modules/d3-selection/src/sourceEvent.js
function sourceEvent_default(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent)
    event = sourceEvent;
  return event;
}
var init_sourceEvent = __esm({
  "node_modules/d3-selection/src/sourceEvent.js"() {
  }
});

// node_modules/d3-selection/src/pointer.js
function pointer_default(event, node) {
  event = sourceEvent_default(event);
  if (node === void 0)
    node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
var init_pointer = __esm({
  "node_modules/d3-selection/src/pointer.js"() {
    init_sourceEvent();
  }
});

// node_modules/d3-selection/src/selectAll.js
function selectAll_default2(selector) {
  return typeof selector === "string" ? new Selection([document.querySelectorAll(selector)], [document.documentElement]) : new Selection([selector == null ? [] : array_default(selector)], root);
}
var init_selectAll2 = __esm({
  "node_modules/d3-selection/src/selectAll.js"() {
    init_array();
    init_selection();
  }
});

// node_modules/d3-selection/src/index.js
var init_src4 = __esm({
  "node_modules/d3-selection/src/index.js"() {
    init_matcher();
    init_namespace();
    init_pointer();
    init_select2();
    init_selectAll2();
    init_selection();
    init_selector();
    init_selectorAll();
    init_style();
  }
});

// node_modules/d3-drag/src/index.js
var init_src5 = __esm({
  "node_modules/d3-drag/src/index.js"() {
  }
});

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
var init_define = __esm({
  "node_modules/d3-color/src/define.js"() {
  }
});

// node_modules/d3-color/src/color.js
function Color() {
}
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
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
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
var darker, brighter, reI, reN, reP, reHex, reRgbInteger, reRgbPercent, reRgbaInteger, reRgbaPercent, reHslPercent, reHslaPercent, named;
var init_color = __esm({
  "node_modules/d3-color/src/color.js"() {
    init_define();
    darker = 0.7;
    brighter = 1 / darker;
    reI = "\\s*([+-]?\\d+)\\s*";
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
    reHex = /^#([0-9a-f]{3,8})$/;
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");
    named = {
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
  }
});

// node_modules/d3-color/src/index.js
var init_src6 = __esm({
  "node_modules/d3-color/src/index.js"() {
    init_color();
  }
});

// node_modules/d3-interpolate/src/basis.js
function basis(t12, v0, v1, v2, v3) {
  var t2 = t12 * t12, t3 = t2 * t12;
  return ((1 - 3 * t12 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t12 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
var init_basis = __esm({
  "node_modules/d3-interpolate/src/basis.js"() {
  }
});

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
var init_basisClosed = __esm({
  "node_modules/d3-interpolate/src/basisClosed.js"() {
    init_basis();
  }
});

// node_modules/d3-interpolate/src/constant.js
var constant_default2;
var init_constant2 = __esm({
  "node_modules/d3-interpolate/src/constant.js"() {
    constant_default2 = (x) => () => x;
  }
});

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
var init_color2 = __esm({
  "node_modules/d3-interpolate/src/color.js"() {
    init_constant2();
  }
});

// node_modules/d3-interpolate/src/rgb.js
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
var rgb_default, rgbBasis, rgbBasisClosed;
var init_rgb = __esm({
  "node_modules/d3-interpolate/src/rgb.js"() {
    init_src6();
    init_basis();
    init_basisClosed();
    init_color2();
    rgb_default = function rgbGamma(y) {
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
    rgbBasis = rgbSpline(basis_default);
    rgbBasisClosed = rgbSpline(basisClosed_default);
  }
});

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}
var init_number = __esm({
  "node_modules/d3-interpolate/src/number.js"() {
  }
});

// node_modules/d3-interpolate/src/string.js
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
var reA, reB;
var init_string = __esm({
  "node_modules/d3-interpolate/src/string.js"() {
    init_number();
    reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
    reB = new RegExp(reA.source, "g");
  }
});

// node_modules/d3-interpolate/src/transform/decompose.js
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
var degrees, identity;
var init_decompose = __esm({
  "node_modules/d3-interpolate/src/transform/decompose.js"() {
    degrees = 180 / Math.PI;
    identity = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };
  }
});

// node_modules/d3-interpolate/src/transform/parse.js
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
var svgNode;
var init_parse = __esm({
  "node_modules/d3-interpolate/src/transform/parse.js"() {
    init_decompose();
  }
});

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate2(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate2(a, b, s, q) {
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
  function scale2(xa, ya, xb, yb, s, q) {
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
    translate2(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate2(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale2(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss, interpolateTransformSvg;
var init_transform = __esm({
  "node_modules/d3-interpolate/src/transform/index.js"() {
    init_number();
    init_parse();
    interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
  }
});

// node_modules/d3-interpolate/src/index.js
var init_src7 = __esm({
  "node_modules/d3-interpolate/src/index.js"() {
    init_number();
    init_string();
    init_transform();
    init_rgb();
  }
});

// node_modules/d3-timer/src/timer.js
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
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
  var t02, t12 = taskHead, t2, time = Infinity;
  while (t12) {
    if (t12._call) {
      if (time > t12._time)
        time = t12._time;
      t02 = t12, t12 = t12._next;
    } else {
      t2 = t12._next, t12._next = null;
      t12 = t02 ? t02._next = t2 : taskHead = t2;
    }
  }
  taskTail = t02;
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
var frame, timeout, interval, pokeDelay, taskHead, taskTail, clockLast, clockNow, clockSkew, clock, setFrame;
var init_timer = __esm({
  "node_modules/d3-timer/src/timer.js"() {
    frame = 0;
    timeout = 0;
    interval = 0;
    pokeDelay = 1e3;
    clockLast = 0;
    clockNow = 0;
    clockSkew = 0;
    clock = typeof performance === "object" && performance.now ? performance : Date;
    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
      setTimeout(f, 17);
    };
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
  }
});

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
var init_timeout = __esm({
  "node_modules/d3-timer/src/timeout.js"() {
    init_timer();
  }
});

// node_modules/d3-timer/src/index.js
var init_src8 = __esm({
  "node_modules/d3-timer/src/index.js"() {
    init_timer();
    init_timeout();
  }
});

// node_modules/d3-transition/src/transition/schedule.js
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
var emptyOn, emptyTween, CREATED, SCHEDULED, STARTING, STARTED, RUNNING, ENDING, ENDED;
var init_schedule = __esm({
  "node_modules/d3-transition/src/transition/schedule.js"() {
    init_src3();
    init_src8();
    emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
    emptyTween = [];
    CREATED = 0;
    SCHEDULED = 1;
    STARTING = 2;
    STARTED = 3;
    RUNNING = 4;
    ENDING = 5;
    ENDED = 6;
  }
});

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
var init_interrupt = __esm({
  "node_modules/d3-transition/src/interrupt.js"() {
    init_schedule();
  }
});

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}
var init_interrupt2 = __esm({
  "node_modules/d3-transition/src/selection/interrupt.js"() {
    init_interrupt();
  }
});

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
var init_tween = __esm({
  "node_modules/d3-transition/src/transition/tween.js"() {
    init_schedule();
  }
});

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
  var c;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}
var init_interpolate = __esm({
  "node_modules/d3-transition/src/transition/interpolate.js"() {
    init_src6();
    init_src7();
  }
});

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
var init_attr2 = __esm({
  "node_modules/d3-transition/src/transition/attr.js"() {
    init_src7();
    init_src4();
    init_tween();
    init_interpolate();
  }
});

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
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && attrInterpolate(name, i);
    return t02;
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
var init_attrTween = __esm({
  "node_modules/d3-transition/src/transition/attrTween.js"() {
    init_src4();
  }
});

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
var init_delay = __esm({
  "node_modules/d3-transition/src/transition/delay.js"() {
    init_schedule();
  }
});

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
var init_duration = __esm({
  "node_modules/d3-transition/src/transition/duration.js"() {
    init_schedule();
  }
});

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
var init_ease = __esm({
  "node_modules/d3-transition/src/transition/ease.js"() {
    init_schedule();
  }
});

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
var init_easeVarying = __esm({
  "node_modules/d3-transition/src/transition/easeVarying.js"() {
    init_schedule();
  }
});

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
var init_filter2 = __esm({
  "node_modules/d3-transition/src/transition/filter.js"() {
    init_src4();
    init_transition2();
  }
});

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
var init_merge2 = __esm({
  "node_modules/d3-transition/src/transition/merge.js"() {
    init_transition2();
  }
});

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
var init_on2 = __esm({
  "node_modules/d3-transition/src/transition/on.js"() {
    init_schedule();
  }
});

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
var init_remove2 = __esm({
  "node_modules/d3-transition/src/transition/remove.js"() {
  }
});

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
var init_select3 = __esm({
  "node_modules/d3-transition/src/transition/select.js"() {
    init_src4();
    init_transition2();
    init_schedule();
  }
});

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
var init_selectAll3 = __esm({
  "node_modules/d3-transition/src/transition/selectAll.js"() {
    init_src4();
    init_transition2();
    init_schedule();
  }
});

// node_modules/d3-transition/src/transition/selection.js
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}
var Selection2;
var init_selection2 = __esm({
  "node_modules/d3-transition/src/transition/selection.js"() {
    init_src4();
    Selection2 = selection_default.prototype.constructor;
  }
});

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
var init_style2 = __esm({
  "node_modules/d3-transition/src/transition/style.js"() {
    init_src7();
    init_src4();
    init_schedule();
    init_tween();
    init_interpolate();
  }
});

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
var init_styleTween = __esm({
  "node_modules/d3-transition/src/transition/styleTween.js"() {
  }
});

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
var init_text2 = __esm({
  "node_modules/d3-transition/src/transition/text.js"() {
    init_tween();
  }
});

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && textInterpolate(i);
    return t02;
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
var init_textTween = __esm({
  "node_modules/d3-transition/src/transition/textTween.js"() {
  }
});

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
var init_transition = __esm({
  "node_modules/d3-transition/src/transition/transition.js"() {
    init_transition2();
    init_schedule();
  }
});

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
var init_end = __esm({
  "node_modules/d3-transition/src/transition/end.js"() {
    init_schedule();
  }
});

// node_modules/d3-transition/src/transition/index.js
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
var id, selection_prototype;
var init_transition2 = __esm({
  "node_modules/d3-transition/src/transition/index.js"() {
    init_src4();
    init_attr2();
    init_attrTween();
    init_delay();
    init_duration();
    init_ease();
    init_easeVarying();
    init_filter2();
    init_merge2();
    init_on2();
    init_remove2();
    init_select3();
    init_selectAll3();
    init_selection2();
    init_style2();
    init_styleTween();
    init_text2();
    init_textTween();
    init_transition();
    init_tween();
    init_end();
    id = 0;
    selection_prototype = selection_default.prototype;
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
  }
});

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var init_cubic = __esm({
  "node_modules/d3-ease/src/cubic.js"() {
  }
});

// node_modules/d3-ease/src/index.js
var init_src9 = __esm({
  "node_modules/d3-ease/src/index.js"() {
    init_cubic();
  }
});

// node_modules/d3-transition/src/selection/transition.js
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
var defaultTiming;
var init_transition3 = __esm({
  "node_modules/d3-transition/src/selection/transition.js"() {
    init_transition2();
    init_schedule();
    init_src9();
    init_src8();
    defaultTiming = {
      time: null,
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };
  }
});

// node_modules/d3-transition/src/selection/index.js
var init_selection3 = __esm({
  "node_modules/d3-transition/src/selection/index.js"() {
    init_src4();
    init_interrupt2();
    init_transition3();
    selection_default.prototype.interrupt = interrupt_default2;
    selection_default.prototype.transition = transition_default2;
  }
});

// node_modules/d3-transition/src/active.js
var init_active = __esm({
  "node_modules/d3-transition/src/active.js"() {
    init_transition2();
    init_schedule();
  }
});

// node_modules/d3-transition/src/index.js
var init_src10 = __esm({
  "node_modules/d3-transition/src/index.js"() {
    init_selection3();
    init_transition2();
    init_active();
    init_interrupt();
  }
});

// node_modules/d3-brush/src/constant.js
var init_constant3 = __esm({
  "node_modules/d3-brush/src/constant.js"() {
  }
});

// node_modules/d3-brush/src/event.js
var init_event = __esm({
  "node_modules/d3-brush/src/event.js"() {
  }
});

// node_modules/d3-brush/src/noevent.js
var init_noevent = __esm({
  "node_modules/d3-brush/src/noevent.js"() {
  }
});

// node_modules/d3-brush/src/brush.js
function number1(e) {
  return [+e[0], +e[1]];
}
function number2(e) {
  return [number1(e[0]), number1(e[1])];
}
function type(t) {
  return { type: t };
}
var X, Y, XY;
var init_brush = __esm({
  "node_modules/d3-brush/src/brush.js"() {
    init_src10();
    init_constant3();
    init_event();
    init_noevent();
    X = {
      name: "x",
      handles: ["w", "e"].map(type),
      input: function(x, e) {
        return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
      },
      output: function(xy) {
        return xy && [xy[0][0], xy[1][0]];
      }
    };
    Y = {
      name: "y",
      handles: ["n", "s"].map(type),
      input: function(y, e) {
        return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
      },
      output: function(xy) {
        return xy && [xy[0][1], xy[1][1]];
      }
    };
    XY = {
      name: "xy",
      handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
      input: function(xy) {
        return xy == null ? null : number2(xy);
      },
      output: function(xy) {
        return xy;
      }
    };
  }
});

// node_modules/d3-brush/src/index.js
var init_src11 = __esm({
  "node_modules/d3-brush/src/index.js"() {
    init_brush();
  }
});

// node_modules/d3-path/src/index.js
var init_src12 = __esm({
  "node_modules/d3-path/src/index.js"() {
  }
});

// node_modules/d3-chord/src/index.js
var init_src13 = __esm({
  "node_modules/d3-chord/src/index.js"() {
  }
});

// node_modules/d3-contour/src/index.js
var init_src14 = __esm({
  "node_modules/d3-contour/src/index.js"() {
  }
});

// node_modules/d3-delaunay/src/index.js
var init_src15 = __esm({
  "node_modules/d3-delaunay/src/index.js"() {
  }
});

// node_modules/d3-dsv/src/index.js
var init_src16 = __esm({
  "node_modules/d3-dsv/src/index.js"() {
  }
});

// node_modules/d3-fetch/src/index.js
var init_src17 = __esm({
  "node_modules/d3-fetch/src/index.js"() {
  }
});

// node_modules/d3-quadtree/src/index.js
var init_src18 = __esm({
  "node_modules/d3-quadtree/src/index.js"() {
  }
});

// node_modules/d3-force/src/index.js
var init_src19 = __esm({
  "node_modules/d3-force/src/index.js"() {
  }
});

// node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x) {
  return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0)
    return null;
  var i, coefficient = x.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}
var init_formatDecimal = __esm({
  "node_modules/d3-format/src/formatDecimal.js"() {
  }
});

// node_modules/d3-format/src/exponent.js
function exponent_default(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}
var init_exponent = __esm({
  "node_modules/d3-format/src/exponent.js"() {
    init_formatDecimal();
  }
});

// node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width)
        g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width)
        break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}
var init_formatGroup = __esm({
  "node_modules/d3-format/src/formatGroup.js"() {
  }
});

// node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}
var init_formatNumerals = __esm({
  "node_modules/d3-format/src/formatNumerals.js"() {
  }
});

// node_modules/d3-format/src/formatSpecifier.js
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier)))
    throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
var re;
var init_formatSpecifier = __esm({
  "node_modules/d3-format/src/formatSpecifier.js"() {
    re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
    formatSpecifier.prototype = FormatSpecifier.prototype;
    FormatSpecifier.prototype.toString = function() {
      return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
    };
  }
});

// node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
  out:
    for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0)
            i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i])
            break out;
          if (i0 > 0)
            i0 = 0;
          break;
      }
    }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
var init_formatTrim = __esm({
  "node_modules/d3-format/src/formatTrim.js"() {
  }
});

// node_modules/d3-format/src/formatPrefixAuto.js
function formatPrefixAuto_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}
var prefixExponent;
var init_formatPrefixAuto = __esm({
  "node_modules/d3-format/src/formatPrefixAuto.js"() {
    init_formatDecimal();
  }
});

// node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}
var init_formatRounded = __esm({
  "node_modules/d3-format/src/formatRounded.js"() {
    init_formatDecimal();
  }
});

// node_modules/d3-format/src/formatTypes.js
var formatTypes_default;
var init_formatTypes = __esm({
  "node_modules/d3-format/src/formatTypes.js"() {
    init_formatDecimal();
    init_formatPrefixAuto();
    init_formatRounded();
    formatTypes_default = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal_default,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded_default(x * 100, p),
      "r": formatRounded_default,
      "s": formatPrefixAuto_default,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };
  }
});

// node_modules/d3-format/src/identity.js
function identity_default(x) {
  return x;
}
var init_identity = __esm({
  "node_modules/d3-format/src/identity.js"() {
  }
});

// node_modules/d3-format/src/locale.js
function locale_default(locale3) {
  var group = locale3.grouping === void 0 || locale3.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale3.grouping, Number), locale3.thousands + ""), currencyPrefix = locale3.currency === void 0 ? "" : locale3.currency[0] + "", currencySuffix = locale3.currency === void 0 ? "" : locale3.currency[1] + "", decimal = locale3.decimal === void 0 ? "." : locale3.decimal + "", numerals = locale3.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale3.numerals, String)), percent = locale3.percent === void 0 ? "%" : locale3.percent + "", minus = locale3.minus === void 0 ? "\u2212" : locale3.minus + "", nan = locale3.nan === void 0 ? "NaN" : locale3.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type2 = specifier.type;
    if (type2 === "n")
      comma = true, type2 = "g";
    else if (!formatTypes_default[type2])
      precision === void 0 && (precision = 12), trim = true, type2 = "g";
    if (zero2 || fill === "0" && align === "=")
      zero2 = true, fill = "0", align = "=";
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type2) ? "0" + type2.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type2) ? percent : "";
    var formatType = formatTypes_default[type2], maybeSuffix = /[defgprs%]/.test(type2);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type2) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
      if (type2 === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim)
          value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+")
          valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type2 === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero2)
        value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero2)
        value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
    return function(value2) {
      return f(k * value2) + prefix;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}
var map, prefixes;
var init_locale = __esm({
  "node_modules/d3-format/src/locale.js"() {
    init_exponent();
    init_formatGroup();
    init_formatNumerals();
    init_formatSpecifier();
    init_formatTrim();
    init_formatTypes();
    init_formatPrefixAuto();
    init_identity();
    map = Array.prototype.map;
    prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  }
});

// node_modules/d3-format/src/defaultLocale.js
function defaultLocale(definition) {
  locale = locale_default(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}
var locale, format, formatPrefix;
var init_defaultLocale = __esm({
  "node_modules/d3-format/src/defaultLocale.js"() {
    init_locale();
    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });
  }
});

// node_modules/d3-format/src/index.js
var init_src20 = __esm({
  "node_modules/d3-format/src/index.js"() {
    init_defaultLocale();
  }
});

// node_modules/d3/node_modules/d3-geo/src/index.js
var init_src21 = __esm({
  "node_modules/d3/node_modules/d3-geo/src/index.js"() {
  }
});

// node_modules/d3-hierarchy/src/index.js
var init_src22 = __esm({
  "node_modules/d3-hierarchy/src/index.js"() {
  }
});

// node_modules/d3-polygon/src/index.js
var init_src23 = __esm({
  "node_modules/d3-polygon/src/index.js"() {
  }
});

// node_modules/d3-random/src/index.js
var init_src24 = __esm({
  "node_modules/d3-random/src/index.js"() {
  }
});

// node_modules/d3-time/src/interval.js
function newInterval(floori, offseti, count, field) {
  function interval2(date) {
    return floori(date = arguments.length === 0 ? new Date() : new Date(+date)), date;
  }
  interval2.floor = function(date) {
    return floori(date = new Date(+date)), date;
  };
  interval2.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };
  interval2.round = function(date) {
    var d0 = interval2(date), d1 = interval2.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };
  interval2.offset = function(date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };
  interval2.range = function(start2, stop, step) {
    var range = [], previous;
    start2 = interval2.ceil(start2);
    step = step == null ? 1 : Math.floor(step);
    if (!(start2 < stop) || !(step > 0))
      return range;
    do
      range.push(previous = new Date(+start2)), offseti(start2, step), floori(start2);
    while (previous < start2 && start2 < stop);
    return range;
  };
  interval2.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date)
        while (floori(date), !test(date))
          date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) {
        if (step < 0)
          while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {
            }
          }
        else
          while (--step >= 0) {
            while (offseti(date, 1), !test(date)) {
            }
          }
      }
    });
  };
  if (count) {
    interval2.count = function(start2, end) {
      t0.setTime(+start2), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval2.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval2 : interval2.filter(field ? function(d) {
        return field(d) % step === 0;
      } : function(d) {
        return interval2.count(0, d) % step === 0;
      });
    };
  }
  return interval2;
}
var t0, t1;
var init_interval = __esm({
  "node_modules/d3-time/src/interval.js"() {
    t0 = new Date();
    t1 = new Date();
  }
});

// node_modules/d3-time/src/duration.js
var durationSecond, durationMinute, durationHour, durationDay, durationWeek, durationMonth, durationYear;
var init_duration2 = __esm({
  "node_modules/d3-time/src/duration.js"() {
    durationSecond = 1e3;
    durationMinute = durationSecond * 60;
    durationHour = durationMinute * 60;
    durationDay = durationHour * 24;
    durationWeek = durationDay * 7;
    durationMonth = durationDay * 30;
    durationYear = durationDay * 365;
  }
});

// node_modules/d3-time/src/day.js
var day, day_default, days;
var init_day = __esm({
  "node_modules/d3-time/src/day.js"() {
    init_interval();
    init_duration2();
    day = newInterval((date) => date.setHours(0, 0, 0, 0), (date, step) => date.setDate(date.getDate() + step), (start2, end) => (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationDay, (date) => date.getDate() - 1);
    day_default = day;
    days = day.range;
  }
});

// node_modules/d3-time/src/week.js
function weekday(i) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start2, end) {
    return (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
var sunday, monday, tuesday, wednesday, thursday, friday, saturday, sundays, mondays, tuesdays, wednesdays, thursdays, fridays, saturdays;
var init_week = __esm({
  "node_modules/d3-time/src/week.js"() {
    init_interval();
    init_duration2();
    sunday = weekday(0);
    monday = weekday(1);
    tuesday = weekday(2);
    wednesday = weekday(3);
    thursday = weekday(4);
    friday = weekday(5);
    saturday = weekday(6);
    sundays = sunday.range;
    mondays = monday.range;
    tuesdays = tuesday.range;
    wednesdays = wednesday.range;
    thursdays = thursday.range;
    fridays = friday.range;
    saturdays = saturday.range;
  }
});

// node_modules/d3-time/src/year.js
var year, year_default, years;
var init_year = __esm({
  "node_modules/d3-time/src/year.js"() {
    init_interval();
    year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start2, end) {
      return end.getFullYear() - start2.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };
    year_default = year;
    years = year.range;
  }
});

// node_modules/d3-time/src/utcDay.js
var utcDay, utcDay_default, utcDays;
var init_utcDay = __esm({
  "node_modules/d3-time/src/utcDay.js"() {
    init_interval();
    init_duration2();
    utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start2, end) {
      return (end - start2) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });
    utcDay_default = utcDay;
    utcDays = utcDay.range;
  }
});

// node_modules/d3-time/src/utcWeek.js
function utcWeekday(i) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start2, end) {
    return (end - start2) / durationWeek;
  });
}
var utcSunday, utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSundays, utcMondays, utcTuesdays, utcWednesdays, utcThursdays, utcFridays, utcSaturdays;
var init_utcWeek = __esm({
  "node_modules/d3-time/src/utcWeek.js"() {
    init_interval();
    init_duration2();
    utcSunday = utcWeekday(0);
    utcMonday = utcWeekday(1);
    utcTuesday = utcWeekday(2);
    utcWednesday = utcWeekday(3);
    utcThursday = utcWeekday(4);
    utcFriday = utcWeekday(5);
    utcSaturday = utcWeekday(6);
    utcSundays = utcSunday.range;
    utcMondays = utcMonday.range;
    utcTuesdays = utcTuesday.range;
    utcWednesdays = utcWednesday.range;
    utcThursdays = utcThursday.range;
    utcFridays = utcFriday.range;
    utcSaturdays = utcSaturday.range;
  }
});

// node_modules/d3-time/src/utcYear.js
var utcYear, utcYear_default, utcYears;
var init_utcYear = __esm({
  "node_modules/d3-time/src/utcYear.js"() {
    init_interval();
    utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start2, end) {
      return end.getUTCFullYear() - start2.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };
    utcYear_default = utcYear;
    utcYears = utcYear.range;
  }
});

// node_modules/d3-time/src/index.js
var init_src25 = __esm({
  "node_modules/d3-time/src/index.js"() {
    init_day();
    init_week();
    init_year();
    init_utcDay();
    init_utcWeek();
    init_utcYear();
  }
});

// node_modules/d3-time-format/src/locale.js
function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y, m, d) {
  return { y, m, d, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale3) {
  var locale_dateTime = locale3.dateTime, locale_date = locale3.date, locale_time = locale3.time, locale_periods = locale3.periods, locale_weekdays = locale3.days, locale_shortWeekdays = locale3.shortDays, locale_months = locale3.months, locale_shortMonths = locale3.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date) {
      var string = [], i = -1, j = 0, n = specifier.length, c, pad2, format2;
      if (!(date instanceof Date))
        date = new Date(+date);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad2 = pads[c = specifier.charAt(++i)]) != null)
            c = specifier.charAt(++i);
          else
            pad2 = c === "e" ? " " : "0";
          if (format2 = formats2[c])
            c = format2(date, pad2);
          string.push(c);
          j = i + 1;
        }
      }
      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string) {
      var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string += "", 0), week, day2;
      if (i != string.length)
        return null;
      if ("Q" in d)
        return new Date(d.Q);
      if ("s" in d)
        return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
      if (Z && !("Z" in d))
        d.Z = 0;
      if ("p" in d)
        d.H = d.H % 12 + d.p * 12;
      if (d.m === void 0)
        d.m = "q" in d ? d.q : 0;
      if ("V" in d) {
        if (d.V < 1 || d.V > 53)
          return null;
        if (!("w" in d))
          d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day2 = week.getUTCDay();
          week = day2 > 4 || day2 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay_default.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day2 = week.getDay();
          week = day2 > 4 || day2 === 0 ? monday.ceil(week) : monday(week);
          week = day_default.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d))
          d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day2 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day2 + 5) % 7 : d.w + d.U * 7 - (day2 + 6) % 7;
      }
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string, j) {
    var i = 0, n = specifier.length, m = string.length, c, parse;
    while (i < n) {
      if (j >= m)
        return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || (j = parse(d, string, j)) < 0)
          return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }
  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }
  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
    }
  };
}
function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
function requote(s) {
  return s.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
}
function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad(1 + day_default.count(year_default(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day2 = d.getDay();
  return day2 === 0 ? 7 : day2;
}
function formatWeekNumberSunday(d, p) {
  return pad(sunday.count(year_default(d) - 1, d), p, 2);
}
function dISO(d) {
  var day2 = d.getDay();
  return day2 >= 4 || day2 === 0 ? thursday(d) : thursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(thursday.count(year_default(d), d) + (year_default(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad(monday.count(year_default(d) - 1, d), p, 2);
}
function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
  var day2 = d.getDay();
  d = day2 >= 4 || day2 === 0 ? thursday(d) : thursday.ceil(d);
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay_default.count(utcYear_default(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear_default(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day2 = d.getUTCDay();
  return day2 >= 4 || day2 === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(utcThursday.count(utcYear_default(d), d) + (utcYear_default(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear_default(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day2 = d.getUTCDay();
  d = day2 >= 4 || day2 === 0 ? utcThursday(d) : utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1e3);
}
var pads, numberRe, percentRe, requoteRe;
var init_locale2 = __esm({
  "node_modules/d3-time-format/src/locale.js"() {
    init_src25();
    pads = { "-": "", "_": " ", "0": "0" };
    numberRe = /^\s*\d+/;
    percentRe = /^%/;
    requoteRe = /[\\^$*+?|[\]().{}]/g;
  }
});

// node_modules/d3-time-format/src/defaultLocale.js
function defaultLocale2(definition) {
  locale2 = formatLocale(definition);
  timeFormat = locale2.format;
  timeParse = locale2.parse;
  utcFormat = locale2.utcFormat;
  utcParse = locale2.utcParse;
  return locale2;
}
var locale2, timeFormat, timeParse, utcFormat, utcParse;
var init_defaultLocale2 = __esm({
  "node_modules/d3-time-format/src/defaultLocale.js"() {
    init_locale2();
    defaultLocale2({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });
  }
});

// node_modules/d3-time-format/src/index.js
var init_src26 = __esm({
  "node_modules/d3-time-format/src/index.js"() {
    init_defaultLocale2();
  }
});

// node_modules/d3-scale/src/index.js
var init_src27 = __esm({
  "node_modules/d3-scale/src/index.js"() {
  }
});

// node_modules/d3-scale-chromatic/src/index.js
var init_src28 = __esm({
  "node_modules/d3-scale-chromatic/src/index.js"() {
  }
});

// node_modules/d3-shape/src/index.js
var init_src29 = __esm({
  "node_modules/d3-shape/src/index.js"() {
  }
});

// node_modules/d3-zoom/src/constant.js
var init_constant4 = __esm({
  "node_modules/d3-zoom/src/constant.js"() {
  }
});

// node_modules/d3-zoom/src/event.js
var init_event2 = __esm({
  "node_modules/d3-zoom/src/event.js"() {
  }
});

// node_modules/d3-zoom/src/transform.js
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
function transform(node) {
  while (!node.__zoom)
    if (!(node = node.parentNode))
      return identity2;
  return node.__zoom;
}
var identity2;
var init_transform2 = __esm({
  "node_modules/d3-zoom/src/transform.js"() {
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
    identity2 = new Transform(1, 0, 0);
    transform.prototype = Transform.prototype;
  }
});

// node_modules/d3-zoom/src/noevent.js
var init_noevent2 = __esm({
  "node_modules/d3-zoom/src/noevent.js"() {
  }
});

// node_modules/d3-zoom/src/zoom.js
var init_zoom = __esm({
  "node_modules/d3-zoom/src/zoom.js"() {
    init_src10();
    init_constant4();
    init_event2();
    init_transform2();
    init_noevent2();
  }
});

// node_modules/d3-zoom/src/index.js
var init_src30 = __esm({
  "node_modules/d3-zoom/src/index.js"() {
    init_zoom();
    init_transform2();
  }
});

// node_modules/d3/index.js
var init_d3 = __esm({
  "node_modules/d3/index.js"() {
    init_package();
    init_src();
    init_src2();
    init_src11();
    init_src13();
    init_src6();
    init_src14();
    init_src15();
    init_src3();
    init_src5();
    init_src16();
    init_src9();
    init_src17();
    init_src19();
    init_src20();
    init_src21();
    init_src22();
    init_src7();
    init_src12();
    init_src23();
    init_src18();
    init_src24();
    init_src27();
    init_src28();
    init_src4();
    init_src29();
    init_src25();
    init_src26();
    init_src8();
    init_src10();
    init_src30();
  }
});

// dist/esm/transformer/builtin.js
var init_builtin = __esm({
  "dist/esm/transformer/builtin.js"() {
    init_transformer();
    init_d3();
    GraphicalTransformer.register("SliderTransformer", {
      constructor: GraphicalTransformer,
      redraw: ({ layer, transformer }) => {
        select_default2(layer.getGraphic()).selectAll(":not(.ig-layer-background)").remove();
        const x1 = transformer.getSharedVar("x1") ?? 0;
        const x2 = transformer.getSharedVar("x2") ?? 0;
        const height = transformer.getSharedVar("height") ?? 0;
        const fill = transformer.getSharedVar("fill") ?? "#000000";
        const opacity = transformer.getSharedVar("opacity") ?? 0.3;
        select_default2(layer.getGraphic()).append("rect").attr("x1", x1).attr("x2", x2).attr("width", x2 - x1).attr("height", height).attr("fill", fill).attr("opacity", opacity);
      }
    });
    GraphicalTransformer.register("HighlightSelection", {
      constructor: GraphicalTransformer,
      redraw({ layer, transformer }) {
        const elems = select_default2(layer.getGraphic()).selectAll(transformer.getSharedVar("selector") || "*");
        const attrValueEntries = Object.entries(transformer.getSharedVar("highlightAttrValues"));
        attrValueEntries.forEach(([key, value]) => {
          elems.attr(key, value);
        });
      }
    });
    GraphicalTransformer.register("TransientRectangleTransformer", {
      constructor: GraphicalTransformer,
      className: ["draw-shape", "transient-shape", "rectangle-shape"],
      redraw: ({ layer, transformer }) => {
        select_default2(layer.getGraphic()).selectAll(":not(.ig-layer-background)").remove();
        select_default2(layer.getGraphic()).append("rect").attr("x", transformer.getSharedVar("x")).attr("y", transformer.getSharedVar("y")).attr("width", transformer.getSharedVar("width")).attr("height", transformer.getSharedVar("height")).attr("fill", transformer.getSharedVar("fillColor")).attr("opacity", transformer.getSharedVar("opacity"));
      }
    });
    GraphicalTransformer.register("SelectionTransformer", {
      constructor: GraphicalTransformer,
      redraw: ({ layer, transformer }) => {
        transformer.getSharedVar("result")?.forEach((resultNode) => {
          layer.getGraphic().appendChild(resultNode);
        });
        const highlightColor = transformer.getSharedVar("highlightColor");
        const attrValueEntries = Object.entries(transformer.getSharedVar("highlightAttrValues") || {});
        if (highlightColor || attrValueEntries.length) {
          const elems = selectAll_default2(transformer.getSharedVar("result"));
          if (highlightColor) {
            elems.attr("fill", highlightColor).attr("stroke", highlightColor);
          }
          attrValueEntries.forEach(([key, value]) => {
            elems.attr(key, value);
          });
        }
        const tooltip = transformer.getSharedVar("tooltip");
        if (tooltip) {
          if (typeof tooltip === "object" && (tooltip.fields && tooltip.fields.length || tooltip.text)) {
            const tooltipQueue = [];
            let shouldDisplay = false;
            if (typeof tooltip === "object" && tooltip.prefix) {
              tooltipQueue.push(tooltip.prefix);
            }
            if (tooltip.text) {
              tooltipQueue.push(tooltip.text);
              shouldDisplay = true;
            }
            if (tooltip.fields && tooltip.fields.length) {
              const result = transformer.getSharedVar("result");
              if (result && result.length <= 1) {
                tooltip.fields.forEach((field) => {
                  const displayContent = layer.getDatum(result?.[0])?.[field] ?? "";
                  if (displayContent) {
                    tooltipQueue.push(displayContent);
                    shouldDisplay = true;
                  }
                });
              } else if (result && result.length > 1) {
                const queueArray = [];
                result.forEach((el) => {
                  const datum2 = layer.getDatum(el);
                  if (datum2) {
                    const subArray = [el];
                    tooltip.fields.forEach((field) => {
                      const displayContent = datum2?.[field] ?? "";
                      if (displayContent) {
                        subArray.push(displayContent);
                      }
                    });
                    queueArray.push(subArray);
                  }
                });
                shouldDisplay = true;
                tooltipQueue.push(queueArray);
              }
            }
            if (typeof tooltip === "object" && tooltip.suffix) {
              tooltipQueue.push(tooltip.suffix);
            }
            const tooltipText = tooltipQueue.join(" ");
            if (tooltipText && shouldDisplay) {
              if (tooltip.position == "absolute") {
                const tooltipArrayIndex = tooltipQueue.findIndex((item) => item instanceof Array);
                if (tooltipArrayIndex !== -1) {
                  const tooltipPrefix = tooltipQueue.slice(0, tooltipArrayIndex);
                  const tooltipArray = tooltipQueue[tooltipArrayIndex];
                  const tooltipSuffix = tooltipQueue.slice(tooltipArrayIndex + 1);
                  tooltipArray.forEach((subArray) => {
                    const el = subArray[0];
                    const str = [
                      ...tooltipPrefix,
                      ...subArray.slice(1),
                      ...tooltipSuffix
                    ].join(" ");
                    const offsetX = (el.getBBox()?.x ?? 0) + (tooltip.offset?.x ?? 0);
                    const offsetY = (el.getBBox()?.y ?? 0) + (tooltip.offset?.y ?? 0);
                    select_default2(layer.getGraphic()).append("text").attr("x", offsetX).attr("y", offsetY).text(str);
                  });
                }
              } else {
                select_default2(layer.getGraphic()).append("text").attr("x", transformer.getSharedVar("x") - (layer._offset?.x ?? 0) + (tooltip.offset?.x ?? 0)).attr("y", transformer.getSharedVar("y") - (layer._offset?.y ?? 0) + (tooltip.offset?.y ?? 0)).text(tooltipText);
              }
            }
          }
          if (typeof tooltip === "object" && tooltip.image) {
            if (typeof tooltip.image === "string") {
              select_default2(layer.getGraphic()).append("image").attr("x", transformer.getSharedVar("x") - (layer._offset?.x ?? 0) + (tooltip.offset?.x ?? 0)).attr("y", transformer.getSharedVar("y") - (layer._offset?.y ?? 0) + (tooltip.offset?.y ?? 0)).attr("width", tooltip.width ?? 100).attr("height", tooltip.height ?? 100).attr("style", "object-fit: contain").attr("xlink:href", tooltip.image);
            } else if (tooltip.image instanceof Function) {
              try {
                const image = tooltip.image(layer.getDatum(transformer.getSharedVar("result")[0]));
                if (image) {
                  select_default2(layer.getGraphic()).append("image").attr("x", transformer.getSharedVar("x") - (layer._offset?.x ?? 0) + (tooltip.offset?.x ?? 0)).attr("y", transformer.getSharedVar("y") - (layer._offset?.y ?? 0) + (tooltip.offset?.y ?? 0)).attr("width", tooltip.width ?? 100).attr("height", tooltip.height ?? 100).attr("style", "object-fit: contain").attr("xlink:href", image);
                }
              } catch (e) {
              }
            }
          }
        }
      }
    });
    GraphicalTransformer.register("LineTransformer", {
      constructor: GraphicalTransformer,
      transient: true,
      sharedVar: {
        orientation: ["horizontal", "vertical"],
        style: {}
      },
      redraw({ layer, transformer }) {
        const mainLayer = layer.getLayerFromQueue("mainLayer");
        const orientation = transformer.getSharedVar("orientation");
        const style = transformer.getSharedVar("style");
        const x = transformer.getSharedVar("x");
        const y = transformer.getSharedVar("y");
        const tooltipConfig = transformer.getSharedVar("tooltip");
        const scaleX = transformer.getSharedVar("scaleX");
        const scaleY = transformer.getSharedVar("scaleY");
        const result = transformer.getSharedVar("result");
        if (result && result.slope !== void 0 && result.intercept !== void 0) {
          orientation.splice(0, orientation.length);
          const line = select_default2(layer.getGraphic()).append("line").attr("x1", 0).attr("x2", mainLayer.getGraphic().getBoundingClientRect().width).attr("y1", result.intercept).attr("y2", result.slope * mainLayer.getGraphic().getBoundingClientRect().width + result.intercept).attr("stroke-width", 1).attr("stroke", "#000");
          if (style) {
            Object.entries(style).forEach(([key, value]) => {
              line.attr(key, value);
            });
          }
        }
        const tooltipQueue = [];
        let tooltipOffsetX = 0;
        let tooltipOffsetY = 0;
        if (tooltipConfig) {
          if (typeof tooltipConfig === "object" && tooltipConfig.prefix) {
            tooltipQueue.push(tooltipConfig.prefix);
          }
          if (scaleX && scaleX.invert && typeof x === "number") {
            tooltipQueue.push(scaleX.invert(x - (layer._offset?.x ?? 0)));
          }
          if (scaleY && scaleY.invert && typeof y === "number") {
            tooltipQueue.push(scaleY.invert(y - (layer._offset?.y ?? 0)));
          }
          if (typeof tooltipConfig === "object" && tooltipConfig.suffix) {
            tooltipQueue.push(tooltipConfig.suffix);
          }
          if (typeof tooltipConfig === "object" && tooltipConfig.offset) {
            if (typeof tooltipConfig.offset.x === "number") {
              tooltipOffsetX = tooltipConfig.offset.x;
            }
            if (typeof tooltipConfig.offset.y === "number") {
              tooltipOffsetY = tooltipConfig.offset.y;
            }
            if (typeof tooltipConfig.offset.x === "function" && typeof x === "number") {
              tooltipOffsetX = tooltipConfig.offset.x(x - (layer._offset?.x ?? 0));
            }
            if (typeof tooltipConfig.offset.y === "function" && typeof y === "number") {
              tooltipOffsetY = tooltipConfig.offset.y(y - (layer._offset?.y ?? 0));
            }
          }
        }
        const tooltip = tooltipQueue.join(" ");
        if (orientation.includes("horizontal") && typeof y === "number") {
          const line = select_default2(layer.getGraphic()).append("line").attr("x1", 0).attr("x2", mainLayer.getGraphic().getBoundingClientRect().width).attr("y1", y - (layer._offset?.y ?? 0)).attr("y2", y - (layer._offset?.y ?? 0)).attr("stroke-width", 1).attr("stroke", "#000");
          if (style) {
            Object.entries(style).forEach(([key, value]) => {
              line.attr(key, value);
            });
          }
        }
        if (orientation.includes("vertical") && typeof x === "number") {
          const line = select_default2(layer.getGraphic()).append("line").attr("y1", 0).attr("y2", mainLayer.getGraphic().getBoundingClientRect().height).attr("x1", x - (layer._offset?.x ?? 0)).attr("x2", x - (layer._offset?.x ?? 0)).attr("stroke-width", 1).attr("stroke", "#000");
          if (style) {
            Object.entries(style).forEach(([key, value]) => {
              line.attr(key, value);
            });
          }
        }
        if (tooltip) {
          select_default2(layer.getGraphic()).append("text").attr("x", x - (layer._offset?.x ?? 0)).attr("y", y - (layer._offset?.y ?? 0)).text(tooltip);
        }
      }
    });
    GraphicalTransformer.register("TextTransformer", {
      constructor: GraphicalTransformer,
      transient: true,
      sharedVar: {
        style: {},
        content: "",
        field: null
      },
      redraw({ layer, transformer }) {
        const style = transformer.getSharedVar("style");
        const x = transformer.getSharedVar("offsetx") || transformer.getSharedVar("x");
        const y = transformer.getSharedVar("offsety") || transformer.getSharedVar("y");
        const content = transformer.getSharedVar("content");
        const field = transformer.getSharedVar("field");
        const result = transformer.getSharedVar("result");
        const position = transformer.getSharedVar("position");
        let displayContent = content;
        let displayX = x, displayY = y;
        if (field) {
          const datum2 = layer.getDatum(result);
          if (datum2) {
            displayContent = datum2?.[field] ?? "";
            if (position instanceof Function) {
              let { x: x2, y: y2 } = position(datum2);
              displayX = x2 ?? displayX;
              displayY = y2 ?? displayY;
            } else {
              displayX = position?.x ?? displayX;
              displayY = position?.y ?? displayY;
            }
          } else {
            displayContent = "";
          }
        }
        select_default2(layer.getGraphic()).append("text").attr("x", displayX).attr("y", displayY).text(displayContent).call((t) => {
          if (style) {
            Object.entries(style).forEach(([key, value]) => {
              t.style(key, value);
            });
          }
        });
      }
    });
  }
});

// dist/esm/transformer/index.js
var transformer_default, instanceTransformers2, GraphicalTransformer2;
var init_transformer2 = __esm({
  "dist/esm/transformer/index.js"() {
    init_transformer();
    init_transformer();
    init_builtin();
    transformer_default = GraphicalTransformer;
    instanceTransformers2 = instanceTransformers;
    GraphicalTransformer2 = GraphicalTransformer;
  }
});

// dist/esm/service/service.js
var _a2, registeredServices, instanceServices, Service, register2, unregister2, initialize2, findService;
var init_service = __esm({
  "dist/esm/service/service.js"() {
    init_helpers();
    init_transformer2();
    registeredServices = {};
    instanceServices = [];
    Service = class {
      constructor(baseName4, options) {
        this.joining = false;
        this._linkCache = {};
        this._transformers = [];
        this._joinTransformers = [];
        this._services = [];
        this._joinServices = [];
        this._initializing = null;
        this._nextTick = 0;
        this._computing = null;
        this._result = null;
        this._oldResult = null;
        this._command = [];
        this[_a2] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? baseName4;
        this._sharedVar = {};
        this._transformers = options.transformers ?? [];
        this._joinTransformers = options.joinTransformers ?? [];
        this._services = options.services ?? [];
        this._joinServices = options.joinServices ?? [];
        this._command = options.command ?? [];
        this._layerInstances = [];
        this._resultAlias = options.resultAlias ?? "result";
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preUpdate = options.preUpdate ?? null;
        this._preAttach = options.preAttach ?? null;
        this._postUse = options.postUse ?? null;
        this._initializing = Promise.all(Object.entries(options.sharedVar || {}).map((entry) => this.setSharedVar(entry[0], entry[1]))).then(async () => {
          options.postUpdate && options.postUpdate.call(this, this);
          this._postUpdate = options.postUpdate ?? null;
          this._initializing = null;
        });
        if (options.layer) {
          this._layerInstances.push(options.layer);
        }
        instanceServices.push(this);
        options.postInitialize && options.postInitialize.call(this, this);
      }
      getSharedVar(sharedName, options) {
        if (options && options.layer && this._layerInstances.length && !this._layerInstances.includes(options.layer)) {
          return void 0;
        }
        if (!(sharedName in this._sharedVar) && options && "defaultValue" in options) {
          this.setSharedVar(sharedName, options.defaultValue, options);
        }
        return this._sharedVar[sharedName];
      }
      async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._userOptions.evaluate && this._resultAlias) {
          if (this._nextTick) {
            return;
          }
          this._nextTick = requestAnimationFrame(async () => {
            this._oldResult = this._result;
            try {
              this._computing = this._userOptions.evaluate({
                self: this,
                ...this._userOptions.params ?? {},
                ...this._sharedVar
              });
              this._result = await this._computing;
              this._computing = null;
              this._services.forEach((service) => {
                service.setSharedVars({
                  ...this._sharedVar,
                  [this._resultAlias]: this._result
                });
              });
              this._transformers.forEach((transformer) => {
                transformer.setSharedVars({
                  ...this._sharedVar,
                  [this._resultAlias]: this._result
                });
              });
            } catch (e) {
              console.error(e);
              this._result = void 0;
              this._computing = null;
            }
            this._nextTick = 0;
            this.postUpdate();
          });
        } else {
          this.postUpdate();
        }
      }
      async setSharedVars(obj, options) {
        Object.entries(obj).forEach(([key, value]) => {
          this._sharedVar[key] = value;
        });
        if (Object.keys(obj).length > 0) {
          await this.setSharedVar(...Object.entries(obj)[0], options);
        }
      }
      async join() {
        if (this._resultAlias) {
          this.joining = true;
          if (Object.keys(this._sharedVar).length) {
            this.setSharedVar(...Object.entries(this._sharedVar)[0]);
          }
          const result = await this._internalResults;
          if (this._joinServices && this._joinServices.length) {
            await Promise.all(this._joinServices.map(async (s) => {
              await s.setSharedVar(this._resultAlias, result);
              return s.results;
            }));
          } else if (!this._initializing) {
            await Promise.all(this._services.map(async (s) => {
              await s.setSharedVar(this._resultAlias, result);
              return s.results;
            }));
          }
          if (this._joinTransformers && this._joinTransformers.length) {
            await Promise.all(this._joinTransformers.map((t) => t.setSharedVar(this._resultAlias, result)));
          } else if (!this._initializing) {
            await Promise.all(this._transformers.map((t) => t.setSharedVar(this._resultAlias, result)));
          }
          this.joining = false;
        }
      }
      preUpdate() {
        this._preUpdate && this._preUpdate.call(this, this);
      }
      postUpdate() {
        this._postUpdate && this._postUpdate.call(this, this);
      }
      preAttach(instrument) {
        this._preAttach && this._preAttach.call(this, this, instrument);
      }
      postUse(instrument) {
        this._postUse && this._postUse.call(this, this, instrument);
      }
      invokeCommand() {
        this._command.forEach((command) => {
          command.execute({
            self: this,
            ...this._userOptions.params ?? {},
            ...this._sharedVar
          });
        });
        this._services.forEach((service) => {
          service.invokeCommand();
        });
      }
      isInstanceOf(name) {
        return this._baseName === name || this._name === name;
      }
      get transformers() {
        return makeFindableList(this._transformers.slice(0), GraphicalTransformer2, (e) => this._transformers.push(e), (e) => {
          e.setSharedVars({
            ...this._resultAlias ? { [this._resultAlias]: null } : {},
            result: null
          });
          this._transformers.splice(this._transformers.indexOf(e), 1);
        }, this);
      }
      get services() {
        return makeFindableList(this._services.slice(0), Service, (e) => this._services.push(e), (e) => {
          Object.entries({
            ...this._resultAlias ? { [this._resultAlias]: null } : {},
            result: null
          }).forEach(([k, v]) => {
            e.setSharedVar(k, v);
          });
          this._services.splice(this._services.indexOf(e), 1);
        }, this);
      }
      get _internalResults() {
        if (this._nextTick) {
          return new Promise((res) => {
            window.requestAnimationFrame(async () => {
              if (this._computing) {
                res(await this._computing);
              } else {
                res(this._result);
              }
            });
          });
        }
        return this._computing || this._result;
      }
      get results() {
        if (this._initializing) {
          return this._initializing.then(() => {
            return this._internalResults;
          });
        }
        return this._internalResults;
      }
      get oldCachedResults() {
        return this._oldResult;
      }
      get oldResults() {
        if (this._initializing) {
          return this._initializing.then(() => {
            if (this._nextTick) {
              return new Promise((res) => {
                window.requestAnimationFrame(async () => {
                  if (this._computing) {
                    await this._computing;
                  }
                  res(this._oldResult);
                });
              });
            }
            return this._oldResult;
          });
        }
        if (this._nextTick) {
          return new Promise((res) => {
            window.requestAnimationFrame(async () => {
              if (this._computing) {
                await this._computing;
              }
              res(this._oldResult);
            });
          });
        }
        return this._oldResult;
      }
      static register(baseName4, options) {
        registeredServices[baseName4] = options;
      }
      static unregister(baseName4) {
        delete registeredServices[baseName4];
        return true;
      }
      static initialize(baseName4, options) {
        const mergedOptions = Object.assign({ constructor: Service }, registeredServices[baseName4] ?? {}, options ?? {}, {
          on: Object.assign({}, (registeredServices[baseName4] ?? {}).on ?? {}, options?.on ?? {}),
          sharedVar: Object.assign({}, (registeredServices[baseName4] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {}),
          params: Object.assign({}, (registeredServices[baseName4] ?? {}).params ?? {}, options?.params ?? {})
        });
        const service = new mergedOptions.constructor(baseName4, mergedOptions);
        return service;
      }
      static findService(baseNameOrRealName) {
        return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
      }
    };
    _a2 = LibraSymbol;
    register2 = Service.register;
    unregister2 = Service.unregister;
    initialize2 = Service.initialize;
    findService = Service.findService;
  }
});

// dist/esm/service/selectionService.js
var SelectionService;
var init_selectionService = __esm({
  "dist/esm/service/selectionService.js"() {
    init_service();
    init_helpers();
    init_transformer2();
    SelectionService = class extends Service {
      constructor(baseName4, options) {
        super(baseName4, {
          ...options,
          resultAlias: options?.resultAlias ?? "result"
        });
        this._currentDimension = [];
        this._transformers.push(GraphicalTransformer2.initialize("SelectionTransformer", {
          transient: true,
          sharedVar: {
            [this._resultAlias]: [],
            layer: null,
            highlightColor: options?.sharedVar?.highlightColor,
            highlightAttrValues: options?.sharedVar?.highlightAttrValues,
            tooltip: options?.sharedVar?.tooltip
          }
        }));
        this._selectionMapping = new Map();
        Object.entries({
          ...this._userOptions?.query?.attrName ? typeof this._userOptions.query.attrName === "string" ? {
            [this._userOptions.query.attrName]: this._userOptions?.query?.extent ?? []
          } : Object.fromEntries(this._userOptions.query.attrName.map((attr, i) => [
            attr,
            this._userOptions?.query?.extent?.[i] ?? []
          ])) : {},
          ...this._sharedVar?.attrName ? typeof this._sharedVar.attrName === "string" ? {
            [this._sharedVar.attrName]: this._sharedVar?.extent ?? []
          } : Object.fromEntries(this._sharedVar.attrName.map((attr, i) => [
            attr,
            this._sharedVar?.extent?.[i] ?? []
          ])) : {}
        }).filter(([_, v]) => v instanceof Array).forEach(([key, value]) => this._selectionMapping.set(key, value));
      }
      async setSharedVar(sharedName, value, options) {
        if (options && options.layer && this._layerInstances.length !== 0 && !this._layerInstances.includes(options.layer)) {
          return;
        }
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        this._transformers.filter((t) => t.isInstanceOf("draw-shape")).forEach((t) => {
          const layer = options?.layer || this._layerInstances[0];
          if (!layer)
            return;
          let bbox = layer.getGraphic().getBoundingClientRect();
          if (layer._width && bbox.width > layer._width || layer._height && bbox.height > layer._height) {
            const tempRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            tempRect.setAttribute("x", "0");
            tempRect.setAttribute("y", "0");
            tempRect.setAttribute("width", layer._width.toString());
            tempRect.setAttribute("height", layer._height.toString());
            tempRect.setAttribute("opacity", "0");
            layer.getGraphic().appendChild(tempRect);
            bbox = tempRect.getBoundingClientRect();
            layer.getGraphic().removeChild(tempRect);
          }
          const x = this._sharedVar.x ?? bbox.left;
          const y = this._sharedVar.y ?? bbox.top;
          const width = this._sharedVar.width ?? layer._width ?? 0;
          const height = this._sharedVar.height ?? layer._height ?? 0;
          if (this._sharedVar.width !== void 0 || this._sharedVar.height !== void 0) {
            t.setSharedVars({
              layer: layer.getLayerFromQueue("transientLayer"),
              x: x - bbox.left,
              y: y - bbox.top,
              width,
              height
            });
          }
        });
        if ((options?.layer || this._layerInstances.length == 1) && this._userOptions.query) {
          const layer = options?.layer || this._layerInstances[0];
          if (this._nextTick) {
            return;
          }
          this._nextTick = requestAnimationFrame(async () => {
            this._evaluate(layer);
          });
        } else {
          this.postUpdate();
        }
      }
      _evaluate(layer) {
        if (!layer)
          return;
        if (!this._sharedVar.skipPicking) {
          this._oldResult = this._result;
          this._result = layer.picking({
            ...this._userOptions.query,
            ...this._sharedVar
          });
        }
        const selectionLayer = layer.getLayerFromQueue("selectionLayer").getGraphic();
        while (selectionLayer?.firstChild) {
          selectionLayer.removeChild(selectionLayer.lastChild);
        }
        if (this._sharedVar.deepClone) {
          let resultNodes = [];
          let refNodes = [];
          this._result.forEach((node) => {
            if (node !== layer.getGraphic()) {
              let k = refNodes.length;
              for (let i = 0; i < k; i++) {
                const refNode = refNodes[i];
                const resultNode = resultNodes[i];
                if (node.contains(refNode)) {
                  refNodes.splice(i, 1);
                  resultNodes.splice(i, 1);
                  resultNode.remove();
                  i--;
                  k--;
                }
              }
              resultNodes.push(layer.cloneVisualElements(node, true));
              refNodes.push(node);
            }
          });
          this._services.forEach((service) => {
            service.setSharedVars({
              ...this._sharedVar,
              [this._resultAlias]: resultNodes
            });
          });
        } else {
          this._services.forEach((service) => {
            service.setSharedVars({
              ...this._sharedVar,
              [this._resultAlias]: this._result ? this._result.map((node) => layer.cloneVisualElements(node, false)) : []
            });
          });
          this._transformers.filter((t) => !t.isInstanceOf("draw-shape")).forEach((transformer) => {
            transformer.setSharedVars({
              ...this._sharedVar,
              x: this._sharedVar.offsetx ?? this._sharedVar.x,
              y: this._sharedVar.offsety ?? this._sharedVar.y,
              layer: layer.getLayerFromQueue("selectionLayer"),
              [this._resultAlias]: this._result ? this._result.map((node) => layer.cloneVisualElements(node, false)) : []
            });
          });
        }
        if (this._sharedVar.scaleX && this._sharedVar.scaleX.invert && this._sharedVar.scaleY && this._sharedVar.scaleY.invert) {
          const x = this._sharedVar.offsetx;
          const y = this._sharedVar.offsety;
          const width = this._sharedVar.width;
          const height = this._sharedVar.height;
          const layerOffsetX = layer._offset?.x ?? 0;
          const layerOffsetY = layer._offset?.y ?? 0;
          const newExtentX = [x - layerOffsetX, x - layerOffsetX + width].map(this._sharedVar.scaleX.invert);
          const newExtentY = [y - layerOffsetY, y - layerOffsetY + height].map(this._sharedVar.scaleY.invert);
          this.filter([newExtentX, newExtentY], { passive: true });
        } else if (this._sharedVar.scaleX && this._sharedVar.scaleX.invert) {
          const x = this._sharedVar.offsetx;
          const width = this._sharedVar.width;
          const layerOffsetX = layer._offset?.x ?? 0;
          const newExtentX = [x - layerOffsetX, x - layerOffsetX + width].map(this._sharedVar.scaleX.invert);
          this.filter(newExtentX, { passive: true });
        } else if (this._sharedVar.scaleY && this._sharedVar.scaleY.invert) {
          const y = this._sharedVar.offsety;
          const height = this._sharedVar.height;
          const layerOffsetY = layer._offset?.y ?? 0;
          const newExtentY = [y - layerOffsetY, y - layerOffsetY + height].map(this._sharedVar.scaleY.invert);
          this.filter(newExtentY, { passive: true });
        }
        this._nextTick = 0;
        this.postUpdate();
      }
      isInstanceOf(name) {
        return name === "SelectionService" || this._baseName === name || this._name === name;
      }
      dimension(dimension, formatter) {
        let dimArr = [];
        let fmtArr = [];
        if (typeof dimension === "string") {
          dimArr = [dimension];
          fmtArr = [formatter ?? ((d) => d)];
        } else {
          dimArr = deepClone(dimension);
          fmtArr = formatter ?? dimArr.map(() => (d) => d);
        }
        const zipArr = dimArr.map((d, i) => [d, fmtArr[i]]);
        const scopeSharedVar = {};
        let scopeLayerInstances = [];
        this._currentDimension = zipArr;
        return new Proxy(this, {
          get(target, p, receiver) {
            if (p === "dimension") {
              return target.dimension.bind(target);
            } else if (p === "_currentDimension") {
              return zipArr;
            } else if (p === "_scopeMode") {
              return true;
            } else if (p === "_sharedVar") {
              if (Object.keys(scopeSharedVar).length)
                return new Proxy({
                  ...target._sharedVar,
                  scaleX: void 0,
                  scaleY: void 0,
                  ...scopeSharedVar
                }, {
                  set: (target2, p2, value) => {
                    scopeSharedVar[p2] = value;
                    return true;
                  }
                });
              return new Proxy(target._sharedVar, {
                set: (target2, p2, value) => {
                  scopeSharedVar[p2] = value;
                  return true;
                }
              });
            } else if (p === "_layerInstances") {
              if (scopeLayerInstances.length) {
                return scopeLayerInstances;
              } else {
                return target._layerInstances;
              }
            } else if (target[p] instanceof Function) {
              return target[p].bind(receiver);
            } else {
              return target[p];
            }
          },
          set(target, p, value) {
            if (p === "_layerInstances") {
              scopeLayerInstances = value;
              return true;
            }
            target[p] = value;
            return true;
          }
        });
      }
      filter(extent, options) {
        if (options && options.layer && this._layerInstances.length !== 0 && !this._layerInstances.includes(options.layer)) {
          return this;
        }
        const layer = options?.layer || this._layerInstances[0];
        if (this._currentDimension.length === 0 && extent instanceof Array && extent.length > 0) {
          if (this._sharedVar.attrName) {
            this._userOptions.query.attrName = this._sharedVar.attrName;
          }
          if (this._userOptions.query.attrName) {
            this.dimension(this._userOptions.query.attrName).filter(extent);
          }
        } else if (this._currentDimension.length === 1 && extent instanceof Array && extent.length > 0 && !(extent[0] instanceof Array)) {
          this._selectionMapping.set(this._currentDimension[0][0], this._currentDimension[0][1](extent).sort((a, b) => typeof a === "number" ? a - b : a < b ? -1 : a == b ? 0 : 1));
          if (!options?.passive) {
            this._sharedVar.attrName = [...this._selectionMapping.keys()];
            this._sharedVar.extent = [...this._selectionMapping.values()];
            this._evaluate(layer);
          }
          this._services.forEach((service) => {
            service.setSharedVar("extents", this.extents);
          });
          this._transformers.forEach((transformer) => {
            transformer.setSharedVar("extents", this.extents);
          });
        } else if (this._currentDimension.length === extent.length && extent.every((ex) => ex instanceof Array)) {
          this._currentDimension.forEach((dim, i) => {
            this._selectionMapping.set(dim[0], dim[1](extent[i]).sort((a, b) => typeof a === "number" ? a - b : a < b ? -1 : a == b ? 0 : 1));
          });
          if (!options?.passive) {
            this._sharedVar.attrName = [...this._selectionMapping.keys()];
            this._sharedVar.extent = [...this._selectionMapping.values()];
            this._evaluate(layer);
          }
          this._services.forEach((service) => {
            service.setSharedVar("extents", this.extents);
          });
          this._transformers.forEach((transformer) => {
            transformer.setSharedVar("extents", this.extents);
          });
        }
        return this;
      }
      get extents() {
        return Object.fromEntries(this._selectionMapping.entries());
      }
    };
    Service.SelectionService = SelectionService;
    Service.register("SelectionService", {
      constructor: SelectionService
    });
    Service.register("SurfacePointSelectionService", {
      constructor: SelectionService,
      query: {
        baseOn: QueryType.Shape,
        type: ShapeQueryType.SurfacePoint,
        x: 0,
        y: 0
      }
    });
    Service.register("PointSelectionService", {
      constructor: SelectionService,
      query: {
        baseOn: QueryType.Shape,
        type: ShapeQueryType.Point,
        x: 0,
        y: 0
      }
    });
    Service.register("RectSelectionService", {
      constructor: SelectionService,
      transformers: [
        GraphicalTransformer2.initialize("TransientRectangleTransformer", {
          sharedVar: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            opacity: 0.3
          }
        })
      ],
      query: {
        baseOn: QueryType.Shape,
        type: ShapeQueryType.Rect,
        x: 0,
        y: 0,
        width: 1,
        height: 1
      }
    });
    Service.register("CircleSelectionService", {
      constructor: SelectionService,
      query: {
        baseOn: QueryType.Shape,
        type: ShapeQueryType.Circle,
        x: 0,
        y: 0,
        r: 1
      }
    });
    Service.register("PolygonSelectionService", {
      constructor: SelectionService,
      query: {
        baseOn: QueryType.Shape,
        type: ShapeQueryType.Polygon,
        points: []
      }
    });
    Service.register("QuantitativeSelectionService", {
      constructor: SelectionService,
      transformers: [
        GraphicalTransformer2.initialize("TransientRectangleTransformer", {
          sharedVar: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            opacity: 0.3
          }
        })
      ],
      query: {
        baseOn: QueryType.Data,
        type: DataQueryType.Quantitative,
        attrName: "",
        extent: [0, 0]
      }
    });
  }
});

// dist/esm/service/layoutService.js
var LayoutService;
var init_layoutService = __esm({
  "dist/esm/service/layoutService.js"() {
    init_service();
    LayoutService = class extends Service {
      constructor(baseName4, options) {
        super(baseName4, {
          ...options,
          resultAlias: options.resultAlias ?? "result"
        });
      }
      isInstanceOf(name) {
        return name === "LayoutService" || this._baseName === name || this._name === name;
      }
    };
    Service.LayoutService = LayoutService;
    Service.register("LayoutService", {
      constructor: LayoutService
    });
    Service.register("ScaleService", {
      constructor: LayoutService,
      evaluate({ offsetx, width, offsety, height, scaleX, scaleY, layer, self }) {
        let layerInstance = layer;
        if (!layerInstance && self._layerInstances && self._layerInstances.length == 1) {
          layerInstance = self._layerInstances[0];
        }
        if (scaleX && scaleX.invert && !scaleY) {
          if (width <= 0 || isNaN(width))
            return scaleX;
          const scaleXCopy = scaleX.copy();
          const startX = scaleXCopy.invert(offsetx - (layerInstance?._offset?.x ?? 0));
          const endX = scaleXCopy.invert(offsetx + width - (layerInstance?._offset?.x ?? 0));
          scaleXCopy.domain([startX, endX]);
          scaleXCopy.clamp(true);
          return scaleXCopy;
        }
        if (!scaleX && scaleY && scaleY.invert) {
          if (height <= 0 || isNaN(height))
            return scaleY;
          const scaleYCopy = scaleY.copy();
          const startY = scaleYCopy.invert(offsety - (layerInstance?._offset?.y ?? 0));
          const endY = scaleYCopy.invert(offsety + height - (layerInstance?._offset?.y ?? 0));
          scaleYCopy.domain([startY, endY]);
          scaleYCopy.clamp(true);
          return scaleYCopy;
        }
        if (scaleX && scaleY && scaleX.invert && scaleY.invert) {
          if (width <= 0 || isNaN(width) || height <= 0 || isNaN(height))
            return { scaleX, scaleY };
          const scaleXCopy = scaleX.copy();
          const scaleYCopy = scaleY.copy();
          const startX = scaleXCopy.invert(offsetx - (layerInstance?._offset?.x ?? 0));
          const endX = scaleXCopy.invert(offsetx + width - (layerInstance?._offset?.x ?? 0));
          const startY = scaleYCopy.invert(offsety - (layerInstance?._offset?.y ?? 0));
          const endY = scaleYCopy.invert(offsety + height - (layerInstance?._offset?.y ?? 0));
          scaleXCopy.domain([startX, endX]);
          scaleYCopy.domain([startY, endY]);
          scaleXCopy.clamp(true);
          scaleYCopy.clamp(true);
          return { scaleX: scaleXCopy, scaleY: scaleYCopy };
        }
        return { scaleX, scaleY };
      }
    });
  }
});

// dist/esm/service/algorithmService.js
var AnalysisService;
var init_algorithmService = __esm({
  "dist/esm/service/algorithmService.js"() {
    init_service();
    init_helpers();
    init_d3();
    AnalysisService = class extends Service {
      constructor(baseName4, options) {
        super(baseName4, {
          ...options,
          resultAlias: options.resultAlias ?? "result"
        });
      }
      isInstanceOf(name) {
        return name === "AnalysisService" || this._baseName === name || this._name === name;
      }
    };
    Service.AnalysisService = AnalysisService;
    Service.register("AnalysisService", {
      constructor: AnalysisService
    });
    Service.register("FilterService", {
      constructor: AnalysisService,
      evaluate({ data, extents, result, fields, self }) {
        if (!extents && (!result || !result.length || !fields || !fields.length)) {
          if (!extents)
            return [];
          return data;
        }
        if (!data) {
          try {
            const layerInstances = self._layerInstances;
            if (layerInstances && layerInstances.length > 0) {
              data = [...layerInstances[0].getGraphic().childNodes].filter((el) => layerInstances[0].getDatum(el)).map((el) => Object.assign(layerInstances[0].cloneVisualElements(el), layerInstances[0].getDatum(el)));
            }
          } catch (e) {
            console.error("failed to get data from layerInstances", e);
          }
        }
        if (extents) {
          Object.entries(extents).forEach(([field, extent]) => {
            if (extent[0] >= extent[1] || isNaN(extent[0]) || isNaN(extent[1]))
              return;
            data = data.filter((d) => d[field] >= extent[0] && d[field] <= extent[1]);
          });
        } else {
          const layerInstances = self._layerInstances;
          let datum2 = selectAll_default2(result).datum();
          if (layerInstances && layerInstances.length > 0) {
            datum2 = layerInstances[0].getDatum(result[0]);
          }
          if (datum2)
            fields.forEach((field) => {
              data = data.filter((d) => d[field] == datum2[field]);
            });
        }
        return data;
      }
    });
    Service.register("InterpolationService", {
      constructor: AnalysisService,
      evaluate({ result, field, data, formula }) {
        if (!result) {
          return null;
        }
        const { data: fieldValue, interpolatedNum } = result;
        if (!fieldValue || interpolatedNum === void 0 || isNaN(interpolatedNum))
          return null;
        const baseNum = Math.floor(interpolatedNum);
        const newValue = fieldValue[baseNum][field];
        let newInterpolatedData = data.filter((d) => d[field] === newValue);
        if (interpolatedNum > baseNum) {
          const nextNum = baseNum + 1;
          const interpolate = interpolatedNum - baseNum;
          newInterpolatedData = newInterpolatedData.map((baseDatum) => {
            const nextDatum = data.find((d) => d[field] === fieldValue[nextNum][field] && !Object.entries(baseDatum).find(([k, v]) => typeof v !== "number" && d[k] !== v));
            return Object.fromEntries(Object.entries(baseDatum).map(([k, v]) => {
              if (typeof v === "number") {
                return [k, v * (1 - interpolate) + nextDatum[k] * interpolate];
              } else {
                return [k, v];
              }
            }));
          });
        }
        return newInterpolatedData.map((d) => {
          if (formula) {
            Object.entries(formula).forEach(([k, v]) => {
              d[k] = v(d);
            });
          }
          return d;
        });
      }
    });
    Service.register("DataJoinService", {
      constructor: AnalysisService,
      evaluate({ data, result, offset, scaleX, scaleY, fieldX, fieldY, replace, self }) {
        if (!result || result.length <= 0)
          return data;
        const layerInstances = self._layerInstances;
        if (layerInstances && layerInstances.length > 0) {
          const datum2 = layerInstances[0].getDatum(result[0]);
          if (datum2) {
            const datumBackup = deepClone(datum2);
            if (offset !== void 0 && scaleX && scaleX.invert && fieldX) {
              datum2[fieldX] = scaleX.invert(scaleX(datum2[fieldX]) + parseFloat(offset.x));
            }
            if (offset !== void 0 && scaleY && scaleY.invert && fieldY && fieldY !== fieldX) {
              datum2[fieldY] = scaleY.invert(scaleY(datum2[fieldY]) + parseFloat(offset.y));
            }
            if (!replace) {
              const newData = deepClone(data);
              Object.assign(datum2, datumBackup);
              return newData;
            } else {
              return data;
            }
          }
        }
        return data;
      }
    });
    Service.register("AggregateService", {
      constructor: AnalysisService,
      evaluate({ result, operation, fields }) {
        if (!(result instanceof Array))
          return 0;
        if (operation === "average") {
          return Object.fromEntries(fields.map((field) => [
            field,
            result.reduce((sum2, d) => sum2 + d[field], 0) / result.length
          ]));
        }
        return result.length;
      }
    });
    Service.register("ReverseSelectionService", {
      constructor: AnalysisService,
      evaluate({ result, self }) {
        const layerInstances = self._layerInstances;
        if (layerInstances && layerInstances.length > 0) {
          const graphic = layerInstances[0].getGraphic();
          const doms = [...graphic.childNodes].filter((el) => layerInstances[0].getDatum(el));
          const domData = doms.map((el) => layerInstances[0].getDatum(el));
          const data = (result || []).map((el) => layerInstances[0].getDatum(el));
          return doms.filter((_, i) => !data.includes(domData[i])).map((d) => layerInstances[0].cloneVisualElements(d, true));
        }
        return [];
      }
    });
    Service.register("RegressionService", {
      constructor: AnalysisService,
      evaluate({ result, xField, yField, self }) {
        if (!result || result.length <= 1 || !(result instanceof Array))
          return null;
        const layerInstances = self._layerInstances;
        if (layerInstances && layerInstances.length > 0) {
          const datum2 = layerInstances[0].getDatum(result[0]);
          if (datum2) {
            result = result.map((d) => layerInstances[0].getDatum(d)).filter((x) => x !== void 0);
          }
        }
        let xValues, yValues;
        if (xField instanceof Function) {
          xValues = result.map((d) => xField(d));
        } else if (xField) {
          xValues = result.map((d) => d[xField]);
        }
        if (yField instanceof Function) {
          yValues = result.map((d) => yField(d));
        } else if (yField) {
          yValues = result.map((d) => d[yField]);
        }
        const xMean = mean(xValues);
        const yMean = mean(yValues);
        const numerator = sum(xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean)));
        const denominator = sum(xValues.map((x) => Math.pow(x - xMean, 2)));
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;
        return {
          slope,
          intercept
        };
      }
    });
  }
});

// dist/esm/service/index.js
var findService2, instanceServices2, Service2;
var init_service2 = __esm({
  "dist/esm/service/index.js"() {
    init_service();
    init_service();
    init_selectionService();
    init_layoutService();
    init_algorithmService();
    findService2 = findService;
    instanceServices2 = instanceServices;
    Service2 = Service;
  }
});

// dist/esm/interactor/actions.jsgf.js
var actions_jsgf_default;
var init_actions_jsgf = __esm({
  "dist/esm/interactor/actions.jsgf.js"() {
    actions_jsgf_default = `#JSGF V1.0;

grammar actions;

public <action> = start | stop | pause | resume | play | delete | add | insert | create | remove | drag | move | drag | brush;`;
  }
});

// dist/esm/interactor/interactor.js
function transferInteractorInnerAction(originAction) {
  const eventStreams = originAction.events.map((evtSelector) => {
    if (typeof evtSelector === "string") {
      return parseEventSelector(evtSelector)[0];
    } else {
      const es = parseEventSelector("*")[0];
      es.filterFuncs = [evtSelector];
    }
  });
  return {
    ...originAction,
    eventStreams: eventStreams.map((es) => transferEventStream(es))
  };
}
function transferEventStream(es) {
  return es.filter ? {
    ...es,
    filterFuncs: es.filter ? es.filter.map((f) => new Function("event", `return ${f}`)) : []
  } : { ...es };
}
var _a3, SR, SGL, registeredInteractors, instanceInteractors, Interactor, register3, unregister3, initialize3, findInteractor;
var init_interactor = __esm({
  "dist/esm/interactor/interactor.js"() {
    init_helpers();
    init_actions_jsgf();
    SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    SGL = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    registeredInteractors = {};
    instanceInteractors = [];
    Interactor = class {
      constructor(baseName4, options) {
        this[_a3] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? baseName4;
        this._state = options.state;
        this._actions = deepClone(options.actions ?? []).map(transferInteractorInnerAction);
        this._modalities = {};
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preUse = options.preUse ?? null;
        this._postUse = options.postUse ?? null;
        options.postInitialize && options.postInitialize.call(this, this);
      }
      enableModality(modal) {
        switch (modal) {
          case "speech":
            if (this._modalities["speech"])
              break;
            const recognition = new SR();
            this._modalities["speech"] = recognition;
            const speechRecognitionList = new SGL();
            speechRecognitionList.addFromString(actions_jsgf_default);
            recognition.grammars = speechRecognitionList;
            recognition.lang = "en-US";
            break;
        }
      }
      disableModality(modal) {
        switch (modal) {
          case "speech":
            if (this._modalities["speech"]) {
              this._modalities.speech.onresult = null;
              this._modalities.speech.onend = null;
              this._modalities["speech"].abort();
              this._modalities["speech"] = null;
            }
            break;
        }
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
        return [
          ...new Set(this._actions.flatMap((action) => action.eventStreams.flatMap((eventStream) => eventStream.type)).concat(["contextmenu"]))
        ];
      }
      async dispatch(event, layer) {
        const moveAction = this._actions.find((action) => {
          const events = action.eventStreams.map((es) => es.type);
          let inculdeEvent = false;
          if (events.includes("*"))
            inculdeEvent = true;
          if (event instanceof Event) {
            inculdeEvent = action.eventStreams.filter((es) => es.type === event.type).some((es) => es.filterFuncs ? es.filterFuncs.every((f) => f(event)) : true);
          } else {
            if (events.includes(event))
              inculdeEvent = true;
          }
          return inculdeEvent && (!action.transition || action.transition.find((transition2) => transition2[0] === this._state || transition2[0] === "*"));
        });
        if (moveAction) {
          const moveTransition = moveAction.transition && moveAction.transition.find((transition2) => transition2[0] === this._state || transition2[0] === "*");
          if (moveTransition) {
            this._state = moveTransition[1];
            if (this._state.startsWith("speech:")) {
              this.enableModality("speech");
              try {
                this._modalities.speech.start();
              } catch {
              }
              this._modalities.speech.onresult = (e) => {
                const result = e.results[e.resultIndex][0];
                this.dispatch(result.transcript, layer);
              };
              this._modalities.speech.onend = (e) => {
                this._modalities.speech.start();
              };
            } else {
              this.disableModality("speech");
            }
            if (moveAction.sideEffect) {
              try {
                await moveAction.sideEffect({
                  self: this,
                  layer,
                  instrument: null,
                  interactor: this,
                  event
                });
              } catch (e) {
                console.error(e);
              }
            }
            return true;
          }
        }
        return false;
      }
      preUse(instrument) {
        this._preUse && this._preUse.call(this, this, instrument);
      }
      postUse(instrument) {
        this._postUse && this._postUse.call(this, this, instrument);
      }
      isInstanceOf(name) {
        return name == "Interactor" || this._baseName === name || this._name === name;
      }
      static register(baseName4, options) {
        registeredInteractors[baseName4] = options;
      }
      static unregister(baseName4) {
        delete registeredInteractors[baseName4];
        return true;
      }
      static initialize(baseName4, options) {
        const mergedOptions = Object.assign({ constructor: Interactor }, registeredInteractors[baseName4] ?? {}, options ?? {});
        const interactor = new mergedOptions.constructor(baseName4, mergedOptions);
        instanceInteractors.push(interactor);
        return interactor;
      }
      static findInteractor(baseNameOrRealName) {
        return instanceInteractors.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
      }
    };
    _a3 = LibraSymbol;
    register3 = Interactor.register;
    unregister3 = Interactor.unregister;
    initialize3 = Interactor.initialize;
    findInteractor = Interactor.findInteractor;
  }
});

// dist/esm/interactor/builtin.js
var init_builtin2 = __esm({
  "dist/esm/interactor/builtin.js"() {
    init_interactor();
    Interactor.register("MousePositionInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "hover",
          events: ["mousemove"],
          transition: [["start", "start"]]
        },
        {
          action: "click",
          events: ["mouseup"],
          transition: [["start", "start"]]
        }
      ]
    });
    Interactor.register("TouchPositionInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "enter",
          events: ["touchstart"],
          transition: [["start", "running"]]
        },
        {
          action: "hover",
          events: ["touchmove"],
          transition: [["running", "running"]]
        },
        {
          action: "leave",
          events: ["touchend"],
          transition: [
            ["running", "start"],
            ["start", "start"]
          ]
        }
      ]
    });
    Interactor.register("MouseTraceInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "dragabort",
          events: ["mousedown[event.button==2]", "mouseup[event.button==2]"],
          transition: [["drag", "start"]]
        },
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
          events: ["mouseup[event.button==0]"],
          transition: [["drag", "start"]]
        }
      ]
    });
    Interactor.register("TouchTraceInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "dragstart",
          events: ["touchstart"],
          transition: [["start", "drag"]]
        },
        {
          action: "drag",
          events: ["touchmove"],
          transition: [["drag", "drag"]]
        },
        {
          action: "dragend",
          events: ["touchend"],
          transition: [["drag", "start"]]
        }
      ]
    });
    Interactor.register("SpeechControlInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "enableSpeech",
          events: ["click"],
          transition: [["*", "speech:ready"]]
        },
        {
          action: "disableSpeech",
          events: ["mouseup[event.button==2]"],
          transition: [["*", "start"]]
        },
        {
          action: "speech",
          events: ["*"],
          transition: [["*", "speech:ready"]]
        }
      ]
    });
    Interactor.register("KeyboardPositionInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "begin",
          events: ["keydown[event.key===' ']"],
          transition: [["start", "running"]]
        },
        {
          action: "up",
          events: [
            "keypress[event.key==='w' || event.key==='W']",
            "keydown[event.key==='ArrowUp']{100}"
          ],
          transition: [["running", "running"]]
        },
        {
          action: "left",
          events: [
            "keypress[event.key==='a' || event.key==='A']",
            "keydown[event.key==='ArrowLeft']{100}"
          ],
          transition: [["running", "running"]]
        },
        {
          action: "down",
          events: [
            "keypress[event.key==='s' || event.key==='S']",
            "keydown[event.key==='ArrowDown']{100}"
          ],
          transition: [["running", "running"]]
        },
        {
          action: "right",
          events: [
            "keypress[event.key==='d' || event.key==='D']",
            "keydown[event.key==='ArrowRight']{100}"
          ],
          transition: [["running", "running"]]
        }
      ]
    });
    Interactor.register("MouseWheelInteractor", {
      constructor: Interactor,
      state: "start",
      actions: [
        {
          action: "enter",
          events: ["mouseenter"],
          transition: [["start", "running"]]
        },
        {
          action: "wheel",
          events: ["wheel", "mousewheel"],
          transition: [["running", "running"]]
        },
        {
          action: "leave",
          events: ["mouseleave"],
          transition: [
            ["running", "start"],
            ["start", "start"]
          ]
        },
        {
          action: "abort",
          events: ["mouseup[event.button==2]"],
          transition: [
            ["running", "running"],
            ["start", "start"]
          ]
        }
      ]
    });
  }
});

// dist/esm/interactor/index.js
var register4, initialize4, findInteractor2, instanceInteractors2, Interactor2;
var init_interactor2 = __esm({
  "dist/esm/interactor/index.js"() {
    init_interactor();
    init_interactor();
    init_builtin2();
    register4 = Interactor.register;
    initialize4 = Interactor.initialize;
    findInteractor2 = Interactor.findInteractor;
    instanceInteractors2 = instanceInteractors;
    Interactor2 = Interactor;
  }
});

// dist/esm/layer/layer.js
function register5(baseName4, options) {
  registeredLayers[baseName4] = options;
}
function initialize5(baseName4, options) {
  const mergedOptions = Object.assign({ constructor: Layer }, registeredLayers[baseName4] ?? {}, options ?? {}, {});
  const layer = new mergedOptions.constructor(baseName4, mergedOptions);
  return layer;
}
function findLayer(baseNameOrRealName) {
  return instanceLayers.filter((layer) => layer.isInstanceOf(baseNameOrRealName));
}
var _a4, registeredLayers, instanceLayers, siblingLayers, orderLayers, Layer;
var init_layer = __esm({
  "dist/esm/layer/layer.js"() {
    init_helpers();
    registeredLayers = {};
    instanceLayers = [];
    siblingLayers = new Map();
    orderLayers = new Map();
    Layer = class {
      constructor(baseName4, options) {
        this._nextTick = 0;
        this[_a4] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? baseName4;
        this._container = options.container;
        this._order = 0;
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preUpdate = options.preUpdate ?? null;
        this._postUpdate = options.postUpdate ?? null;
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
      cloneVisualElements(element, deep = false) {
        const copiedElement = element.cloneNode(deep);
        const frag = document.createDocumentFragment();
        frag.append(copiedElement);
        copiedElement.__libra__screenElement = element;
        return copiedElement;
      }
      getDatum(elem) {
        return null;
      }
      join(rightTable, joinKey) {
        return [];
      }
      preUpdate() {
        this._preUpdate && this._preUpdate.call(this, this);
      }
      postUpdate() {
        this._postUpdate && this._postUpdate.call(this, this);
      }
      picking(options) {
        return [];
      }
      isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].x, yi = polygon[i].y;
          const xj = polygon[j].x, yj = polygon[j].y;
          const intersect = yi > point.y !== yj > point.y && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi;
          if (intersect)
            inside = !inside;
        }
        return inside;
      }
      pathIntersectsRect(path, rect) {
        const pathLength = path.getTotalLength();
        if (pathLength <= 0)
          return false;
        const step = pathLength / 100;
        for (let i = 0; i <= pathLength; i += step) {
          const point = path.getPointAtLength(i);
          if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
            return true;
          }
        }
        return false;
      }
      getLayerFromQueue(siblingLayerName) {
        if (!siblingLayers.has(this)) {
          siblingLayers.set(this, { [this._name]: this });
        }
        if (!orderLayers.has(this)) {
          orderLayers.set(this, { [this._name]: 0 });
        }
        const siblings = siblingLayers.get(this);
        if (!(siblingLayerName in siblings)) {
          const layer = Layer.initialize(this._baseName, {
            ...this._userOptions,
            name: siblingLayerName,
            group: "",
            redraw() {
            }
          });
          siblings[siblingLayerName] = layer;
          siblingLayers.set(layer, siblings);
          const graphic = siblings[siblingLayerName].getGraphic();
          graphic && graphic.style && (graphic.style.pointerEvents = "none");
        }
        if (!(siblingLayerName in orderLayers.get(this))) {
          orderLayers.get(this)[siblingLayerName] = 0;
        }
        return siblings[siblingLayerName];
      }
      setLayersOrder(layerNameOrderKVPairs) {
        if (!siblingLayers.has(this)) {
          siblingLayers.set(this, { [this._name]: this });
        }
        if (!orderLayers.has(this)) {
          orderLayers.set(this, { [this._name]: 0 });
        }
        const orders = orderLayers.get(this);
        const frag = document.createDocumentFragment();
        Object.entries(layerNameOrderKVPairs).forEach(([layerName, order]) => {
          orders[layerName] = order;
        });
        Object.entries(orders).sort((a, b) => a[1] - b[1]).forEach(([layerName, order]) => {
          orders[layerName] = order;
          orderLayers.set(this.getLayerFromQueue(layerName), orders);
          if (order >= 0) {
            const graphic = this.getLayerFromQueue(layerName).getGraphic(true);
            graphic && graphic.style && (graphic.style.display = "initial");
          } else {
            const graphic = this.getLayerFromQueue(layerName).getGraphic(true);
            graphic && graphic.style && (graphic.style.display = "none");
          }
          this.getLayerFromQueue(layerName)._order = order;
          frag.append(this.getLayerFromQueue(layerName).getGraphic(true));
        });
        this.getContainerGraphic().appendChild(frag);
      }
      isInstanceOf(name) {
        return this._baseName === name || this._name === name;
      }
    };
    _a4 = LibraSymbol;
    Layer.register = register5;
    Layer.initialize = initialize5;
    Layer.findLayer = findLayer;
  }
});

// dist/esm/layer/d3Layer.js
var baseName, backgroundClassName, D3Layer;
var init_d3Layer = __esm({
  "dist/esm/layer/d3Layer.js"() {
    init_layer();
    init_d3();
    init_helpers();
    baseName = "D3Layer";
    backgroundClassName = "ig-layer-background";
    D3Layer = class extends Layer {
      constructor(baseName4, options) {
        super(baseName4, options);
        this._width = options.width;
        this._height = options.height;
        this._offset = options.offset;
        this._name = options.name;
        this._graphic = select_default2(options.container).append("g").call((g) => {
          if (this._name)
            g.attr("className", this._name);
        }).call((g) => {
          if (this._offset)
            g.attr("transform", `translate(${this._offset.x || 0}, ${this._offset.y || 0})`);
        }).node();
        select_default2(this._graphic).append("rect").attr("class", backgroundClassName).attr("width", this._width).attr("height", this._height).attr("opacity", 0);
        let tempElem = this._container;
        while (tempElem && tempElem.tagName !== "svg")
          tempElem = tempElem.parentElement;
        if (tempElem.tagName !== "svg")
          throw Error("Container must be wrapped in SVGSVGElement");
        this._svg = tempElem;
        this._postInitialize && this._postInitialize.call(this, this);
      }
      getDatum(elem) {
        if (!elem || elem instanceof Array && elem.length == 0)
          return null;
        if (elem instanceof Array) {
          return selectAll_default2(elem).datum();
        }
        return select_default2(elem).datum();
      }
      getVisualElements() {
        const elems = [
          ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName})`)
        ];
        return elems;
      }
      cloneVisualElements(element, deep = false) {
        const copiedElement = select_default2(element).clone(deep).node();
        const frag = document.createDocumentFragment();
        frag.append(copiedElement);
        copiedElement.__libra__screenElement = element;
        return copiedElement;
      }
      select(selector) {
        return this._graphic.querySelectorAll(selector);
      }
      picking(options) {
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
          result = [...document.elementsFromPoint(x, y)].filter(this._isElementInLayer.bind(this));
          if (result.length >= 1) {
            result = [result[0]];
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
          const zeroStrokeWidthPaths = [
            ...this._graphic.querySelectorAll("path")
          ].filter((path) => {
            const computedStyle = window.getComputedStyle(path);
            return computedStyle.fill === "none";
          });
          if (zeroStrokeWidthPaths.length > 0) {
            const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
              const transformedRect = this.transformRect(innerRect, this._graphic);
              return this.pathIntersectsRect(path, transformedRect);
            });
            customIntersectingPaths.forEach((elem) => elemSet.add(elem));
          }
          const outerRectWidth = r;
          const outerRectX = x - r;
          const outerRectY = y - r;
          const outerElemSet = new Set();
          const outerRect = this._svg.createSVGRect();
          outerRect.x = outerRectX;
          outerRect.y = outerRectY;
          outerRect.width = outerRectWidth * 2;
          outerRect.height = outerRectWidth * 2;
          this._svg.getIntersectionList(outerRect, this._graphic).forEach((elem) => outerElemSet.add(elem));
          if (zeroStrokeWidthPaths.length > 0) {
            const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
              const transformedRect = this.transformRect(outerRect, this._graphic);
              return this.pathIntersectsRect(path, transformedRect);
            });
            customIntersectingPaths.forEach((elem) => outerElemSet.add(elem));
          }
          let outer = 1;
          while (true) {
            for (let elem of outerElemSet) {
              if (elemSet.has(elem))
                outerElemSet.delete(elem);
            }
            if (!outerElemSet.size)
              break;
            if (outer * 2 + innerRectWidth >= r * 2)
              break;
            const w = Math.sqrt(r * r - Math.pow(innerRectWidth / 2 + outer, 2));
            const topRect = this._svg.createSVGRect();
            topRect.x = x - w;
            topRect.y = innerRectY - outer;
            topRect.width = w * 2;
            topRect.height = 1;
            const bottomRect = this._svg.createSVGRect();
            bottomRect.x = x - w;
            bottomRect.y = innerRectY + innerRectWidth + outer - 1;
            bottomRect.width = w * 2;
            bottomRect.height = 1;
            const leftRect = this._svg.createSVGRect();
            leftRect.x = innerRectX - outer;
            leftRect.y = y - w;
            leftRect.width = 1;
            leftRect.height = w * 2;
            const rightRect = this._svg.createSVGRect();
            rightRect.x = innerRectX + innerRectWidth + outer - 1;
            rightRect.y = y - w;
            rightRect.width = 1;
            rightRect.height = w * 2;
            [topRect, bottomRect, leftRect, rightRect].forEach((rect) => {
              this._svg.getIntersectionList(rect, this._graphic).forEach((elem) => elemSet.add(elem));
              const zeroStrokeWidthPaths2 = [
                ...this._graphic.querySelectorAll("path")
              ].filter((path) => {
                const computedStyle = window.getComputedStyle(path);
                return computedStyle.fill === "none";
              });
              if (zeroStrokeWidthPaths2.length > 0) {
                const customIntersectingPaths = zeroStrokeWidthPaths2.filter((path) => {
                  const transformedRect = this.transformRect(rect, this._graphic);
                  return this.pathIntersectsRect(path, transformedRect);
                });
                customIntersectingPaths.forEach((elem) => elemSet.add(elem));
              }
            });
            outer++;
          }
          result = [...elemSet].filter(this._isElementInLayer.bind(this));
        } else if (options.type === ShapeQueryType.Rect) {
          const { x, y, width, height } = options;
          const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
          const rect = this._svg.createSVGRect();
          rect.x = x0;
          rect.y = y0;
          rect.width = absWidth;
          rect.height = absHeight;
          result = [...this._svg.getIntersectionList(rect, this._graphic)].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName));
          const zeroStrokeWidthPaths = [
            ...this._graphic.querySelectorAll("path")
          ].filter((path) => {
            const computedStyle = window.getComputedStyle(path);
            return computedStyle.fill === "none";
          });
          if (zeroStrokeWidthPaths.length > 0) {
            const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
              const transformedRect = this.transformRect(rect, this._graphic);
              return this.pathIntersectsRect(path, transformedRect);
            });
            result = [...new Set([...result, ...customIntersectingPaths])];
          }
        } else if (options.type === ShapeQueryType.Polygon) {
          const { points } = options;
          const svgBCR2 = this._svg.getBoundingClientRect();
          const adjustedPoints = points.map((p) => ({
            x: p.x - svgBCR2.left,
            y: p.y - svgBCR2.top
          }));
          const elemSet = new Set();
          this.queryLargestRectangles(adjustedPoints, elemSet);
          result = Array.from(elemSet);
        }
        const resultWithSVGGElement = [];
        while (result.length > 0) {
          const elem = result.shift();
          resultWithSVGGElement.push(elem);
          if (elem.parentElement.tagName === "g" && this._graphic.contains(elem.parentElement) && this._graphic !== elem.parentElement)
            result.push(elem.parentElement);
        }
        return resultWithSVGGElement;
      }
      _dataQuery(options) {
        let result = [];
        const visualElements = selectAll_default2(this.getVisualElements());
        if (options.type === DataQueryType.Quantitative) {
          const { attrName, extent } = options;
          if (attrName instanceof Array) {
            let intermediateResult = visualElements;
            attrName.forEach((attrName2, i) => {
              const ext = extent[i];
              intermediateResult = intermediateResult.filter((d) => d && d[attrName2] !== void 0 && ext[0] < d[attrName2] && d[attrName2] < ext[1]);
            });
            result = intermediateResult.nodes();
          } else {
            result = visualElements.filter((d) => d && d[attrName] !== void 0 && extent[0] < d[attrName] && d[attrName] < extent[1]).nodes();
          }
        } else if (options.type === DataQueryType.Nominal) {
          const { attrName, extent } = options;
          if (attrName instanceof Array) {
            let intermediateResult = visualElements;
            attrName.forEach((attrName2, i) => {
              const ext = extent[i];
              intermediateResult = intermediateResult.filter((d) => d && d[attrName2] !== void 0 && ext.findIndex(d[attrName2]) >= 0);
            });
            result = intermediateResult.nodes();
          } else {
            result = visualElements.filter((d) => d && d[attrName] !== void 0 && extent.findIndex(d[attrName]) >= 0).nodes();
          }
        } else if (options.type === DataQueryType.Temporal) {
          const { attrName, extent } = options;
          if (attrName instanceof Array) {
            let intermediateResult = visualElements;
            attrName.forEach((attrName2, i) => {
              const ext = extent[i];
              const dateParser = options.dateParser?.[i] ?? ((d) => d);
              intermediateResult = intermediateResult.filter((d) => d && d[attrName2] !== void 0 && ext[0].getTime() < dateParser(d[attrName2]).getTime() && dateParser(d[attrName2]).getTime() < ext[1].getTime());
            });
            result = intermediateResult.nodes();
          } else {
            const dateParser = options.dateParser || ((d) => d);
            result = visualElements.filter((d) => d && d[attrName] !== void 0 && extent[0].getTime() < dateParser(d[attrName]).getTime() && dateParser(d[attrName]).getTime() < extent[1].getTime()).nodes();
          }
        }
        return result;
      }
      _attrQuery(options) {
        const { attrName, value } = options;
        const result = select_default2(this._graphic).filter((d) => d[attrName] === value).nodes();
        return result;
      }
      transformRect(rect, referenceElement) {
        if (!this._offset)
          return rect;
        const transformedRect = this._svg.createSVGRect();
        transformedRect.x = rect.x - this._offset.x;
        transformedRect.y = rect.y - this._offset.y;
        transformedRect.width = rect.width;
        transformedRect.height = rect.height;
        return transformedRect;
      }
      queryLargestRectangles(points, elemSet) {
        const boundingBox = this.getBoundingBox(points);
        if ((boundingBox.maxX - boundingBox.minX) * (boundingBox.maxY - boundingBox.minY) < 100) {
          this.queryPolygon(points, elemSet);
          return;
        }
        const largestRect = this.findLargestRectangle(points, boundingBox);
        const rect = this._svg.createSVGRect();
        rect.x = largestRect.x;
        rect.y = largestRect.y;
        rect.width = largestRect.width;
        rect.height = largestRect.height;
        const intersectingElements = [
          ...this._svg.getIntersectionList(rect, this._graphic)
        ].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName));
        intersectingElements.forEach((elem) => elemSet.add(elem));
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
          const computedStyle = window.getComputedStyle(path);
          return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
          const customIntersectingPaths = zeroFillPaths.filter((path) => {
            const transformedRect = this.transformRect(rect, this._graphic);
            return this.pathIntersectsRect(path, transformedRect);
          });
          customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
        const remainingPolygons = this.subtractRectFromPolygon(points, largestRect);
        remainingPolygons.forEach((polygon) => this.queryLargestRectangles(polygon, elemSet));
      }
      getBoundingBox(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of points) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
        return { minX, minY, maxX, maxY };
      }
      findLargestRectangle(points, boundingBox) {
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        let largestArea = 0;
        let largestRect = { x: 0, y: 0, width: 0, height: 0 };
        for (let x = boundingBox.minX; x < boundingBox.maxX; x += width / 10) {
          for (let y = boundingBox.minY; y < boundingBox.maxY; y += height / 10) {
            for (let w = width / 10; x + w <= boundingBox.maxX; w += width / 10) {
              for (let h = height / 10; y + h <= boundingBox.maxY; h += height / 10) {
                if (this.isRectangleInPolygon({ x, y, width: w, height: h }, points)) {
                  const area = w * h;
                  if (area > largestArea) {
                    largestArea = area;
                    largestRect = { x, y, width: w, height: h };
                  }
                }
              }
            }
          }
        }
        return largestRect;
      }
      isRectangleInPolygon(rect, polygon) {
        const corners = [
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width, y: rect.y + rect.height },
          { x: rect.x, y: rect.y + rect.height }
        ];
        return corners.every((corner) => this.isPointInPolygon(corner, polygon));
      }
      subtractRectFromPolygon(polygon, rect) {
        const remainingPoints = polygon.filter((point) => !(point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height));
        const rectCorners = [
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width, y: rect.y + rect.height },
          { x: rect.x, y: rect.y + rect.height }
        ];
        return [remainingPoints.concat(rectCorners)];
      }
      queryPolygon(points, elemSet) {
        const boundingBox = this.getBoundingBox(points);
        const rect = this._svg.createSVGRect();
        rect.x = boundingBox.minX;
        rect.y = boundingBox.minY;
        rect.width = boundingBox.maxX - boundingBox.minX;
        rect.height = boundingBox.maxY - boundingBox.minY;
        const potentialElements = [
          ...this._svg.getIntersectionList(rect, this._graphic)
        ].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName));
        potentialElements.forEach((elem) => {
          const bbox = elem.getBBox();
          const elemPoints = [
            { x: bbox.x, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
            { x: bbox.x, y: bbox.y + bbox.height }
          ];
          if (elemPoints.some((point) => this.isPointInPolygon(point, points))) {
            elemSet.add(elem);
          }
        });
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
          const computedStyle = window.getComputedStyle(path);
          return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
          const customIntersectingPaths = zeroFillPaths.filter((path) => {
            const transformedRect = this.transformRect(rect, this._graphic);
            return this.pathIntersectsRect(path, transformedRect);
          });
          customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
      }
      pathIntersectsPolygon(path, polygon) {
        const pathLength = path.getTotalLength();
        const step = pathLength / 100;
        for (let i = 0; i <= pathLength; i += step) {
          const point = path.getPointAtLength(i);
          if (this.isPointInPolygon(point, polygon)) {
            return true;
          }
        }
        return false;
      }
    };
    Layer.D3Layer = D3Layer;
    Layer.register(baseName, { constructor: D3Layer });
    Layer.register(baseName, { constructor: D3Layer });
  }
});

// node_modules/transformation-matrix/src/applyToPoint.js
var init_applyToPoint = __esm({
  "node_modules/transformation-matrix/src/applyToPoint.js"() {
  }
});

// node_modules/transformation-matrix/src/fromObject.js
function fromObject(object) {
  return {
    a: parseFloat(object.a),
    b: parseFloat(object.b),
    c: parseFloat(object.c),
    d: parseFloat(object.d),
    e: parseFloat(object.e),
    f: parseFloat(object.f)
  };
}
var init_fromObject = __esm({
  "node_modules/transformation-matrix/src/fromObject.js"() {
  }
});

// node_modules/transformation-matrix/src/fromString.js
var init_fromString = __esm({
  "node_modules/transformation-matrix/src/fromString.js"() {
  }
});

// node_modules/transformation-matrix/src/identity.js
var init_identity2 = __esm({
  "node_modules/transformation-matrix/src/identity.js"() {
  }
});

// node_modules/transformation-matrix/src/inverse.js
var init_inverse = __esm({
  "node_modules/transformation-matrix/src/inverse.js"() {
  }
});

// node_modules/transformation-matrix/src/utils.js
function isUndefined(val) {
  return typeof val === "undefined";
}
var init_utils = __esm({
  "node_modules/transformation-matrix/src/utils.js"() {
  }
});

// node_modules/transformation-matrix/src/isAffineMatrix.js
var init_isAffineMatrix = __esm({
  "node_modules/transformation-matrix/src/isAffineMatrix.js"() {
    init_utils();
  }
});

// node_modules/transformation-matrix/src/translate.js
function translate(tx, ty = 0) {
  return {
    a: 1,
    c: 0,
    e: tx,
    b: 0,
    d: 1,
    f: ty
  };
}
var init_translate = __esm({
  "node_modules/transformation-matrix/src/translate.js"() {
  }
});

// node_modules/transformation-matrix/src/transform.js
function transform2(...matrices) {
  matrices = Array.isArray(matrices[0]) ? matrices[0] : matrices;
  const multiply = (m1, m2) => {
    return {
      a: m1.a * m2.a + m1.c * m2.b,
      c: m1.a * m2.c + m1.c * m2.d,
      e: m1.a * m2.e + m1.c * m2.f + m1.e,
      b: m1.b * m2.a + m1.d * m2.b,
      d: m1.b * m2.c + m1.d * m2.d,
      f: m1.b * m2.e + m1.d * m2.f + m1.f
    };
  };
  switch (matrices.length) {
    case 0:
      throw new Error("no matrices provided");
    case 1:
      return matrices[0];
    case 2:
      return multiply(matrices[0], matrices[1]);
    default: {
      const [m1, m2, ...rest] = matrices;
      const m = multiply(m1, m2);
      return transform2(m, ...rest);
    }
  }
}
function compose(...matrices) {
  return transform2(...matrices);
}
var init_transform3 = __esm({
  "node_modules/transformation-matrix/src/transform.js"() {
  }
});

// node_modules/transformation-matrix/src/rotate.js
function rotate(angle, cx, cy) {
  const cosAngle = cos(angle);
  const sinAngle = sin(angle);
  const rotationMatrix = {
    a: cosAngle,
    c: -sinAngle,
    e: 0,
    b: sinAngle,
    d: cosAngle,
    f: 0
  };
  if (isUndefined(cx) || isUndefined(cy)) {
    return rotationMatrix;
  }
  return transform2([
    translate(cx, cy),
    rotationMatrix,
    translate(-cx, -cy)
  ]);
}
function rotateDEG(angle, cx = void 0, cy = void 0) {
  return rotate(angle * PI / 180, cx, cy);
}
var cos, sin, PI;
var init_rotate = __esm({
  "node_modules/transformation-matrix/src/rotate.js"() {
    init_utils();
    init_translate();
    init_transform3();
    ({ cos, sin, PI } = Math);
  }
});

// node_modules/transformation-matrix/src/scale.js
function scale(sx, sy = void 0, cx = void 0, cy = void 0) {
  if (isUndefined(sy))
    sy = sx;
  const scaleMatrix = {
    a: sx,
    c: 0,
    e: 0,
    b: 0,
    d: sy,
    f: 0
  };
  if (isUndefined(cx) || isUndefined(cy)) {
    return scaleMatrix;
  }
  return transform2([
    translate(cx, cy),
    scaleMatrix,
    translate(-cx, -cy)
  ]);
}
var init_scale = __esm({
  "node_modules/transformation-matrix/src/scale.js"() {
    init_utils();
    init_translate();
    init_transform3();
  }
});

// node_modules/transformation-matrix/src/shear.js
function shear(shx, shy) {
  return {
    a: 1,
    c: shx,
    e: 0,
    b: shy,
    d: 1,
    f: 0
  };
}
var init_shear = __esm({
  "node_modules/transformation-matrix/src/shear.js"() {
  }
});

// node_modules/transformation-matrix/src/skew.js
function skew(ax, ay) {
  return {
    a: 1,
    c: tan(ax),
    e: 0,
    b: tan(ay),
    d: 1,
    f: 0
  };
}
function skewDEG(ax, ay) {
  return skew(ax * Math.PI / 180, ay * Math.PI / 180);
}
var tan;
var init_skew = __esm({
  "node_modules/transformation-matrix/src/skew.js"() {
    ({ tan } = Math);
  }
});

// node_modules/transformation-matrix/src/toString.js
var init_toString = __esm({
  "node_modules/transformation-matrix/src/toString.js"() {
  }
});

// node_modules/transformation-matrix/src/smoothMatrix.js
var init_smoothMatrix = __esm({
  "node_modules/transformation-matrix/src/smoothMatrix.js"() {
  }
});

// node_modules/transformation-matrix/src/fromTriangles.js
var init_fromTriangles = __esm({
  "node_modules/transformation-matrix/src/fromTriangles.js"() {
    init_inverse();
    init_transform3();
    init_smoothMatrix();
  }
});

// node_modules/transformation-matrix/src/fromDefinition.js
function fromDefinition(definitionOrArrayOfDefinition) {
  return Array.isArray(definitionOrArrayOfDefinition) ? definitionOrArrayOfDefinition.map(mapper) : mapper(definitionOrArrayOfDefinition);
  function mapper(descriptor) {
    switch (descriptor.type) {
      case "matrix":
        if ("a" in descriptor && "b" in descriptor && "c" in descriptor && "d" in descriptor && "e" in descriptor && "f" in descriptor) {
          return fromObject(descriptor);
        } else {
          throw new Error("MISSING_MANDATORY_PARAM");
        }
      case "translate":
        if (!("tx" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        if ("ty" in descriptor)
          return translate(descriptor.tx, descriptor.ty);
        return translate(descriptor.tx);
      case "scale":
        if (!("sx" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        if ("sy" in descriptor)
          return scale(descriptor.sx, descriptor.sy);
        return scale(descriptor.sx);
      case "rotate":
        if (!("angle" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        if ("cx" in descriptor && "cy" in descriptor) {
          return rotateDEG(descriptor.angle, descriptor.cx, descriptor.cy);
        }
        return rotateDEG(descriptor.angle);
      case "skewX":
        if (!("angle" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        return skewDEG(descriptor.angle, 0);
      case "skewY":
        if (!("angle" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        return skewDEG(0, descriptor.angle);
      case "shear":
        if (!("shx" in descriptor && "shy" in descriptor))
          throw new Error("MISSING_MANDATORY_PARAM");
        return shear(descriptor.shx, descriptor.shy);
      default:
        throw new Error("UNSUPPORTED_DESCRIPTOR");
    }
  }
}
var init_fromDefinition = __esm({
  "node_modules/transformation-matrix/src/fromDefinition.js"() {
    init_fromObject();
    init_translate();
    init_scale();
    init_rotate();
    init_skew();
    init_shear();
  }
});

// node_modules/transformation-matrix/src/fromTransformAttribute.autogenerated.js
function peg$subclass(child, parent) {
  function C() {
    this.constructor = child;
  }
  C.prototype = parent.prototype;
  child.prototype = new C();
}
function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}
function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) {
    return str;
  }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  var peg$FAILED = {};
  var peg$source = options.grammarSource;
  var peg$startRuleFunctions = { transformList: peg$parsetransformList };
  var peg$startRuleFunction = peg$parsetransformList;
  var peg$c0 = "matrix";
  var peg$c1 = "(";
  var peg$c2 = ")";
  var peg$c3 = "translate";
  var peg$c4 = "scale";
  var peg$c5 = "rotate";
  var peg$c6 = "skewX";
  var peg$c7 = "skewY";
  var peg$c8 = ",";
  var peg$c9 = ".";
  var peg$r0 = /^[eE]/;
  var peg$r1 = /^[+\-]/;
  var peg$r2 = /^[0-9]/;
  var peg$r3 = /^[ \t\r\n]/;
  var peg$e0 = peg$literalExpectation("matrix", false);
  var peg$e1 = peg$literalExpectation("(", false);
  var peg$e2 = peg$literalExpectation(")", false);
  var peg$e3 = peg$literalExpectation("translate", false);
  var peg$e4 = peg$literalExpectation("scale", false);
  var peg$e5 = peg$literalExpectation("rotate", false);
  var peg$e6 = peg$literalExpectation("skewX", false);
  var peg$e7 = peg$literalExpectation("skewY", false);
  var peg$e8 = peg$literalExpectation(",", false);
  var peg$e9 = peg$otherExpectation("fractionalConstant");
  var peg$e10 = peg$literalExpectation(".", false);
  var peg$e11 = peg$classExpectation(["e", "E"], false, false);
  var peg$e12 = peg$classExpectation(["+", "-"], false, false);
  var peg$e13 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e14 = peg$classExpectation([" ", "	", "\r", "\n"], false, false);
  var peg$f0 = function(ts) {
    return ts;
  };
  var peg$f1 = function(t, ts) {
    return t.concat(ts);
  };
  var peg$f2 = function(a, b, c, d, e, f) {
    return [{ type: "matrix", a, b, c, d, e, f }];
  };
  var peg$f3 = function(tx, ty) {
    var t = { type: "translate", tx };
    if (ty)
      t.ty = ty;
    return [t];
  };
  var peg$f4 = function(sx, sy) {
    var s = { type: "scale", sx };
    if (sy)
      s.sy = sy;
    return [s];
  };
  var peg$f5 = function(angle, c) {
    var r = { type: "rotate", angle };
    if (c) {
      r.cx = c[0];
      r.cy = c[1];
    }
    return [r];
  };
  var peg$f6 = function(angle) {
    return [{ type: "skewX", angle }];
  };
  var peg$f7 = function(angle) {
    return [{ type: "skewY", angle }];
  };
  var peg$f8 = function(f) {
    return parseFloat(f.join(""));
  };
  var peg$f9 = function(i) {
    return parseInt(i.join(""));
  };
  var peg$f10 = function(n) {
    return n;
  };
  var peg$f11 = function(n1, n2) {
    return [n1, n2];
  };
  var peg$f12 = function(ds) {
    return ds.join("");
  };
  var peg$f13 = function(f, e) {
    return [f, e || null].join("");
  };
  var peg$f14 = function(d, e) {
    return [d, e].join("");
  };
  var peg$f15 = function(d1, d2) {
    return [d1 ? d1.join("") : null, ".", d2.join("")].join("");
  };
  var peg$f16 = function(d) {
    return d.join("");
  };
  var peg$f17 = function(s, d) {
    return ["e", s, d.join("")].join("");
  };
  var peg$currPos = 0;
  var peg$savedPos = 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = 0;
  var peg$maxFailExpected = [];
  var peg$silentFails = 0;
  var peg$result;
  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location2);
  }
  function error(message, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location2);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts, inverted, ignoreCase };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;
    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);
    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset2 && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildSimpleError(message, location2) {
    return new peg$SyntaxError(message, null, null, location2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected2, found), expected2, found, location2);
  }
  function peg$parsetransformList() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsewsp();
    }
    s2 = peg$parsetransforms();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = [];
    s4 = peg$parsewsp();
    while (s4 !== peg$FAILED) {
      s3.push(s4);
      s4 = peg$parsewsp();
    }
    peg$savedPos = s0;
    s0 = peg$f0(s2);
    return s0;
  }
  function peg$parsetransforms() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsetransform();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsecommaWsp();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsecommaWsp();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetransforms();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f1(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsetransform();
    }
    return s0;
  }
  function peg$parsetransform() {
    var s0;
    s0 = peg$parsematrix();
    if (s0 === peg$FAILED) {
      s0 = peg$parsetranslate();
      if (s0 === peg$FAILED) {
        s0 = peg$parsescale();
        if (s0 === peg$FAILED) {
          s0 = peg$parserotate();
          if (s0 === peg$FAILED) {
            s0 = peg$parseskewX();
            if (s0 === peg$FAILED) {
              s0 = peg$parseskewY();
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parsematrix() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecommaWsp();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsenumber();
            if (s7 !== peg$FAILED) {
              s8 = peg$parsecommaWsp();
              if (s8 !== peg$FAILED) {
                s9 = peg$parsenumber();
                if (s9 !== peg$FAILED) {
                  s10 = peg$parsecommaWsp();
                  if (s10 !== peg$FAILED) {
                    s11 = peg$parsenumber();
                    if (s11 !== peg$FAILED) {
                      s12 = peg$parsecommaWsp();
                      if (s12 !== peg$FAILED) {
                        s13 = peg$parsenumber();
                        if (s13 !== peg$FAILED) {
                          s14 = peg$parsecommaWsp();
                          if (s14 !== peg$FAILED) {
                            s15 = peg$parsenumber();
                            if (s15 !== peg$FAILED) {
                              s16 = [];
                              s17 = peg$parsewsp();
                              while (s17 !== peg$FAILED) {
                                s16.push(s17);
                                s17 = peg$parsewsp();
                              }
                              if (input.charCodeAt(peg$currPos) === 41) {
                                s17 = peg$c2;
                                peg$currPos++;
                              } else {
                                s17 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e2);
                                }
                              }
                              if (s17 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f2(s5, s7, s9, s11, s13, s15);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetranslate() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9) === peg$c3) {
      s1 = peg$c3;
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e3);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecommaWspNumber();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = [];
          s8 = peg$parsewsp();
          while (s8 !== peg$FAILED) {
            s7.push(s8);
            s8 = peg$parsewsp();
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s8 = peg$c2;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s8 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f3(s5, s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsescale() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c4) {
      s1 = peg$c4;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecommaWspNumber();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = [];
          s8 = peg$parsewsp();
          while (s8 !== peg$FAILED) {
            s7.push(s8);
            s8 = peg$parsewsp();
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s8 = peg$c2;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s8 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f4(s5, s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parserotate() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c5) {
      s1 = peg$c5;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecommaWspTwoNumbers();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = [];
          s8 = peg$parsewsp();
          while (s8 !== peg$FAILED) {
            s7.push(s8);
            s8 = peg$parsewsp();
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s8 = peg$c2;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s8 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f5(s5, s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseskewX() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c6) {
      s1 = peg$c6;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = [];
          s7 = peg$parsewsp();
          while (s7 !== peg$FAILED) {
            s6.push(s7);
            s7 = peg$parsewsp();
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s7 = peg$c2;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f6(s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseskewY() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c7) {
      s1 = peg$c7;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e7);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s6 = [];
          s7 = peg$parsewsp();
          while (s7 !== peg$FAILED) {
            s6.push(s7);
            s7 = peg$parsewsp();
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s7 = peg$c2;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f7(s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsenumber() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsesign();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$parsefloatingPointConstant();
    if (s3 !== peg$FAILED) {
      s2 = [s2, s3];
      s1 = s2;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f8(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsesign();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parseintegerConstant();
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f9(s1);
      }
      s0 = s1;
    }
    return s0;
  }
  function peg$parsecommaWspNumber() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecommaWsp();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f10(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecommaWspTwoNumbers() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsecommaWsp();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecommaWsp();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsenumber();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f11(s2, s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecommaWsp() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewsp();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = [];
      s4 = peg$parsewsp();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parsewsp();
      }
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsecomma();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsewsp();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsewsp();
        }
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsecomma() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 44) {
      s0 = peg$c8;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e8);
      }
    }
    return s0;
  }
  function peg$parseintegerConstant() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsedigitSequence();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f12(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsefloatingPointConstant() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsefractionalConstant();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseexponent();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f13(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsedigitSequence();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseexponent();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f14(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsefractionalConstant() {
    var s0, s1, s2, s3;
    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parsedigitSequence();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (input.charCodeAt(peg$currPos) === 46) {
      s2 = peg$c9;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e10);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsedigitSequence();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f15(s1, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsedigitSequence();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s2 = peg$c9;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f16(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e9);
      }
    }
    return s0;
  }
  function peg$parseexponent() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (peg$r0.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e11);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesign();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parsedigitSequence();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f17(s2, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesign() {
    var s0;
    if (peg$r1.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e12);
      }
    }
    return s0;
  }
  function peg$parsedigitSequence() {
    var s0, s1;
    s0 = [];
    s1 = peg$parsedigit();
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsedigit();
      }
    } else {
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsedigit() {
    var s0;
    if (peg$r2.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e13);
      }
    }
    return s0;
  }
  function peg$parsewsp() {
    var s0;
    if (peg$r3.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e14);
      }
    }
    return s0;
  }
  peg$result = peg$startRuleFunction();
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
  }
}
var init_fromTransformAttribute_autogenerated = __esm({
  "node_modules/transformation-matrix/src/fromTransformAttribute.autogenerated.js"() {
    peg$subclass(peg$SyntaxError, Error);
    peg$SyntaxError.prototype.format = function(sources) {
      var str = "Error: " + this.message;
      if (this.location) {
        var src = null;
        var k;
        for (k = 0; k < sources.length; k++) {
          if (sources[k].source === this.location.source) {
            src = sources[k].text.split(/\r\n|\n|\r/g);
            break;
          }
        }
        var s = this.location.start;
        var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
        var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
        if (src) {
          var e = this.location.end;
          var filler = peg$padEnd("", offset_s.line.toString().length, " ");
          var line = src[s.line - 1];
          var last = s.line === e.line ? e.column : line.length + 1;
          var hatLen = last - s.column || 1;
          str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
        } else {
          str += "\n at " + loc;
        }
      }
      return str;
    };
    peg$SyntaxError.buildMessage = function(expected, found) {
      var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return '"' + literalEscape(expectation.text) + '"';
        },
        class: function(expectation) {
          var escapedParts = expectation.parts.map(function(part) {
            return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
          });
          return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
        },
        any: function() {
          return "any character";
        },
        end: function() {
          return "end of input";
        },
        other: function(expectation) {
          return expectation.description;
        }
      };
      function hex2(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
      }
      function literalEscape(s) {
        return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
          return "\\x0" + hex2(ch);
        }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
          return "\\x" + hex2(ch);
        });
      }
      function classEscape(s) {
        return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
          return "\\x0" + hex2(ch);
        }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
          return "\\x" + hex2(ch);
        });
      }
      function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
      }
      function describeExpected(expected2) {
        var descriptions = expected2.map(describeExpectation);
        var i, j;
        descriptions.sort();
        if (descriptions.length > 0) {
          for (i = 1, j = 1; i < descriptions.length; i++) {
            if (descriptions[i - 1] !== descriptions[i]) {
              descriptions[j] = descriptions[i];
              j++;
            }
          }
          descriptions.length = j;
        }
        switch (descriptions.length) {
          case 1:
            return descriptions[0];
          case 2:
            return descriptions[0] + " or " + descriptions[1];
          default:
            return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
        }
      }
      function describeFound(found2) {
        return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
      }
      return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };
  }
});

// node_modules/transformation-matrix/src/fromTransformAttribute.js
function fromTransformAttribute(transformString) {
  return peg$parse(transformString);
}
var init_fromTransformAttribute = __esm({
  "node_modules/transformation-matrix/src/fromTransformAttribute.js"() {
    init_fromTransformAttribute_autogenerated();
  }
});

// node_modules/transformation-matrix/src/decompose.js
var init_decompose2 = __esm({
  "node_modules/transformation-matrix/src/decompose.js"() {
    init_scale();
    init_transform3();
  }
});

// node_modules/transformation-matrix/src/flip.js
var init_flip = __esm({
  "node_modules/transformation-matrix/src/flip.js"() {
  }
});

// node_modules/transformation-matrix/src/fromMovingPoints.js
var init_fromMovingPoints = __esm({
  "node_modules/transformation-matrix/src/fromMovingPoints.js"() {
    init_translate();
    init_applyToPoint();
    init_rotate();
    init_scale();
    init_transform3();
  }
});

// node_modules/transformation-matrix/src/index.js
var init_src31 = __esm({
  "node_modules/transformation-matrix/src/index.js"() {
    init_applyToPoint();
    init_fromObject();
    init_fromString();
    init_identity2();
    init_inverse();
    init_isAffineMatrix();
    init_rotate();
    init_scale();
    init_shear();
    init_skew();
    init_toString();
    init_transform3();
    init_translate();
    init_fromTriangles();
    init_smoothMatrix();
    init_fromDefinition();
    init_fromTransformAttribute();
    init_decompose2();
    init_flip();
    init_fromMovingPoints();
  }
});

// dist/esm/layer/vegaLayer.js
var baseName2, backgroundClassName2, VegaLayer;
var init_vegaLayer = __esm({
  "dist/esm/layer/vegaLayer.js"() {
    init_layer();
    init_d3();
    init_helpers();
    init_src31();
    baseName2 = "VegaLayer";
    backgroundClassName2 = "background";
    VegaLayer = class extends Layer {
      constructor(baseName4, options) {
        super(baseName4, options);
        this._name = options.name;
        this._container = options.container;
        if (options.group) {
          this._graphic = this._container.querySelector(`.${options.group}`);
        } else {
          this._graphic = document.createElementNS("http://www.w3.org/2000/svg", "g");
          options.container.appendChild(this._graphic);
        }
        let tempElem = this._container;
        while (tempElem && tempElem.tagName !== "svg")
          tempElem = tempElem.parentElement;
        if (tempElem.tagName !== "svg")
          throw Error("Container must be wrapped in SVGSVGElement");
        this._svg = tempElem;
        this._postInitialize && this._postInitialize.call(this, this);
      }
      get _offset() {
        let matrixStr = "translate(0, 0)";
        if ([...this._container.children].includes(this._graphic)) {
          matrixStr = this._container.querySelector("g")?.getAttribute("transform") ?? "translate(0,0)";
        } else {
          let currDom = this._graphic;
          while (currDom != this._container) {
            if (currDom.getAttribute("transform")) {
              matrixStr += ` ${currDom.getAttribute("transform")}`;
            }
            currDom = currDom.parentElement;
          }
        }
        const matrix = compose(fromDefinition(fromTransformAttribute(matrixStr ?? "translate(0,0)")));
        return { x: matrix.e, y: matrix.f };
      }
      getVisualElements() {
        const elems = [
          ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName2})`)
        ];
        return elems;
      }
      getGraphic(real = false) {
        if (this._userOptions.group) {
          if (real) {
            return [...this._container.children].find((el) => el.contains(this._graphic));
          }
          return this._container;
        }
        return this._graphic;
      }
      getDatum(elem) {
        if (!elem || elem instanceof Array && elem.length == 0)
          return null;
        if (elem instanceof Array) {
          return selectAll_default2(elem).datum()?.datum;
        }
        return select_default2(elem).datum()?.datum;
      }
      cloneVisualElements(element, deep = false) {
        const copiedElement = select_default2(element).clone(deep).node();
        let currentElement = copiedElement.parentElement;
        let transform3 = copiedElement.getAttribute("transform") || "";
        while (currentElement && currentElement != this._container) {
          if (currentElement.getAttribute("transform")) {
            transform3 += ` ${currentElement.getAttribute("transform")}`;
          }
          currentElement = currentElement.parentElement;
        }
        copiedElement.setAttribute("transform", transform3);
        const frag = document.createDocumentFragment();
        frag.append(copiedElement);
        copiedElement.__libra__screenElement = element;
        return copiedElement;
      }
      select(selector) {
        return this._graphic.querySelectorAll(selector);
      }
      picking(options) {
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
        return this._graphic.contains(elem) && !elem.classList.contains(backgroundClassName2);
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
          result = [...document.elementsFromPoint(x, y)].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            return rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y;
          });
          if (result.length >= 1) {
            result = [result[0]];
          }
        } else if (options.type === ShapeQueryType.Point) {
          const { x, y } = options;
          if (!isFinite(x) || !isFinite(y)) {
            return [];
          }
          result = document.elementsFromPoint(x, y).filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            return rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y;
          });
        } else if (options.type === ShapeQueryType.Circle) {
          const rawX = options.x, rawY = options.y;
          const x = options.x - svgBCR.left, y = options.y - svgBCR.top, r = options.r;
          const outerRectWidth = r;
          const outerRectX = x - r;
          const outerRectY = y - r;
          const outerElemSet = new Set();
          const outerRect = this._svg.createSVGRect();
          outerRect.x = outerRectX;
          outerRect.y = outerRectY;
          outerRect.width = outerRectWidth * 2;
          outerRect.height = outerRectWidth * 2;
          this._svg.getIntersectionList(outerRect, this._graphic).forEach((elem) => outerElemSet.add(elem));
          result = [...outerElemSet].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            const circleDistanceX = Math.abs(rawX - rect.left);
            const circleDistanceY = Math.abs(rawY - rect.top);
            if (circleDistanceX > rect.width / 2 + r) {
              return false;
            }
            if (circleDistanceY > rect.height / 2 + r) {
              return false;
            }
            if (circleDistanceX <= rect.width / 2) {
              return true;
            }
            if (circleDistanceY <= rect.height / 2) {
              return true;
            }
            const cornerDistance = Math.pow(circleDistanceX - rect.width / 2, 2) + Math.pow(circleDistanceY - rect.height / 2, 2);
            return cornerDistance <= r * r;
          });
        } else if (options.type === ShapeQueryType.Rect) {
          const { x, y, width, height } = options;
          const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
          const rect = this._svg.createSVGRect();
          rect.x = x0;
          rect.y = y0;
          rect.width = absWidth;
          rect.height = absHeight;
          result = [...this._svg.getIntersectionList(rect, this._graphic)].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName2));
          const zeroStrokeWidthPaths = [
            ...this._graphic.querySelectorAll("path")
          ].filter((path) => {
            const computedStyle = window.getComputedStyle(path);
            return computedStyle.fill === "none";
          });
          if (zeroStrokeWidthPaths.length > 0) {
            const customIntersectingPaths = zeroStrokeWidthPaths.filter((path) => {
              const transformedRect = this.transformRect(rect, this._graphic);
              return this.pathIntersectsRect(path, transformedRect);
            });
            result = [...new Set([...result, ...customIntersectingPaths])];
          }
        } else if (options.type === ShapeQueryType.Polygon) {
          const { points } = options;
          const svgBCR2 = this._svg.getBoundingClientRect();
          const adjustedPoints = points.map((p) => ({
            x: p.x - svgBCR2.left,
            y: p.y - svgBCR2.top
          }));
          const elemSet = new Set();
          this.queryLargestRectangles(adjustedPoints, elemSet);
          result = Array.from(elemSet);
        }
        const resultWithSVGGElement = [];
        while (result.length > 0) {
          const elem = result.shift();
          if (elem.classList.contains(backgroundClassName2))
            continue;
          resultWithSVGGElement.push(elem);
          if (elem.parentElement.tagName === "g" && this._graphic.contains(elem.parentElement) && this._graphic !== elem.parentElement)
            result.push(elem.parentElement);
        }
        return resultWithSVGGElement;
      }
      _dataQuery(options) {
        let result = [];
        return result;
      }
      _attrQuery(options) {
        const { attrName, value } = options;
        return [];
      }
      transformRect(rect, referenceElement) {
        if (!this._offset)
          return rect;
        const transformedRect = this._svg.createSVGRect();
        transformedRect.x = rect.x - this._offset.x;
        transformedRect.y = rect.y - this._offset.y;
        transformedRect.width = rect.width;
        transformedRect.height = rect.height;
        return transformedRect;
      }
      queryLargestRectangles(points, elemSet) {
        const boundingBox = this.getBoundingBox(points);
        if ((boundingBox.maxX - boundingBox.minX) * (boundingBox.maxY - boundingBox.minY) < 100) {
          this.queryPolygon(points, elemSet);
          return;
        }
        const largestRect = this.findLargestRectangle(points, boundingBox);
        const rect = this._svg.createSVGRect();
        rect.x = largestRect.x;
        rect.y = largestRect.y;
        rect.width = largestRect.width;
        rect.height = largestRect.height;
        const intersectingElements = [
          ...this._svg.getIntersectionList(rect, this._graphic)
        ].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName2));
        intersectingElements.forEach((elem) => elemSet.add(elem));
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
          const computedStyle = window.getComputedStyle(path);
          return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
          const customIntersectingPaths = zeroFillPaths.filter((path) => {
            const transformedRect = this.transformRect(rect, this._graphic);
            return this.pathIntersectsRect(path, transformedRect);
          });
          customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
        const remainingPolygons = this.subtractRectFromPolygon(points, largestRect);
        remainingPolygons.forEach((polygon) => this.queryLargestRectangles(polygon, elemSet));
      }
      getBoundingBox(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of points) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
        return { minX, minY, maxX, maxY };
      }
      findLargestRectangle(points, boundingBox) {
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        let largestArea = 0;
        let largestRect = { x: 0, y: 0, width: 0, height: 0 };
        for (let x = boundingBox.minX; x < boundingBox.maxX; x += width / 10) {
          for (let y = boundingBox.minY; y < boundingBox.maxY; y += height / 10) {
            for (let w = width / 10; x + w <= boundingBox.maxX; w += width / 10) {
              for (let h = height / 10; y + h <= boundingBox.maxY; h += height / 10) {
                if (this.isRectangleInPolygon({ x, y, width: w, height: h }, points)) {
                  const area = w * h;
                  if (area > largestArea) {
                    largestArea = area;
                    largestRect = { x, y, width: w, height: h };
                  }
                }
              }
            }
          }
        }
        return largestRect;
      }
      isRectangleInPolygon(rect, polygon) {
        const corners = [
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width, y: rect.y + rect.height },
          { x: rect.x, y: rect.y + rect.height }
        ];
        return corners.every((corner) => this.isPointInPolygon(corner, polygon));
      }
      subtractRectFromPolygon(polygon, rect) {
        const remainingPoints = polygon.filter((point) => !(point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height));
        const rectCorners = [
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width, y: rect.y },
          { x: rect.x + rect.width, y: rect.y + rect.height },
          { x: rect.x, y: rect.y + rect.height }
        ];
        return [remainingPoints.concat(rectCorners)];
      }
      queryPolygon(points, elemSet) {
        const boundingBox = this.getBoundingBox(points);
        const rect = this._svg.createSVGRect();
        rect.x = boundingBox.minX;
        rect.y = boundingBox.minY;
        rect.width = boundingBox.maxX - boundingBox.minX;
        rect.height = boundingBox.maxY - boundingBox.minY;
        const potentialElements = [
          ...this._svg.getIntersectionList(rect, this._graphic)
        ].filter(this._isElementInLayer.bind(this)).filter((elem) => !elem.classList.contains(backgroundClassName2));
        potentialElements.forEach((elem) => {
          const bbox = elem.getBBox();
          const elemPoints = [
            { x: bbox.x, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y },
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
            { x: bbox.x, y: bbox.y + bbox.height }
          ];
          if (elemPoints.some((point) => this.isPointInPolygon(point, points))) {
            elemSet.add(elem);
          }
        });
        const zeroFillPaths = [...this._graphic.querySelectorAll("path")].filter((path) => {
          const computedStyle = window.getComputedStyle(path);
          return computedStyle.fill === "none";
        });
        if (zeroFillPaths.length > 0) {
          const customIntersectingPaths = zeroFillPaths.filter((path) => {
            const transformedRect = this.transformRect(rect, this._graphic);
            return this.pathIntersectsRect(path, transformedRect);
          });
          customIntersectingPaths.forEach((elem) => elemSet.add(elem));
        }
      }
      pathIntersectsPolygon(path, polygon) {
        const pathLength = path.getTotalLength();
        const step = pathLength / 100;
        for (let i = 0; i <= pathLength; i += step) {
          const point = path.getPointAtLength(i);
          if (this.isPointInPolygon(point, polygon)) {
            return true;
          }
        }
        return false;
      }
    };
    Layer.VegaLayer = VegaLayer;
    Layer.register(baseName2, { constructor: VegaLayer });
    Layer.register(baseName2, { constructor: VegaLayer });
  }
});

// dist/esm/layer/plotLayer.js
var baseName3, backgroundClassName3, PlotLayer;
var init_plotLayer = __esm({
  "dist/esm/layer/plotLayer.js"() {
    init_layer();
    init_d3();
    init_helpers();
    init_src31();
    baseName3 = "PlotLayer";
    backgroundClassName3 = "background";
    PlotLayer = class extends Layer {
      constructor(baseName4, options) {
        super(baseName4, options);
        this._name = options.name;
        this._container = options.container;
        if (options.group) {
          this._graphic = this._container.querySelector(`*[aria-label="${options.group}"]`);
        } else {
          this._graphic = document.createElementNS("http://www.w3.org/2000/svg", "g");
          options.container.appendChild(this._graphic);
        }
        let tempElem = this._container;
        while (tempElem && tempElem.tagName !== "svg")
          tempElem = tempElem.parentElement;
        if (tempElem.tagName !== "svg")
          throw Error("Container must be wrapped in SVGSVGElement");
        this._svg = tempElem;
        this._postInitialize && this._postInitialize.call(this, this);
      }
      get _offset() {
        let matrixStr = "translate(0, 0)";
        if ([...this._container.children].includes(this._graphic)) {
          matrixStr = this._container.querySelector("g")?.getAttribute("transform") ?? "translate(0,0)";
        } else {
          let currDom = this._graphic;
          while (currDom != this._container) {
            if (currDom.getAttribute("transform")) {
              matrixStr += ` ${currDom.getAttribute("transform")}`;
            }
            currDom = currDom.parentElement;
          }
        }
        const matrix = compose(fromDefinition(fromTransformAttribute(matrixStr ?? "translate(0,0)")));
        return { x: matrix.e, y: matrix.f };
      }
      getVisualElements() {
        const elems = [
          ...this._graphic.querySelectorAll(`:root :not(.${backgroundClassName3})`)
        ];
        return elems;
      }
      getGraphic(real = false) {
        if (this._userOptions.group) {
          if (real) {
            return [...this._container.children].find((el) => el.contains(this._graphic));
          }
          return this._container;
        }
        return this._graphic;
      }
      getDatum(elem) {
        if (!elem || elem instanceof Array && elem.length == 0)
          return null;
        if (elem instanceof Array) {
          return selectAll_default2(elem).datum()?.datum;
        }
        return select_default2(elem).datum()?.datum;
      }
      cloneVisualElements(element, deep = false) {
        const copiedElement = select_default2(element).clone(deep).node();
        let currentElement = copiedElement.parentElement;
        let transform3 = copiedElement.getAttribute("transform");
        while (currentElement && currentElement != this._container) {
          if (currentElement.getAttribute("transform")) {
            transform3 += ` ${currentElement.getAttribute("transform")}`;
          }
          currentElement = currentElement.parentElement;
        }
        copiedElement.setAttribute("transform", transform3);
        const frag = document.createDocumentFragment();
        frag.append(copiedElement);
        copiedElement.__libra__screenElement = element;
        return copiedElement;
      }
      select(selector) {
        return this._graphic.querySelectorAll(selector);
      }
      picking(options) {
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
        return this._graphic.contains(elem) && !elem.classList.contains(backgroundClassName3);
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
          result = [...document.elementsFromPoint(x, y)].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            return rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y;
          });
          if (result.length >= 1) {
            result = [result[0]];
          }
        } else if (options.type === ShapeQueryType.Point) {
          const { x, y } = options;
          if (!isFinite(x) || !isFinite(y)) {
            return [];
          }
          result = document.elementsFromPoint(x, y).filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            return rect.right >= x && rect.left <= x && rect.bottom >= y && rect.top <= y;
          });
        } else if (options.type === ShapeQueryType.Circle) {
          const rawX = options.x, rawY = options.y;
          const x = options.x - svgBCR.left, y = options.y - svgBCR.top, r = options.r;
          const outerRectWidth = r;
          const outerRectX = x - r;
          const outerRectY = y - r;
          const outerElemSet = new Set();
          const outerRect = this._svg.createSVGRect();
          outerRect.x = outerRectX;
          outerRect.y = outerRectY;
          outerRect.width = outerRectWidth * 2;
          outerRect.height = outerRectWidth * 2;
          this._svg.getIntersectionList(outerRect, this._graphic).forEach((elem) => outerElemSet.add(elem));
          result = [...outerElemSet].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect = elem.getBoundingClientRect();
            const circleDistanceX = Math.abs(rawX - rect.left);
            const circleDistanceY = Math.abs(rawY - rect.top);
            if (circleDistanceX > rect.width / 2 + r) {
              return false;
            }
            if (circleDistanceY > rect.height / 2 + r) {
              return false;
            }
            if (circleDistanceX <= rect.width / 2) {
              return true;
            }
            if (circleDistanceY <= rect.height / 2) {
              return true;
            }
            const cornerDistance = Math.pow(circleDistanceX - rect.width / 2, 2) + Math.pow(circleDistanceY - rect.height / 2, 2);
            return cornerDistance <= r * r;
          });
        } else if (options.type === ShapeQueryType.Rect) {
          const { x, y, width, height } = options;
          const x0 = Math.min(x, x + width) - svgBCR.left, y0 = Math.min(y, y + height) - svgBCR.top, absWidth = Math.abs(width), absHeight = Math.abs(height);
          const rect = this._svg.createSVGRect();
          rect.x = x0;
          rect.y = y0;
          rect.width = absWidth;
          rect.height = absHeight;
          result = [...this._svg.getIntersectionList(rect, this._graphic)].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect2 = elem.getBoundingClientRect();
            return !(rect2.right < x0 + svgBCR.left || rect2.left > x0 + absWidth + svgBCR.left || rect2.bottom < y0 + svgBCR.top || rect2.top > y0 + absHeight + svgBCR.top);
          });
        } else if (options.type === ShapeQueryType.Polygon) {
          const { points } = options;
          const x0 = Math.min(...points.map((p) => p.x)) - svgBCR.left, y0 = Math.min(...points.map((p) => p.y)) - svgBCR.top, x1 = Math.max(...points.map((p) => p.x)) - svgBCR.left, y1 = Math.max(...points.map((p) => p.y)) - svgBCR.top;
          const rect = this._svg.createSVGRect();
          rect.x = x0;
          rect.y = y0;
          rect.width = x1 - x0;
          rect.height = y1 - y0;
          result = [...this._svg.getIntersectionList(rect, this._graphic)].filter((elem) => {
            if (!this._isElementInLayer(elem))
              return false;
            const rect2 = elem.getBoundingClientRect();
            return !(rect2.right < x0 + svgBCR.left || rect2.left > x1 + svgBCR.left || rect2.bottom < y0 + svgBCR.top || rect2.top > y1 + svgBCR.top);
          });
        }
        const resultWithSVGGElement = [];
        while (result.length > 0) {
          const elem = result.shift();
          if (elem.classList.contains(backgroundClassName3))
            continue;
          resultWithSVGGElement.push(elem);
          if (elem.parentElement.tagName === "g" && this._graphic.contains(elem.parentElement) && this._graphic !== elem.parentElement)
            result.push(elem.parentElement);
        }
        return resultWithSVGGElement;
      }
      _dataQuery(options) {
        let result = [];
        return result;
      }
      _attrQuery(options) {
        const { attrName, value } = options;
        return [];
      }
    };
    Layer.PlotLayer = PlotLayer;
    Layer.register(baseName3, { constructor: PlotLayer });
    Layer.register(baseName3, { constructor: PlotLayer });
  }
});

// dist/esm/layer/index.js
var Layer2;
var init_layer2 = __esm({
  "dist/esm/layer/index.js"() {
    init_layer();
    init_layer();
    init_d3Layer();
    init_vegaLayer();
    init_plotLayer();
    Layer2 = Layer;
  }
});

// dist/esm/instrument/instrument.js
var _a5, registeredInstruments, instanceInstruments, EventDispatcher, EventQueue, eventHandling, Instrument, register6, unregister4, initialize6, findInstrument;
var init_instrument = __esm({
  "dist/esm/instrument/instrument.js"() {
    init_interactor2();
    init_helpers();
    init_command2();
    init_layer2();
    init_service2();
    init_transformer2();
    registeredInstruments = {};
    instanceInstruments = [];
    EventDispatcher = new Map();
    EventQueue = [];
    eventHandling = false;
    Instrument = class {
      constructor(baseName4, options) {
        this._transformers = [];
        this._linkCache = {};
        this[_a5] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preAttach = options.preAttach ?? null;
        this._postUse = options.postUse ?? null;
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? baseName4;
        this._on = Object.assign({}, options.on ?? {});
        this._interactors = [];
        this._layers = [];
        this._layerInteractors = new Map();
        this._services = options.services ?? [];
        this._serviceInstances = [];
        this._sharedVar = options.sharedVar ?? {};
        this._transformers = options.transformers ?? [];
        if (options.interactors) {
          options.interactors.forEach((interactor) => {
            if (typeof interactor === "string") {
              this.useInteractor(Interactor2.initialize(interactor));
            } else if ("options" in interactor) {
              if (typeof interactor.interactor === "string") {
                this.useInteractor(Interactor2.initialize(interactor.interactor, interactor.options));
              } else {
                this.useInteractor(interactor.interactor, interactor.options);
              }
            } else {
              this.useInteractor(interactor);
            }
          });
        }
        this._services.forEach((service) => {
          if (typeof service === "string" || !("options" in service)) {
            this.useService(service);
          } else {
            this.useService(service.service, service.options);
          }
        });
        if (options.layers) {
          options.layers.forEach((layer) => {
            if ("options" in layer) {
              this.attach(layer.layer, layer.options);
            } else {
              this.attach(layer);
            }
          });
        }
        options.postInitialize && options.postInitialize.call(this, this);
      }
      emit(action, options) {
        if (this._on[action]) {
          this._on[action].forEach((feedforwardOrCommand) => {
            if (feedforwardOrCommand instanceof Command) {
              feedforwardOrCommand.execute(Object.assign({
                self: this,
                layer: null,
                instrument: this,
                interactor: null
              }, options || {}));
            } else {
              feedforwardOrCommand(Object.assign({
                self: this,
                layer: null,
                instrument: this,
                interactor: null
              }, options || {}));
            }
          });
        }
        if (action.includes("confirm")) {
          this._serviceInstances.forEach((service) => {
            service.invokeCommand();
          });
        }
      }
      on(action, feedforwardOrCommand) {
        if (action instanceof Array) {
          action.forEach((action2) => {
            if (!this._on[action2]) {
              this._on[action2] = [];
            }
            this._on[action2].push(feedforwardOrCommand);
          });
        } else {
          if (!this._on[action]) {
            this._on[action] = [];
          }
          this._on[action].push(feedforwardOrCommand);
        }
        return this;
      }
      off(action, feedforwardOrCommand) {
        if (!this._on[action])
          return;
        if (this._on[action].includes(feedforwardOrCommand)) {
          this._on[action].splice(this._on[action].indexOf(feedforwardOrCommand), 1);
        }
        return this;
      }
      _use(service, options) {
        service.preAttach(this);
        this._serviceInstances.push(service);
        service.postUse(this);
      }
      useService(service, options) {
        if (typeof service !== "string" && this._serviceInstances.includes(service)) {
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
      useInteractor(interactor, options) {
        interactor.preUse(this);
        if (arguments.length >= 2) {
          this._interactors.push({ interactor, options });
        } else {
          this._interactors.push(interactor);
        }
        this._layers.forEach((layer) => {
          let layr;
          if (layer instanceof Layer2) {
            layr = layer;
          } else {
            layr = layer.layer;
          }
          if (!this._layerInteractors.has(layr)) {
            this._layerInteractors.set(layr, []);
          }
          const copyInteractor = Interactor2.initialize(interactor._baseName, interactor._userOptions);
          this._layerInteractors.get(layr).push(copyInteractor);
          copyInteractor.setActions(copyInteractor.getActions().map((action) => ({
            ...action,
            sideEffect: async (options2) => {
              action.sideEffect && action.sideEffect(options2);
              if (this._on[action.action]) {
                for (let command of this._on[action.action]) {
                  try {
                    if (command instanceof Command) {
                      await command.execute({
                        ...options2,
                        self: this,
                        instrument: this
                      });
                    } else {
                      await command({
                        ...options2,
                        self: this,
                        instrument: this
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
              }
            }
          })));
          copyInteractor.getAcceptEvents().forEach((event) => {
            if (!EventDispatcher.has(layr.getContainerGraphic())) {
              EventDispatcher.set(layr.getContainerGraphic(), new Map());
            }
            if (!EventDispatcher.get(layr.getContainerGraphic()).has(event)) {
              layr.getContainerGraphic().addEventListener(event, this._dispatch.bind(this, layr, event));
              EventDispatcher.get(layr.getContainerGraphic()).set(event, []);
            }
            EventDispatcher.get(layr.getContainerGraphic()).get(event).push([
              copyInteractor,
              layr,
              layer instanceof Layer2 ? null : layer.options,
              this
            ]);
          });
        });
        interactor.postUse(this);
      }
      attach(layer, options) {
        if (this._layers.find((l) => l instanceof Layer2 ? l === layer : l.layer === layer))
          return;
        this.preAttach(layer, options ?? null);
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
            if (feedforwardOrCommand instanceof Command) {
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
      preAttach(layer, options) {
        this._preAttach && this._preAttach.call(this, this, layer);
        this._interactors.forEach((interactor) => {
          let inter;
          if (interactor instanceof Interactor2) {
            inter = interactor;
          } else {
            inter = interactor.interactor;
          }
          if (!this._layerInteractors.has(layer)) {
            this._layerInteractors.set(layer, []);
          }
          const copyInteractor = Interactor2.initialize(inter._baseName, inter._userOptions);
          this._layerInteractors.get(layer).push(copyInteractor);
          copyInteractor.setActions(copyInteractor.getActions().map((action) => ({
            ...action,
            sideEffect: async (options2) => {
              action.sideEffect && action.sideEffect(options2);
              if (this._on[action.action]) {
                for (let command of this._on[action.action]) {
                  try {
                    if (command instanceof Command) {
                      await command.execute({
                        ...options2,
                        self: this,
                        instrument: this
                      });
                    } else {
                      await command({
                        ...options2,
                        self: this,
                        instrument: this
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
              }
            }
          })));
          copyInteractor.getAcceptEvents().forEach((event) => {
            if (!EventDispatcher.has(layer.getContainerGraphic())) {
              EventDispatcher.set(layer.getContainerGraphic(), new Map());
            }
            if (!EventDispatcher.get(layer.getContainerGraphic()).has(event)) {
              layer.getContainerGraphic().addEventListener(event, this._dispatch.bind(this, layer, event));
              EventDispatcher.get(layer.getContainerGraphic()).set(event, []);
            }
            EventDispatcher.get(layer.getContainerGraphic()).get(event).push([copyInteractor, layer, options, this]);
          });
        });
      }
      async _dispatch(layer, event, e) {
        if (layer._baseName !== "Layer") {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        if (eventHandling) {
          let existingEventIndex = EventQueue.findIndex((e2) => e2.instrument === this && e2.layer === layer && e2.eventType === event);
          if (existingEventIndex >= 0) {
            EventQueue.splice(existingEventIndex, 1);
          }
          EventQueue.push({ instrument: this, layer, eventType: event, event: e });
          return;
        }
        eventHandling = true;
        const layers = EventDispatcher.get(layer.getContainerGraphic()).get(event).filter(([_, layr]) => layr._order >= 0);
        layers.sort((a, b) => b[1]._order - a[1]._order);
        let handled = false;
        for (let [inter, layr, layerOption, instrument] of layers) {
          if (e instanceof MouseEvent) {
            if (layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") === "backgroundlayer" || layr._name?.toLowerCase().replaceAll("-", "").replaceAll("_", "") === "bglayer" || layerOption && layerOption.pointerEvents === "all") {
            } else if (!layerOption || layerOption.pointerEvents === "viewport") {
              const maybeD3Layer = layr;
              if (maybeD3Layer._offset && maybeD3Layer._width && maybeD3Layer._height) {
                if (e.offsetX < maybeD3Layer._offset.x || e.offsetX > maybeD3Layer._offset.x + maybeD3Layer._width || e.offsetY < maybeD3Layer._offset.y || e.offsetY > maybeD3Layer._offset.y + maybeD3Layer._height) {
                  continue;
                }
              }
            } else {
              const query = layr.picking({
                baseOn: QueryType.Shape,
                type: ShapeQueryType.Point,
                x: e.clientX,
                y: e.clientY
              });
              if (query.length <= 0 && inter._state === "start")
                continue;
              const maybeD3Layer = layr;
              if (maybeD3Layer._offset && maybeD3Layer._width && maybeD3Layer._height) {
                if (e.offsetX < maybeD3Layer._offset.x || e.offsetX > maybeD3Layer._offset.x + maybeD3Layer._width || e.offsetY < maybeD3Layer._offset.y || e.offsetY > maybeD3Layer._offset.y + maybeD3Layer._height) {
                  continue;
                }
              }
            }
          }
          try {
            let flag = await inter.dispatch(e, layr);
            if (flag && e instanceof MouseEvent && layerOption && layerOption.pointerEvents === "visiblePainted") {
              handled = true;
              break;
            }
          } catch (e2) {
            console.error(e2);
            break;
          }
        }
        eventHandling = false;
        if (EventQueue.length) {
          const eventDescription = EventQueue.shift();
          eventDescription.instrument._dispatch(eventDescription.layer, eventDescription.eventType, eventDescription.event);
        }
      }
      postUse(layer) {
        const graphic = layer.getGraphic();
        graphic && graphic.style && (graphic.style.pointerEvents = "auto");
        this._postUse && this._postUse.call(this, this, layer);
      }
      isInstanceOf(name) {
        return this._baseName === name || this._name === name;
      }
      get services() {
        return makeFindableList(this._serviceInstances.slice(0), Service2, this.useService.bind(this), () => {
          throw new Error("Do not support dynamic change service yet");
        }, this);
      }
      get transformers() {
        return makeFindableList(this._transformers.slice(0), GraphicalTransformer2, (e) => this._transformers.push(e), (e) => this._transformers.splice(this._transformers.indexOf(e), 1), this);
      }
      static register(baseName4, options) {
        registeredInstruments[baseName4] = options;
      }
      static unregister(baseName4) {
        delete registeredInstruments[baseName4];
        return true;
      }
      static initialize(baseName4, options) {
        const mergedOptions = Object.assign({ constructor: Instrument }, registeredInstruments[baseName4] ?? {}, options ?? {}, {
          on: deepClone(Object.assign({}, (registeredInstruments[baseName4] ?? {}).on ?? {}, options?.on ?? {})),
          sharedVar: Object.assign({}, (registeredInstruments[baseName4] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {})
        });
        const instrument = new mergedOptions.constructor(baseName4, mergedOptions);
        instanceInstruments.push(instrument);
        return instrument;
      }
      static findInstrument(baseNameOrRealName) {
        return instanceInstruments.filter((instrument) => instrument.isInstanceOf(baseNameOrRealName));
      }
    };
    _a5 = LibraSymbol;
    register6 = Instrument.register;
    unregister4 = Instrument.unregister;
    initialize6 = Instrument.initialize;
    findInstrument = Instrument.findInstrument;
  }
});

// dist/esm/instrument/builtin.js
var init_builtin3 = __esm({
  "dist/esm/instrument/builtin.js"() {
    init_instrument();
    init_transformer2();
    init_helpers();
    init_d3();
    init_command();
    Instrument.register("HoverInstrument", {
      constructor: Instrument,
      interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
      on: {
        hover: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVars({
              event,
              x: event.clientX,
              y: event.clientY,
              offsetx: event.offsetX,
              offsety: event.offsetY
            }, { layer });
            const transformers = instrument.transformers;
            transformers.setSharedVars({ cx: event.clientX, cy: event.clientY });
          }
        ],
        click: [Command2.initialize("Log", { execute() {
        } })]
      },
      postInitialize: (instrument) => {
        instrument.services.add("SurfacePointSelectionService", {
          sharedVar: {
            deepClone: instrument.getSharedVar("deepClone"),
            highlightColor: instrument.getSharedVar("highlightColor"),
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues"),
            tooltip: instrument.getSharedVar("tooltip")
          }
        });
      },
      preAttach: (instrument, layer) => {
        instrument.services.add("SurfacePointSelectionService", {
          layer,
          sharedVar: {
            deepClone: instrument.getSharedVar("deepClone"),
            highlightColor: instrument.getSharedVar("highlightColor"),
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues"),
            tooltip: instrument.getSharedVar("tooltip")
          }
        });
      }
    });
    Instrument.register("ClickInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.setSharedVar("x", event.clientX);
            instrument.setSharedVar("y", event.clientY);
            const services = instrument.services.find("SelectionService");
            services.setSharedVars({
              x: event.clientX,
              y: event.clientY,
              offsetx: event.offsetX,
              offsety: event.offsetY
            }, { layer });
            instrument.emit("clickstart", {
              ...options,
              self: options.instrument
            });
          },
          Command2.initialize("Log", { execute() {
          } })
        ],
        dragend: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVars({
              x: 0,
              y: 0,
              offsetx: 0,
              offsety: 0
            }, { layer });
            if (event.clientX === instrument.getSharedVar("x") && event.clientY === instrument.getSharedVar("y")) {
              instrument.setSharedVar("x", 0);
              instrument.setSharedVar("y", 0);
              instrument.emit("click", {
                ...options,
                self: options.instrument
              });
            } else {
              instrument.setSharedVar("x", 0);
              instrument.setSharedVar("y", 0);
              instrument.emit("clickabort", {
                ...options,
                self: options.instrument
              });
            }
          }
        ],
        dragabort: [
          (options) => {
            if (options.event.changedTouches)
              options.event = options.event.changedTouches[0];
            const services = options.instrument.services.find("SelectionService");
            services.setSharedVars({
              x: 0,
              y: 0,
              offsetx: 0,
              offsety: 0
            }, { layer: options.layer });
            options.instrument.emit("clickabort", {
              ...options,
              self: options.instrument
            });
          }
        ]
      },
      preAttach: (instrument, layer) => {
        instrument.services.add("SurfacePointSelectionService", {
          layer,
          sharedVar: {
            deepClone: instrument.getSharedVar("deepClone"),
            highlightColor: instrument.getSharedVar("highlightColor"),
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues")
          }
        });
      }
    });
    Instrument.register("BrushInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("RectSelectionService");
            services.setSharedVars({
              x: event.clientX,
              y: event.clientY,
              offsetx: event.offsetX,
              offsety: event.offsetY,
              width: 1,
              height: 1,
              startx: event.clientX,
              starty: event.clientY,
              startoffsetx: event.offsetX,
              startoffsety: event.offsetY,
              currentx: event.clientX,
              currenty: event.clientY
            }, { layer });
            const x = event.offsetX;
            const y = event.offsetY;
            const width = 0;
            const height = 0;
            const layerOffsetX = layer._offset?.x ?? 0;
            const layerOffsetY = layer._offset?.y ?? 0;
            const scaleX = instrument.getSharedVar("scaleX");
            const scaleY = instrument.getSharedVar("scaleY");
            if (scaleX && scaleX.invert && scaleY && scaleY.invert) {
              const newExtentX = [x - layerOffsetX, x - layerOffsetX + width].map(scaleX.invert);
              const newExtentY = [y - layerOffsetY, y - layerOffsetY + height].map(scaleY.invert);
              instrument.setSharedVar("extent", [newExtentX, newExtentY], {
                layer
              });
              instrument.services.find("SelectionService").filter([newExtentX, newExtentY]);
            } else {
              instrument.services.find("SelectionService").filter([
                [x - layerOffsetX, x - layerOffsetX + width],
                [y - layerOffsetY, y - layerOffsetY + height]
              ]);
            }
            instrument.setSharedVar("startx", event.clientX);
            instrument.setSharedVar("starty", event.clientY);
            instrument.setSharedVar("startoffsetx", event.offsetX);
            instrument.setSharedVar("startoffsety", event.offsetY);
          }
        ],
        drag: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            const startx = instrument.getSharedVar("startx");
            const starty = instrument.getSharedVar("starty");
            const startoffsetx = instrument.getSharedVar("startoffsetx");
            const startoffsety = instrument.getSharedVar("startoffsety");
            const x = Math.min(startx, event.clientX);
            const y = Math.min(starty, event.clientY);
            const offsetx = Math.min(startoffsetx, event.offsetX);
            const offsety = Math.min(startoffsety, event.offsetY);
            const width = Math.abs(event.clientX - startx);
            const height = Math.abs(event.clientY - starty);
            const services = instrument.services.find("SelectionService");
            services.setSharedVars({
              x,
              y,
              offsetx,
              offsety,
              width,
              height,
              currentx: event.clientX,
              currenty: event.clientY
            }, { layer });
          }
        ],
        dragend: [Command2.initialize("Log", { execute() {
        } })],
        dragabort: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVars({
              x: 0,
              y: 0,
              offsetx: 0,
              offsety: 0,
              width: 0,
              height: 0,
              currentx: event.clientX,
              currenty: event.clientY,
              endx: event.clientX,
              endy: event.clientY
            }, { layer });
            instrument.emit("brushabort", options);
          }
        ]
      },
      preAttach: (instrument, layer) => {
        layer.getLayerFromQueue("selectionLayer");
        instrument.services.add("RectSelectionService", {
          layer,
          sharedVar: {
            deepClone: instrument.getSharedVar("deepClone"),
            ...instrument.getSharedVar("highlightColor") ? { highlightColor: instrument.getSharedVar("highlightColor") } : {},
            ...instrument.getSharedVar("highlightAttrValues") ? {
              highlightAttrValues: instrument.getSharedVar("highlightAttrValues")
            } : {}
          }
        });
      }
    });
    Instrument.register("BrushXInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services;
            services.setSharedVars({
              x: event.clientX,
              offsetx: event.offsetX,
              width: 0,
              startx: event.clientX,
              startoffsetx: event.offsetX,
              currentx: event.clientX
            }, { layer });
            instrument.setSharedVar("startx", event.clientX);
            instrument.setSharedVar("startoffsetx", event.offsetX);
          }
        ],
        drag: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            const startx = instrument.getSharedVar("startx");
            const startoffsetx = instrument.getSharedVar("startoffsetx");
            const x = Math.min(startx, event.clientX);
            const offsetx = Math.min(startoffsetx, event.offsetX);
            const width = Math.abs(event.clientX - startx);
            instrument.services.find("SelectionService").setSharedVars({
              x,
              offsetx,
              width,
              currentx: event.clientX
            }, { layer });
            instrument.setSharedVar("currentx", event.clientX);
            instrument.setSharedVar("currentoffsetx", event.offsetX);
            instrument.emit("brush", options);
          }
        ],
        dragend: [Command2.initialize("Log", { execute() {
        } })],
        dragabort: [
          async (options) => {
            let { event, layer, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.services.setSharedVars({
              x: 0,
              offsetx: 0,
              width: 0,
              currentx: event.clientX
            }, { layer });
            instrument.emit("brushabort", options);
          }
        ]
      },
      preAttach: (instrument, layer) => {
        instrument.services.add("RectSelectionService", {
          layer,
          sharedVar: {
            deepClone: instrument.getSharedVar("deepClone"),
            highlightColor: instrument.getSharedVar("highlightColor"),
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues")
          }
        });
      }
    });
    Instrument.register("BrushYInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("RectSelectionService");
            services.setSharedVar("y", event.clientY, { layer });
            services.setSharedVar("height", 1, { layer });
            services.setSharedVar("starty", event.clientY, { layer });
            services.setSharedVar("currenty", event.clientY, { layer });
            instrument.setSharedVar("starty", event.clientY);
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              y: 0,
              height: 1
            });
          }
        ],
        drag: [
          Command2.initialize("drawBrushAndSelect", {
            continuous: true,
            execute: async ({ event, layer, instrument }) => {
              if (event.changedTouches)
                event = event.changedTouches[0];
              const starty = instrument.getSharedVar("starty");
              const y = Math.min(starty, event.clientY);
              const height = Math.abs(event.clientY - starty);
              const services = instrument.services.find("SelectionService");
              services.setSharedVar("y", y, { layer });
              services.setSharedVar("height", height, {
                layer
              });
              services.setSharedVar("currenty", event.clientY, { layer });
              await Promise.all(instrument.services.results);
            },
            feedback: [
              async ({ event, layer, instrument }) => {
                const starty = instrument.getSharedVar("starty");
                const y = Math.min(starty, event.clientY);
                const height = Math.abs(event.clientY - starty);
                const baseBBox = (layer.getGraphic().querySelector(".ig-layer-background") || layer.getGraphic()).getBoundingClientRect();
                instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
                  y: y - baseBBox.top,
                  height
                });
              },
              async ({ instrument }) => {
                instrument.transformers.find("HighlightSelection").setSharedVars({
                  highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {}
                });
              }
            ]
          })
        ],
        dragabort: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("y", 0, { layer });
            services.setSharedVar("height", 0, { layer });
            services.setSharedVar("currenty", event.clientY, { layer });
            services.setSharedVar("endy", event.clientY, { layer });
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              y: 0,
              height: 0
            });
          }
        ]
      },
      preAttach: (instrument, layer) => {
        const x = instrument.getSharedVar("x") ?? 0;
        const width = instrument.getSharedVar("width") ?? layer._width;
        const services = instrument.services.add("RectSelectionService", { layer });
        const bbox = layer.getGraphic().getBoundingClientRect();
        services.setSharedVar("x", bbox.x + x);
        services.setSharedVar("width", width);
        instrument.transformers.add("TransientRectangleTransformer", {
          transient: true,
          layer: layer.getLayerFromQueue("transientLayer"),
          sharedVar: {
            x: 0,
            y: 0,
            width,
            height: 0,
            fill: "#000",
            opacity: 0.3
          }
        }).add("HighlightSelection", {
          transient: true,
          layer: layer.getLayerFromQueue("selectionLayer"),
          sharedVar: { highlightAttrValues: {} }
        });
      }
    });
    Instrument.register("HelperLineInstrument", {
      constructor: Instrument,
      sharedVar: { orientation: ["horizontal"] },
      interactors: ["MousePositionInteractor", "TouchPositionInteractor"],
      on: {
        hover: [
          ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.transformers.setSharedVars({
              x: event.offsetX,
              y: event.offsetY
            });
            instrument.setSharedVar("x", event.offsetX, {});
            instrument.setSharedVar("y", event.offsetY, {});
          }
        ],
        click: [Command2.initialize("Log", { execute() {
        } })]
      },
      preAttach: function(instrument, layer) {
        instrument.transformers.add("HelperLineTransformer", {
          layer: layer.getLayerFromQueue("transientLayer"),
          sharedVar: {
            orientation: instrument.getSharedVar("orientation"),
            style: instrument.getSharedVar("style") || {},
            tooltip: instrument.getSharedVar("tooltip"),
            scaleX: instrument.getSharedVar("scaleX"),
            scaleY: instrument.getSharedVar("scaleY")
          }
        });
      }
    });
    Instrument.register("DataBrushInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const scaleX = instrument.getSharedVar("scaleX");
            const scaleY = instrument.getSharedVar("scaleY");
            const services = instrument.services.find("Quantitative2DSelectionService");
            const layerPos = pointer_default(event, layer.getGraphic());
            instrument.setSharedVar("layerOffsetX", event.clientX - layerPos[0]);
            instrument.setSharedVar("layerOffsetY", event.clientY - layerPos[1]);
            instrument.setSharedVar("startx", event.clientX);
            instrument.setSharedVar("starty", event.clientY);
            const newExtentX = [layerPos[0], layerPos[0] + 1].map(scaleX.invert);
            services.setSharedVar("extentX", newExtentX);
            const newExtentY = [layerPos[1], layerPos[1] + 1].map(scaleY.invert);
            services.setSharedVar("extentX", newExtentY);
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              x: 0,
              y: 0,
              width: 1,
              height: 1
            });
          }
        ],
        drag: [
          Command2.initialize("drawBrushAndSelect", {
            continuous: true,
            execute: async ({ event, layer, instrument }) => {
              if (event.changedTouches)
                event = event.changedTouches[0];
              const startx = instrument.getSharedVar("startx");
              const starty = instrument.getSharedVar("starty");
              const layerOffsetX = instrument.getSharedVar("layerOffsetX");
              const layerOffsetY = instrument.getSharedVar("layerOffsetY");
              const scaleX = instrument.getSharedVar("scaleX");
              const scaleY = instrument.getSharedVar("scaleY");
              const x = Math.min(startx, event.clientX) - layerOffsetX;
              const y = Math.min(starty, event.clientY) - layerOffsetY;
              const width = Math.abs(event.clientX - startx);
              const height = Math.abs(event.clientY - starty);
              instrument.setSharedVar("x", x);
              instrument.setSharedVar("y", y);
              instrument.setSharedVar("width", width);
              instrument.setSharedVar("height", height);
              const newExtentDataX = [x, x + width].map(scaleX.invert);
              const newExtentDataY = [y + height, y].map(scaleY.invert);
              const services = instrument.services.find("SelectionService");
              services.setSharedVar("extentX", newExtentDataX);
              services.setSharedVar("extentY", newExtentDataY);
              console.log(services);
              await Promise.all(instrument.services.results);
            },
            feedback: [
              async ({ event, layer, instrument }) => {
                const x = instrument.getSharedVar("x");
                const y = instrument.getSharedVar("y");
                const width = instrument.getSharedVar("width");
                const height = instrument.getSharedVar("height");
                instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
                  x,
                  y,
                  width,
                  height
                });
              },
              async ({ instrument }) => {
                instrument.transformers.find("HighlightSelection").setSharedVars({
                  highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {}
                });
              }
            ]
          })
        ],
        dragabort: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("x", 0, { layer });
            services.setSharedVar("width", 0, { layer });
            services.setSharedVar("currentx", event.clientX, { layer });
            services.setSharedVar("endx", event.clientX, { layer });
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              x: 0,
              width: 0
            });
          }
        ]
      },
      preAttach: async (instrument, layer) => {
        const scaleX = instrument.getSharedVar("scaleX");
        const scaleY = instrument.getSharedVar("scaleY");
        const attrNameX = instrument.getSharedVar("attrNameX");
        const extentX = instrument.getSharedVar("extentX") ?? [0, 0];
        const extentXData = extentX.map(scaleX);
        const attrNameY = instrument.getSharedVar("attrNameY");
        const extentY = instrument.getSharedVar("extentY") ?? [0, 0];
        const extentYData = extentX.map(scaleY).reverse();
        const services = instrument.services.add("Quantitative2DSelectionService", {
          layer
        });
        services.setSharedVar("attrNameX", attrNameX);
        services.setSharedVar("extentX", extentX);
        services.setSharedVar("attrNameY", attrNameY);
        services.setSharedVar("extentY", extentY);
        instrument.transformers.add("TransientRectangleTransformer", {
          transient: true,
          layer: layer.getLayerFromQueue("transientLayer"),
          sharedVar: {
            x: extentXData[0],
            y: extentYData[0],
            width: extentXData[1] - extentXData[0],
            height: extentYData[1] - extentYData[0],
            fill: "#000",
            opacity: 0.3
          }
        }).add("HighlightSelection", {
          transient: true,
          layer: layer.getLayerFromQueue("selectionLayer"),
          sharedVar: {
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {}
          }
        });
        await Promise.all(instrument.services.results);
      }
    });
    Instrument.register("DataBrushXInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const scaleX = instrument.getSharedVar("scaleX");
            const services = instrument.services.find("QuantitativeSelectionService");
            const layerPosX = pointer_default(event, layer.getGraphic())[0];
            instrument.setSharedVar("layerOffsetX", event.clientX - layerPosX);
            instrument.setSharedVar("startx", event.clientX);
            instrument.setSharedVar("startLayerPosX", layerPosX);
            const newExtent = [layerPosX, layerPosX + 1].map(scaleX.invert);
            services.setSharedVar("extent", newExtent);
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              x: layerPosX,
              width: 1
            });
          }
        ],
        drag: [
          Command2.initialize("drawBrushAndSelect", {
            continuous: true,
            execute: async ({ event, layer, instrument }) => {
              if (event.changedTouches)
                event = event.changedTouches[0];
              const startx = instrument.getSharedVar("startx");
              const layerOffsetX = instrument.getSharedVar("layerOffsetX");
              const scaleX = instrument.getSharedVar("scaleX");
              const x = Math.min(startx, event.clientX);
              const width = Math.abs(event.clientX - startx);
              const newExtent = [x - layerOffsetX, x - layerOffsetX + width].map(scaleX.invert);
              const services = instrument.services.find("QuantitativeSelectionService");
              instrument.setSharedVar("extent", newExtent);
              services.setSharedVar("extent", newExtent);
              await Promise.all(instrument.services.results);
            },
            feedback: [
              async ({ event, layer, instrument }) => {
                const startLayerPosX = instrument.getSharedVar("startLayerPosX");
                const layerPosX = pointer_default(event, layer.getGraphic())[0];
                console.log(startLayerPosX, layerPosX);
                const x = Math.min(startLayerPosX, layerPosX);
                const width = Math.abs(layerPosX - startLayerPosX);
                instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
                  x,
                  width
                });
              },
              async ({ instrument }) => {
                instrument.transformers.find("HighlightSelection").setSharedVars({
                  highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {}
                });
              }
            ]
          })
        ],
        dragabort: [
          async ({ event, layer, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const services = instrument.services.find("SelectionService");
            services.setSharedVar("x", 0, { layer });
            services.setSharedVar("width", 0, { layer });
            services.setSharedVar("currentx", event.clientX, { layer });
            services.setSharedVar("endx", event.clientX, { layer });
            instrument.transformers.find("TransientRectangleTransformer").setSharedVars({
              x: 0,
              width: 0
            });
          }
        ]
      },
      preAttach: (instrument, layer) => {
        const scaleX = instrument.getSharedVar("scaleX");
        const height = instrument.getSharedVar("height") ?? layer._height;
        const y = instrument.getSharedVar("y") ?? 0;
        const attrName = instrument.getSharedVar("attrNameX");
        const extent = instrument.getSharedVar("extentX") ?? [0, 0];
        const extentData = extent.map(scaleX);
        const services = instrument.services.add("QuantitativeSelectionService", {
          layer
        });
        services.setSharedVar("attrName", attrName);
        services.setSharedVar("extent", extent);
        instrument.transformers.add("TransientRectangleTransformer", {
          transient: true,
          layer: layer.getLayerFromQueue("transientLayer"),
          sharedVar: {
            x: extentData[0],
            y,
            width: extentData[1] - extentData[0],
            height,
            fill: "#000",
            opacity: 0.3
          }
        }).add("HighlightSelection", {
          transient: true,
          layer: layer.getLayerFromQueue("selectionLayer"),
          sharedVar: {
            highlightAttrValues: instrument.getSharedVar("highlightAttrValues") || {}
          }
        });
      }
    });
    Instrument.register("DragInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          ({ layer, event, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.services.setSharedVars({
              x: event.clientX,
              y: event.clientY,
              startx: event.clientX,
              starty: event.clientY,
              currentx: event.clientX,
              currenty: event.clientY,
              offsetx: event.offsetX,
              offsety: event.offsetY,
              offset: { x: 0, y: 0 },
              skipPicking: false
            }, { layer });
          }
        ],
        drag: [
          ({ layer, event, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const offsetX = event.clientX - instrument.services.getSharedVar("x", { layer })[0];
            const offsetY = event.clientY - instrument.services.getSharedVar("y", { layer })[0];
            instrument.setSharedVar("offsetx", offsetX, { layer });
            instrument.setSharedVar("offsety", offsetY, { layer });
            instrument.services.setSharedVars({
              x: event.clientX,
              y: event.clientY,
              currentx: event.clientX,
              currenty: event.clientY,
              offsetx: event.offsetX,
              offsety: event.offsetY,
              offset: { x: offsetX, y: offsetY },
              skipPicking: true
            }, { layer });
          }
        ],
        dragend: [
          ({ layer, event, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const offsetX = event.clientX - instrument.services.getSharedVar("x", { layer })[0];
            const offsetY = event.clientY - instrument.services.getSharedVar("y", { layer })[0];
            instrument.services.setSharedVars({
              x: 0,
              y: 0,
              currentx: event.clientX,
              currenty: event.clientY,
              endx: event.clientX,
              endy: event.clientY,
              offsetx: 0,
              offsety: 0,
              offset: { x: 0, y: 0 },
              skipPicking: false
            }, { layer });
            instrument.setSharedVar("offsetx", offsetX, { layer });
            instrument.setSharedVar("offsety", offsetY, { layer });
          },
          Command2.initialize("Log", { execute() {
          } })
        ],
        dragabort: [
          (options) => {
            let { layer, event, instrument } = options;
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.services.setSharedVars({
              x: 0,
              y: 0,
              currentx: event.clientX,
              currenty: event.clientY,
              endx: 0,
              endy: 0,
              offsetx: 0,
              offsety: 0,
              skipPicking: false
            }, { layer });
            instrument.emit("dragconfirm", {
              ...options,
              self: options.instrument
            });
          }
        ]
      },
      preAttach: (instrument, layer) => {
        instrument.services.add("SurfacePointSelectionService", {
          layer,
          sharedVar: { deepClone: instrument.getSharedVar("deepClone") }
        });
      }
    });
    Instrument.register("SpeechInstrument", {
      constructor: Instrument,
      interactors: ["SpeechControlInteractor"]
    });
    Instrument.register("KeyboardHelperBarInstrument", {
      constructor: Instrument,
      interactors: ["KeyboardPositionInteractor"],
      on: {
        begin: [() => console.log("begin")],
        left: [
          ({ event, layer, instrument }) => {
            const speed = instrument.getSharedVar("speed") || 1;
            const transientLayer = layer.getLayerFromQueue("transientLayer");
            const helperBar = transientLayer.getGraphic().querySelector("line");
            const transform3 = getTransform(helperBar);
            const newX = transform3[0] - speed;
            helperBar.setAttribute("transform", `translate(${newX}, 0)`);
            instrument.setSharedVar("barX", newX, {});
          }
        ],
        right: [
          ({ event, layer, instrument }) => {
            const speed = instrument.getSharedVar("speed") || 1;
            const transientLayer = layer.getLayerFromQueue("transientLayer");
            const helperBar = transientLayer.getGraphic().querySelector("line");
            const transform3 = getTransform(helperBar);
            const newX = transform3[0] + speed;
            helperBar.setAttribute("transform", `translate(${newX}, 0)`);
            instrument.setSharedVar("barX", newX, {});
          }
        ]
      },
      preAttach: function(instrument, layer) {
        layer.getGraphic().setAttribute("tabindex", 0);
        layer.getGraphic().focus();
        const height = layer._height;
        const startPos = instrument.getSharedVar("startPos");
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        const helperBar = document.createElementNS("http://www.w3.org/2000/svg", "line");
        helperBar.setAttribute("x1", startPos);
        helperBar.setAttribute("y1", "0");
        helperBar.setAttribute("x2", startPos);
        helperBar.setAttribute("y2", height);
        helperBar.setAttribute("stroke", `black`);
        helperBar.setAttribute("stroke-width", `1px`);
        transientLayer.getGraphic().append(helperBar);
      }
    });
    Instrument.register("PanInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          ({ layer, event, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.setSharedVar("startx", event.clientX);
            instrument.setSharedVar("starty", event.clientY);
            let transformers = instrument.transformers;
            if (!transformers.length) {
              transformers = transformer_default.findTransformerByLayer(layer);
            }
            transformers.forEach((transformer) => {
              const sx = transformer.getSharedVar("scaleX");
              const sy = transformer.getSharedVar("scaleY");
              if (sx) {
                transformer.setSharedVar("$$scaleX", sx.copy());
              }
              if (sy) {
                transformer.setSharedVar("$$scaleY", sy.copy());
              }
            });
          }
        ],
        drag: [
          async ({ layer, event, instrument, transformer }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            let transformers = instrument.transformers;
            if (!transformers.length) {
              transformers = transformer_default.findTransformerByLayer(layer);
            }
            const startx = instrument.getSharedVar("startx");
            const starty = instrument.getSharedVar("starty");
            const fixRange = instrument.getSharedVar("fixRange") ?? false;
            transformers.forEach((transformer2) => {
              const sx = transformer2.getSharedVar("scaleX");
              const sy = transformer2.getSharedVar("scaleY");
              if (fixRange) {
                if (sx) {
                  const scaleXOrigin = transformer2.getSharedVar("$$scaleX");
                  const startRangeX = scaleXOrigin.range();
                  const newRangeX = startRangeX.map((x, i) => x - event.clientX + startx);
                  const newDomain = newRangeX.map((x) => scaleXOrigin.invert(x));
                  sx.domain(newDomain);
                  transformer2.setSharedVar("scaleX", sx);
                }
                if (sy) {
                  const scaleYOrigin = transformer2.getSharedVar("$$scaleY");
                  const startRangeY = scaleYOrigin.range();
                  const newRangeY = startRangeY.map((y, i) => y - event.clientY + starty);
                  const newDomain = newRangeY.map((y) => scaleYOrigin.invert(y));
                  sy.domain(newDomain);
                  transformer2.setSharedVar("scaleY", sy);
                }
              } else {
                if (sx) {
                  const startRangeX = transformer2.getSharedVar("$$scaleX").range();
                  const newRangeX = startRangeX.map((x, i) => x + event.clientX - startx);
                  sx.range(newRangeX);
                  transformer2.setSharedVar("scaleX", sx);
                }
                if (sy) {
                  const startRangeY = transformer2.getSharedVar("$$scaleY").range();
                  const newRangeY = startRangeY.map((y, i) => y + event.clientY - starty);
                  sy.range(newRangeY);
                  transformer2.setSharedVar("scaleY", sy);
                }
              }
            });
          }
        ],
        dragend: [Command2.initialize("Log", { execute() {
        } })],
        dragabort: [
          ({ layer, event, instrument, transformer }) => {
          }
        ]
      }
    });
    Instrument.register("PanXInstrument", {
      constructor: Instrument,
      interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
      on: {
        dragstart: [
          ({ layer, event, instrument }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            instrument.setSharedVar("startx", event.clientX);
            const transformers = instrument.transformers;
            transformers.forEach((transformer) => {
              const sx = transformer.getSharedVar("scaleX");
              if (sx) {
                transformer.setSharedVar("$$scaleX", sx.copy());
              }
            });
          }
        ],
        drag: [
          async ({ layer, event, instrument, transformer }) => {
            if (event.changedTouches)
              event = event.changedTouches[0];
            const transformers = instrument.transformers;
            const startx = instrument.getSharedVar("startx");
            const fixRange = instrument.getSharedVar("fixRange") ?? false;
            transformers.forEach((transformer2) => {
              const sx = transformer2.getSharedVar("scaleX");
              if (fixRange) {
                if (sx) {
                  const scaleXOrigin = transformer2.getSharedVar("$$scaleX");
                  const startRangeX = scaleXOrigin.range();
                  const newRangeX = startRangeX.map((x, i) => x - event.clientX + startx);
                  const newDomain = newRangeX.map((x) => scaleXOrigin.invert(x));
                  sx.domain(newDomain);
                  transformer2.setSharedVar("scaleX", sx);
                }
              } else {
                if (sx) {
                  const startRangeX = transformer2.getSharedVar("$$scaleX").range();
                  const newRangeX = startRangeX.map((x, i) => x + event.clientX - startx);
                  sx.range(newRangeX);
                  transformer2.setSharedVar("scaleX", sx);
                }
              }
            });
          }
        ],
        dragabort: [
          ({ layer, event, instrument, transformer }) => {
          }
        ]
      }
    });
    Instrument.register("GeometricZoomInstrument", {
      constructor: Instrument,
      interactors: ["MouseWheelInteractor"],
      on: {
        wheel: [
          ({ layer, instrument, event }) => {
            const layerGraphic = layer.getGraphic();
            const layerRoot = select_default2(layerGraphic);
            let transformers = instrument.transformers;
            if (!transformers.length) {
              transformers = transformer_default.findTransformerByLayer(layer);
            }
            instrument.setSharedVar("currentx", event.offsetX);
            instrument.setSharedVar("currenty", event.offsetY);
            let delta = event.deltaY;
            instrument.setSharedVar("delta", delta);
            let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
              defaultValue: 0
            });
            cumulativeDelta += delta;
            instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
            delta /= 1e3;
            const [x, y] = pointer_default(event, layerGraphic);
            const offsetX = instrument.getSharedVar("centroidX") || x;
            const offsetY = instrument.getSharedVar("centroidY") || y;
            const fixRange = instrument.getSharedVar("fixRange") ?? false;
            transformers.forEach((transformer) => {
              const sx = transformer.getSharedVar("scaleX");
              const sy = transformer.getSharedVar("scaleY");
              if (fixRange) {
                if (sx) {
                  if (sx.type === "time") {
                    const offsetXDomain = sx.invert(offsetX);
                    sx.domain(sx.domain().map((d) => new Date(d.getTime() - offsetXDomain.getTime())).map((d) => new Date(d.getTime() * Math.exp(-delta))).map((d) => new Date(d.getTime() + offsetXDomain.getTime())));
                  } else {
                    const offsetXDomain = sx.invert(offsetX);
                    sx.domain(sx.domain().map((d) => d - offsetXDomain).map((d) => d * Math.exp(-delta)).map((d) => d + offsetXDomain));
                  }
                  transformers.forEach((transformer2) => transformer2.setSharedVar("scaleX", sx));
                }
                if (sy) {
                  if (sy.type === "time") {
                    const offsetYDomain = sy.invert(offsetY);
                    sy.domain(sy.domain().map((d) => new Date(d.getTime() - offsetYDomain.getTime())).map((d) => new Date(d.getTime() * Math.exp(-delta))).map((d) => new Date(d.getTime() + offsetYDomain.getTime())));
                  } else {
                    const offsetYDomain = sy.invert(offsetY);
                    sy.domain(sy.domain().map((d) => d - offsetYDomain).map((d) => d * Math.exp(-delta)).map((d) => d + offsetYDomain));
                  }
                  transformers.forEach((transformer2) => transformer2.setSharedVar("scaleY", sy));
                }
              } else {
                if (sx) {
                  const newRangeX = sx.range().map((x2) => (x2 - offsetX) * Math.exp(delta) + offsetX);
                  sx.range(newRangeX);
                  transformer.setSharedVar("scaleX", sx);
                }
                if (sy) {
                  const newRangeY = sy.range().map((y2) => (y2 - offsetY) * Math.exp(delta) + offsetY);
                  sy.range(newRangeY);
                  transformer.setSharedVar("scaleY", sy);
                }
              }
            });
          }
        ],
        abort: [
          ({ layer, event, instrument, transformer }) => {
          }
        ]
      }
    });
    Instrument.register("SemanticZoomInstrument", {
      constructor: Instrument,
      interactors: ["MouseWheelInteractor"],
      sharedVar: {
        currentLevel: 0
      },
      on: {
        wheel: [
          ({ layer, instrument, event }) => {
            const layerGraphic = layer.getGraphic();
            const layerRoot = select_default2(layerGraphic);
            let transformers = instrument.transformers;
            if (!transformers.length) {
              transformers = transformer_default.findTransformerByLayer(layer);
            }
            const scaleLevels = instrument.getSharedVar("scaleLevels");
            let currentLevel = instrument.getSharedVar("currentLevel");
            currentLevel += Math.sign(event.deltaY);
            instrument.setSharedVar("currentLevel", currentLevel);
            if (typeof scaleLevels === "object") {
              const closestLevel = Object.keys(scaleLevels).reduce(function(prev, curr) {
                return Math.abs(parseInt(curr) - currentLevel) < Math.abs(parseInt(prev) - currentLevel) ? curr : prev;
              });
              transformers.forEach((t) => t.setSharedVars(scaleLevels[closestLevel]));
            }
            instrument.setSharedVar("currentx", event.offsetX);
            instrument.setSharedVar("currenty", event.offsetY);
            let delta = event.deltaY;
            instrument.setSharedVar("delta", delta);
            let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
              defaultValue: 0
            });
            cumulativeDelta += delta;
            instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
            delta /= 1e3;
            const [x, y] = pointer_default(event, layerGraphic);
            const offsetX = instrument.getSharedVar("centroidX") || x;
            const offsetY = instrument.getSharedVar("centroidY") || y;
            const fixRange = instrument.getSharedVar("fixRange") ?? false;
            transformers.forEach((transformer) => {
              const sx = transformer.getSharedVar("scaleX");
              const sy = transformer.getSharedVar("scaleY");
              if (fixRange) {
                if (sx) {
                  if (sx.type === "time") {
                    const offsetXDomain = sx.invert(offsetX);
                    sx.domain(sx.domain().map((d) => new Date(d.getTime() - offsetXDomain.getTime())).map((d) => new Date(d.getTime() * Math.exp(-delta))).map((d) => new Date(d.getTime() + offsetXDomain.getTime())));
                  } else {
                    const offsetXDomain = sx.invert(offsetX);
                    sx.domain(sx.domain().map((d) => d - offsetXDomain).map((d) => d * Math.exp(-delta)).map((d) => d + offsetXDomain));
                  }
                  transformers.forEach((transformer2) => transformer2.setSharedVar("scaleX", sx));
                }
                if (sy) {
                  if (sy.type === "time") {
                    const offsetYDomain = sy.invert(offsetY);
                    sy.domain(sy.domain().map((d) => new Date(d.getTime() - offsetYDomain.getTime())).map((d) => new Date(d.getTime() * Math.exp(-delta))).map((d) => new Date(d.getTime() + offsetYDomain.getTime())));
                  } else {
                    const offsetYDomain = sy.invert(offsetY);
                    sy.domain(sy.domain().map((d) => d - offsetYDomain).map((d) => d * Math.exp(-delta)).map((d) => d + offsetYDomain));
                  }
                  transformers.forEach((transformer2) => transformer2.setSharedVar("scaleY", sy));
                }
              } else {
                if (sx) {
                  const newRangeX = sx.range().map((x2) => (x2 - offsetX) * Math.exp(delta) + offsetX);
                  sx.range(newRangeX);
                  transformer.setSharedVar("scaleX", sx);
                }
                if (sy) {
                  const newRangeY = sy.range().map((y2) => (y2 - offsetY) * Math.exp(delta) + offsetY);
                  sy.range(newRangeY);
                  transformer.setSharedVar("scaleY", sy);
                }
              }
            });
          }
        ],
        abort: [
          ({ layer, event, instrument, transformer }) => {
          }
        ]
      },
      postUse(instrument, layer) {
        const scaleLevels = instrument.getSharedVar("scaleLevels");
        const transformers = instrument.transformers;
        const currentLevel = instrument.getSharedVar("currentLevel");
        if (typeof scaleLevels === "object") {
          const closestLevel = Object.keys(scaleLevels).reduce(function(prev, curr) {
            return Math.abs(parseInt(curr) - currentLevel) < Math.abs(parseInt(prev) - currentLevel) ? curr : prev;
          });
          transformers.setSharedVars(scaleLevels[closestLevel]);
        }
      }
    });
    Instrument.register("ZoomXInstrument", {
      constructor: Instrument,
      interactors: ["MouseWheelInteractor"],
      on: {
        wheel: [
          ({ layer, instrument, event }) => {
            const layerGraphic = layer.getGraphic();
            const layerRoot = select_default2(layerGraphic);
            const transformers = instrument.transformers;
            instrument.setSharedVar("currentx", event.offsetX);
            let delta = event.deltaY;
            instrument.setSharedVar("delta", delta);
            let cumulativeDelta = instrument.getSharedVar("cumulativeDelta", {
              defaultValue: 0
            });
            cumulativeDelta += delta;
            instrument.setSharedVar("cumulativeDelta", cumulativeDelta);
            delta /= 1e3;
            const [x, y] = pointer_default(event, layerGraphic);
            const offsetX = instrument.getSharedVar("centroidX") || x;
            const fixRange = instrument.getSharedVar("fixRange") ?? false;
            transformers.forEach((transformer) => {
              const sx = transformer.getSharedVar("scaleX");
              if (fixRange) {
                if (sx) {
                  const offsetXDomain = sx.invert(offsetX);
                  sx.domain(sx.domain().map((d) => d - offsetXDomain).map((d) => d * Math.exp(-delta)).map((d) => d + offsetXDomain));
                  transformers.forEach((transformer2) => transformer2.setSharedVar("scaleX", sx));
                }
              } else {
                if (sx) {
                  const newRangeX = sx.range().map((x2) => (x2 - offsetX) * Math.exp(delta) + offsetX);
                  sx.range(newRangeX);
                  transformer.setSharedVar("scaleX", sx);
                }
              }
            });
          }
        ],
        abort: [
          ({ layer, event, instrument, transformer }) => {
          }
        ]
      }
    });
  }
});

// dist/esm/instrument/index.js
var instanceInstruments2, Instrument2;
var init_instrument2 = __esm({
  "dist/esm/instrument/index.js"() {
    init_instrument();
    init_instrument();
    init_builtin3();
    instanceInstruments2 = instanceInstruments;
    Instrument2 = Instrument;
  }
});

// dist/esm/history/index.js
var history_exports = {};
__export(history_exports, {
  createHistoryTrrack: () => createHistoryTrrack,
  tryGetHistoryTrrackInstance: () => tryGetHistoryTrrackInstance,
  tryRegisterDynamicInstance: () => tryRegisterDynamicInstance
});
async function createHistoryTrrack() {
  let historyTrace = null;
  let currentHistoryNode = null;
  let commitLock = false;
  const HistoryManager = {
    traceStructure: (node = historyTrace) => {
      return {
        recordList: [...node.record.keys()],
        children: node.children.map((node2) => HistoryManager.traceStructure(node2)),
        current: node === currentHistoryNode
      };
    },
    commit: async (commandName) => {
      if (commitLock) {
        return;
      }
      const record = new Map();
      for (let { component, fields } of [
        { list: instanceInteractors2, fields: ["_state", "_modalities"] },
        { list: instanceInstruments2, fields: ["_sharedVar"] },
        { list: instanceServices2, fields: ["_sharedVar", "_result", "_oldResult"] },
        { list: instanceTransformers2, fields: ["_sharedVar"] }
      ].flatMap(({ list, fields: fields2 }) => list.filter((component2) => tryGetHistoryTrrackInstance(component2) === HistoryManager).map((component2) => ({ component: component2, fields: fields2 })))) {
        await component.results;
        record.set(component, Object.fromEntries(fields.map((field) => [field, deepClone(component[field])])));
      }
      if (commandName && commandName != "Log") {
        const checkParent = (historyNode) => {
          if (historyNode.name === "Log" && historyNode.prev && historyNode.prev.children.length == 1) {
            historyNode.prev.children = [];
            return checkParent(historyNode.prev);
          }
          if (historyNode.name === "Log" && historyNode.prev) {
            historyNode.prev.children.splice(historyNode.prev.children.indexOf(historyNode), 1);
            return checkParent(historyNode.prev);
          }
          return historyNode;
        };
        currentHistoryNode = checkParent(currentHistoryNode);
      }
      const newHistoryNode = {
        name: commandName,
        record,
        prev: currentHistoryNode,
        next: null,
        children: []
      };
      if (currentHistoryNode) {
        currentHistoryNode.children.push(newHistoryNode);
      }
      currentHistoryNode = newHistoryNode;
    },
    async undo() {
      if (currentHistoryNode && currentHistoryNode.prev) {
        currentHistoryNode.prev.next = currentHistoryNode;
        const record = currentHistoryNode.prev.record;
        commitLock = true;
        for (let [component, records] of record.entries()) {
          let layerHold = null;
          if ("_sharedVar" in component && component._sharedVar.layer) {
            layerHold = component._sharedVar.layer;
          }
          Object.entries(records).forEach(([k, v]) => component[k] = deepClone(v));
          if (layerHold && "_sharedVar" in component && !component._sharedVar.layer) {
            component._sharedVar.layer = layerHold;
          }
          if ("_sharedVar" in records) {
            await component.setSharedVar("$LIBRA_FORCE_UPDATE", void 0);
          }
        }
        currentHistoryNode = currentHistoryNode.prev;
        commitLock = false;
      }
    },
    async redo() {
      if (currentHistoryNode && currentHistoryNode.children.length === 1 && !currentHistoryNode.next) {
        currentHistoryNode.next = currentHistoryNode.children[0];
      }
      if (currentHistoryNode && currentHistoryNode.next) {
        const record = currentHistoryNode.next.record;
        commitLock = true;
        try {
          for (let [component, records] of record.entries()) {
            let layerHold = null;
            if ("_sharedVar" in component && component._sharedVar.layer) {
              layerHold = component._sharedVar.layer;
            }
            Object.entries(records).forEach(([k, v]) => component[k] = deepClone(v));
            if (layerHold && "_sharedVar" in component && !component._sharedVar.layer) {
              component._sharedVar.layer = layerHold;
            }
            if ("_sharedVar" in records) {
              await component.setSharedVar("$LIBRA_FORCE_UPDATE", void 0);
            }
          }
          currentHistoryNode = currentHistoryNode.next;
        } catch (e) {
          console.error("Fail to redo history!", e);
          const record2 = currentHistoryNode.record;
          for (let [component, records] of record2.entries()) {
            Object.entries(records).forEach(([k, v]) => component[k] = deepClone(v));
            if ("_sharedVar" in records) {
              await component.setSharedVar("$LIBRA_FORCE_UPDATE", void 0);
            }
          }
        }
        commitLock = false;
      }
    },
    async jump(path = []) {
      const targetNode = path.reduce((p, v) => p?.children[v], historyTrace);
      if (targetNode) {
        const record = targetNode.record;
        commitLock = true;
        try {
          for (let [component, records] of record.entries()) {
            let layerHold = null;
            if ("_sharedVar" in component && component._sharedVar.layer) {
              layerHold = component._sharedVar.layer;
            }
            Object.entries(records).forEach(([k, v]) => component[k] = deepClone(v));
            if (layerHold && "_sharedVar" in component && !component._sharedVar.layer) {
              component._sharedVar.layer = layerHold;
            }
            if ("_sharedVar" in records) {
              await component.setSharedVar("$LIBRA_FORCE_UPDATE", void 0);
            }
          }
          currentHistoryNode = targetNode;
        } catch (e) {
          console.error("Fail to jump history!", e);
          const record2 = currentHistoryNode.record;
          for (let [component, records] of record2.entries()) {
            Object.entries(records).forEach(([k, v]) => component[k] = deepClone(v));
            if ("_sharedVar" in records) {
              await component.setSharedVar("$LIBRA_FORCE_UPDATE", void 0);
            }
          }
        }
        commitLock = false;
      } else {
        console.error(`History path [${path.join(", ")}] does not exist!`);
      }
    }
  };
  [
    instanceServices2,
    instanceTransformers2,
    instanceCommands,
    instanceInstruments2,
    instanceInteractors2
  ].flatMap((x) => x).forEach((component) => {
    if (!historyInstanceMapping.has(component)) {
      historyInstanceMapping.set(component, HistoryManager);
    }
  });
  await HistoryManager.commit();
  historyTrace = currentHistoryNode;
  return HistoryManager;
}
function tryGetHistoryTrrackInstance(component) {
  const directHM = historyInstanceMapping.get(component);
  if (directHM) {
    return directHM;
  }
  return {
    traceStructure() {
      return null;
    },
    async commit() {
    },
    async undo() {
    },
    async redo() {
    }
  };
}
function tryRegisterDynamicInstance(parentComponent, newComponent) {
  const HM = historyInstanceMapping.get(parentComponent);
  if (HM) {
    historyInstanceMapping.set(newComponent, HM);
  }
}
var historyInstanceMapping;
var init_history = __esm({
  "dist/esm/history/index.js"() {
    init_service2();
    init_transformer2();
    init_command2();
    init_instrument2();
    init_interactor2();
    init_helpers();
    historyInstanceMapping = new Map();
  }
});

// dist/esm/helpers.js
function makeFindableList(list, typing, addFunc, removeFunc, self) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return function(name, defaultValue) {
          if (!("initialize" in typing)) {
            const filteredResult = target.slice();
            filteredResult.forEach((newTarget) => {
              newTarget.find(...arguments);
            });
            return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
          } else {
            const filteredResult = target.filter((item) => item.isInstanceOf(name));
            if (filteredResult.length <= 0 && defaultValue) {
              const newElement = typing.initialize(defaultValue);
              addFunc(newElement);
              filteredResult.push(newElement);
              tryRegisterDynamicInstance2(self, newElement);
            }
            return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
          }
        };
      } else if (p === "add") {
        return (...args) => {
          const filteredResult = target.slice();
          if (!("initialize" in typing)) {
            filteredResult.forEach((newTarget) => {
              newTarget.add(...args);
            });
            return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
          } else {
            const newElement = typing.initialize(...args);
            addFunc(newElement);
            filteredResult.push(newElement);
            tryRegisterDynamicInstance2(self, newElement);
            return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
          }
        };
      } else if (p === "remove") {
        return (name) => {
          if (typing === NonsenseClass) {
            const filteredResult = target.slice();
            filteredResult.forEach((newTarget) => {
              newTarget.remove(name);
            });
            return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
          } else {
            const origin = target.slice();
            const filteredResult = origin.filter((item) => item.isInstanceOf(name));
            filteredResult.forEach((item) => {
              removeFunc(item);
              origin.splice(origin.indexOf(item), 1);
            });
            return makeFindableList(origin, typing, addFunc, removeFunc, self);
          }
        };
      } else if (p in target && p !== "join" && p !== "filter") {
        return target[p];
      } else {
        if (!target.length) {
          const f = () => {
          };
          f[Symbol.iterator] = function* () {
          };
          return f;
        } else if (target[0][p] instanceof Function) {
          return function() {
            return makeFindableList(target.map((t) => t[p].apply(t, arguments)), NonsenseClass, () => {
            }, () => {
            }, self);
          };
        } else {
          return makeFindableList(target.map((t) => t[p]), NonsenseClass, () => {
          }, () => {
          }, self);
        }
      }
    }
  });
}
function getTransform(elem) {
  try {
    const transform3 = elem.getAttribute("transform").split("(")[1].split(")")[0].split(",").map((i) => parseFloat(i));
    return transform3;
  } catch (e) {
    return [0, 0];
  }
}
function parseEventSelector(selector) {
  return parseMerge(selector.trim()).map(parseSelector);
}
function isMarkType(type2) {
  return MARKS.hasOwnProperty(type2);
}
function find2(s, i, endChar, pushChar, popChar) {
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
    i = find2(s, i, COMMA, LBRACK + LBRACE, RBRACK + RBRACE);
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
  i = find2(s, i, RBRACK, LBRACK, RBRACK);
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
  j = find2(s, i, COLON);
  if (j < n) {
    source.push(s.substring(start2, j).trim());
    start2 = i = ++j;
  }
  i = find2(s, i, LBRACK);
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
    i = find2(s, i, RBRACK);
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
function deepClone(obj) {
  if (obj && obj instanceof Object && "copy" in obj && obj.copy instanceof Function) {
    const nodeCopy = obj.copy();
    for (let key in Object.getOwnPropertyDescriptors(obj)) {
      if (!(key in nodeCopy)) {
        nodeCopy[key] = obj[key];
      }
    }
    return nodeCopy;
  }
  if (obj instanceof Array) {
    return obj.map(deepClone);
  }
  if ([
    "string",
    "number",
    "boolean",
    "undefined",
    "bigint",
    "symbol",
    "function"
  ].includes(typeof obj)) {
    return obj;
  }
  if (obj === null)
    return null;
  if (LibraSymbol in obj && obj[LibraSymbol]) {
    return obj;
  }
  if (obj instanceof Node) {
    const nodeCopy = obj.cloneNode(true);
    Object.assign(nodeCopy, obj);
    return nodeCopy;
  }
  const propertyObject = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), propertyObject);
}
var LibraSymbol, QueryType, ShapeQueryType, DataQueryType, NonsenseClass, tryRegisterDynamicInstance2, VIEW, LBRACK, RBRACK, LBRACE, RBRACE, COLON, COMMA, NAME, GT, ILLEGAL, DEFAULT_SOURCE, DEFAULT_MARKS, MARKS, global;
var init_helpers = __esm({
  "dist/esm/helpers.js"() {
    LibraSymbol = Symbol("Libra");
    (function(QueryType2) {
      QueryType2[QueryType2["Shape"] = 0] = "Shape";
      QueryType2[QueryType2["Data"] = 1] = "Data";
      QueryType2[QueryType2["Attr"] = 2] = "Attr";
    })(QueryType || (QueryType = {}));
    (function(ShapeQueryType2) {
      ShapeQueryType2[ShapeQueryType2["SurfacePoint"] = 0] = "SurfacePoint";
      ShapeQueryType2[ShapeQueryType2["Point"] = 1] = "Point";
      ShapeQueryType2[ShapeQueryType2["Circle"] = 2] = "Circle";
      ShapeQueryType2[ShapeQueryType2["Rect"] = 3] = "Rect";
      ShapeQueryType2[ShapeQueryType2["Polygon"] = 4] = "Polygon";
    })(ShapeQueryType || (ShapeQueryType = {}));
    (function(DataQueryType2) {
      DataQueryType2[DataQueryType2["Quantitative"] = 0] = "Quantitative";
      DataQueryType2[DataQueryType2["Nominal"] = 1] = "Nominal";
      DataQueryType2[DataQueryType2["Temporal"] = 2] = "Temporal";
    })(DataQueryType || (DataQueryType = {}));
    NonsenseClass = class {
    };
    tryRegisterDynamicInstance2 = (...args) => {
    };
    VIEW = "view";
    LBRACK = "[";
    RBRACK = "]";
    LBRACE = "{";
    RBRACE = "}";
    COLON = ":";
    COMMA = ",";
    NAME = "@";
    GT = ">";
    ILLEGAL = /[[\]{}]/;
    DEFAULT_SOURCE = VIEW;
    DEFAULT_MARKS = {
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
    MARKS = DEFAULT_MARKS;
    global = {
      stopTransient: false
    };
    Promise.resolve().then(() => (init_history(), history_exports)).then((HM) => {
      tryRegisterDynamicInstance2 = HM.tryRegisterDynamicInstance;
    });
  }
});

// dist/esm/command/command.js
var _a6, tryGetHistoryTrrackInstance2, registeredCommands, instanceCommands2, Command2, register7, unregister5, initialize7, findCommand;
var init_command = __esm({
  "dist/esm/command/command.js"() {
    init_helpers();
    registeredCommands = {};
    instanceCommands2 = [];
    Command2 = class {
      constructor(baseName4, options) {
        this[_a6] = true;
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName4;
        this._userOptions = options;
        this._name = options.name ?? baseName4;
        this._feedback = options.feedback ?? [];
        this._undo = options.undo ?? null;
        this._redo = options.redo ?? null;
        this._execute = options.execute ?? null;
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preExecute = options.preExecute ?? null;
        this._postExecute = options.postExecute ?? null;
        options.postInitialize && options.postInitialize.call(this, this);
      }
      undo() {
        this._undo && this._undo.call(this);
      }
      redo() {
        this._redo && this._redo.call(this);
      }
      async execute(options) {
        try {
          this.preExecute();
          this._execute && await this._execute.call(this, options);
          this.postExecute();
          for (let feedback of this._feedback) {
            await feedback.call(this, options);
          }
          await tryGetHistoryTrrackInstance2(this).commit(this._name);
        } catch (e) {
          console.error(e);
        }
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
      static register(baseName4, options) {
        registeredCommands[baseName4] = options;
      }
      static unregister(baseName4) {
        delete registeredCommands[baseName4];
        return true;
      }
      static initialize(baseName4, options) {
        const mergedOptions = Object.assign({ constructor: Command2 }, registeredCommands[baseName4] ?? {}, options ?? {});
        const command = new mergedOptions.constructor(baseName4, mergedOptions);
        instanceCommands2.push(command);
        return command;
      }
      static findCommand(baseNameOrRealName) {
        return instanceCommands2.filter((command) => command.isInstanceOf(baseNameOrRealName));
      }
    };
    _a6 = LibraSymbol;
    register7 = Command2.register;
    unregister5 = Command2.unregister;
    initialize7 = Command2.initialize;
    findCommand = Command2.findCommand;
    Promise.resolve().then(() => (init_history(), history_exports)).then((HM) => {
      tryGetHistoryTrrackInstance2 = HM.tryGetHistoryTrrackInstance;
    });
  }
});

// dist/esm/command/index.js
var instanceCommands, Command;
var init_command2 = __esm({
  "dist/esm/command/index.js"() {
    init_command();
    init_command();
    instanceCommands = instanceCommands2;
    Command = Command2;
  }
});

// dist/esm/index.js
init_command2();
init_instrument2();
init_interactor2();
init_layer2();
init_service2();
init_history();
init_transformer2();

// dist/esm/interaction/index.js
init_instrument();
init_instrument();
init_layer2();
init_service2();
init_transformer2();
init_interactor();
init_selectionService();
init_helpers();
init_command2();
var registeredInteractions = {};
var Interaction = class {
  static build(options) {
    if (!(options.inherit in registeredInstruments) && !(options.inherit in registeredInteractions)) {
      throw new Error(`Interaction ${options.inherit} is not registered, please register it first`);
    }
    let instrument;
    if (options.inherit in registeredInstruments) {
      const inheritOption = Object.assign({ constructor: Instrument }, registeredInstruments[options.inherit], {
        sharedVar: Object.assign({}, {
          layers: options.layers ?? [],
          layer: options.layers?.length == 1 ? options.layers[0] : void 0
        }, registeredInstruments[options.inherit].sharedVar ?? {}, options.sharedVar ?? {})
      });
      if (options.layers) {
        inheritOption.layers = options.layers;
      }
      instrument = new inheritOption.constructor(options.inherit, inheritOption);
      instanceInstruments.push(instrument);
    } else {
      const inheritOption = Object.assign({}, registeredInteractions[options.inherit], options, {
        inherit: registeredInteractions[options.inherit].inherit,
        sharedVar: Object.assign({}, {
          layers: options.layers ?? [],
          layer: options.layers?.length == 1 ? options.layers[0] : void 0
        }, registeredInteractions[options.inherit].sharedVar ?? {}, options.sharedVar ?? {})
      });
      instrument = Interaction.build(inheritOption);
      instanceInstruments.push(instrument);
    }
    if (options.name) {
      registeredInteractions[options.name] = options;
      if (!options.layers || !options.layers.length)
        return;
    }
    const findNested = (parent, findType) => {
      if (parent instanceof Instrument) {
        const s = parent._serviceInstances.find((service) => service.isInstanceOf(findType));
        if (s)
          return [s, parent];
        const t = parent._transformers.find((transformer) => transformer.isInstanceOf(findType));
        if (t)
          return [t, parent];
        for (let service of parent._serviceInstances) {
          const result = findNested(service, findType);
          if (result)
            return result;
        }
      } else {
        const s = parent._services.find((service) => service.isInstanceOf(findType));
        if (s)
          return [s, parent];
        const t = parent._transformers.find((transformer) => transformer.isInstanceOf(findType));
        if (t)
          return [t, parent];
        for (let service of parent.services) {
          const result = findNested(service, findType);
          if (result)
            return result;
        }
      }
      return [void 0, void 0];
    };
    const findNestedReference = (parent, findType) => {
      if (parent.isInstanceOf(findType))
        return parent;
      if (parent instanceof Instrument) {
        const s = parent._serviceInstances.find((service) => service.isInstanceOf(findType));
        if (s)
          return s;
        for (let service of parent._serviceInstances) {
          const result = findNestedReference(service, findType);
          if (result)
            return result;
        }
      } else {
        const s = parent._services.find((service) => service.isInstanceOf(findType));
        if (s)
          return s;
        for (let service of parent.services) {
          const result = findNestedReference(service, findType);
          if (result)
            return result;
        }
      }
    };
    if (options.remove) {
      for (let removeOption of options.remove) {
        while (true) {
          const [removeNode, parentNode] = findNested(instrument, removeOption.find);
          if (!removeNode)
            break;
          let parentServiceArray = parentNode instanceof Instrument ? parentNode._serviceInstances : parentNode._services;
          if (removeOption.cascade) {
            if (removeNode instanceof Service2) {
              parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1);
            } else {
              parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
            }
          } else {
            if (removeNode instanceof Service2) {
              parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1, ...removeNode._services);
              parentNode._transformers.push(...removeNode._transformers);
            } else {
              parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
            }
          }
        }
      }
    }
    if (options.override) {
      for (let overrideOption of options.override) {
        if (overrideOption.find.endsWith("Interactor")) {
          const interactorsList = [...instrument._layerInteractors.values()];
          const removeNodes = interactorsList.map((interactors) => interactors.filter((interactor) => interactor.isInstanceOf(overrideOption.find)));
          if (overrideOption.comp) {
            removeNodes.forEach((list, i) => {
              list.forEach((interactor) => {
                const newInteractor = Interactor.initialize(overrideOption.comp);
                if (newInteractor) {
                  interactorsList[i].splice(interactorsList[i].indexOf(interactor), 1, newInteractor);
                }
              });
            });
          } else if (overrideOption.actions) {
            removeNodes.forEach((list) => {
              list.forEach((interactor) => {
                interactor._actions = deepClone(overrideOption.actions).map(transferInteractorInnerAction);
              });
            });
          }
        } else {
          const [removeNode, parentNode] = findNested(instrument, overrideOption.find);
          if (!removeNode)
            continue;
          let replaceNode;
          if (overrideOption.comp.includes("Transformer")) {
            let transformer;
            if (overrideOption.name) {
              if (GraphicalTransformer2.findTransformer(overrideOption.name).length > 0) {
                transformer = GraphicalTransformer2.findTransformer(overrideOption.name)[0];
              }
            }
            if (!transformer)
              transformer = GraphicalTransformer2.initialize(overrideOption.comp, {
                name: overrideOption.name,
                sharedVar: {
                  ...options.sharedVar || {},
                  ...overrideOption.sharedVar || {}
                }
              });
            replaceNode = transformer;
          } else if (overrideOption.comp.includes("Service")) {
            let service;
            if (overrideOption.name) {
              if (Service2.findService(overrideOption.name).length > 0) {
                service = Service2.findService(overrideOption.name)[0];
              }
            }
            if (!service)
              service = Service2.initialize(overrideOption.comp, {
                ...overrideOption,
                services: [
                  ...overrideOption.services || [],
                  ...removeNode instanceof Service2 ? removeNode._services : []
                ],
                transformers: [
                  ...overrideOption.transformers || [],
                  ...removeNode instanceof Service2 ? removeNode._transformers : []
                ],
                sharedVar: {
                  ...options.sharedVar || {},
                  ...overrideOption.sharedVar || {}
                }
              });
            if (overrideOption.dimension && service.isInstanceOf("SelectionService")) {
              service = service.dimension(overrideOption.dimension);
              if (overrideOption.layers) {
                service._layerInstances = overrideOption.layers.slice(0);
              }
              if (overrideOption.sharedVar) {
                service.setSharedVars(overrideOption.sharedVar);
              }
            }
            replaceNode = service;
          }
          let parentServiceArray = parentNode instanceof Instrument ? parentNode._serviceInstances : parentNode._services;
          if (removeNode instanceof Service2) {
            parentServiceArray.splice(parentServiceArray.indexOf(removeNode), 1);
          } else {
            parentNode._transformers.splice(parentNode._transformers.indexOf(removeNode), 1);
          }
          if (overrideOption.comp.includes("Transformer")) {
            parentNode._transformers.push(replaceNode);
          } else {
            parentServiceArray.push(replaceNode);
          }
        }
      }
    }
    if (options.insert) {
      for (let insert of options.insert) {
        const insertNode = findNestedReference(instrument, insert.find);
        if (!insertNode)
          continue;
        let prevComponent = null;
        let prevType = null;
        for (let i = insert.flow.length - 1; i >= 0; i--) {
          const componentOption = insert.flow[i];
          if (componentOption instanceof Function) {
            const newPrevComponent = [];
            let newPrevType = null;
            for (let j = 0; j < options.layers?.length; j++) {
              const layer = options.layers[j];
              const generatedOption = componentOption(layer, j);
              if (generatedOption.comp.includes("Transformer")) {
                let transformer;
                if (generatedOption.name) {
                  if (GraphicalTransformer2.findTransformer(generatedOption.name).length > 0) {
                    transformer = GraphicalTransformer2.findTransformer(generatedOption.name)[0];
                  }
                }
                if (!transformer)
                  transformer = GraphicalTransformer2.initialize(generatedOption.comp, {
                    ...generatedOption,
                    sharedVar: {
                      ...options.sharedVar || {},
                      ...generatedOption.sharedVar || {}
                    }
                  });
                newPrevComponent.push(transformer);
                newPrevType = "Transformer";
              } else if (generatedOption.comp.includes("Service")) {
                let service;
                if (generatedOption.name) {
                  if (Service2.findService(generatedOption.name).length > 0) {
                    service = Service2.findService(generatedOption.name)[0];
                  }
                }
                if (!service)
                  service = Service2.initialize(generatedOption.comp, {
                    ...generatedOption,
                    ...prevComponent ? prevType == "Transformer" ? {
                      transformers: prevComponent instanceof Array ? prevComponent : [prevComponent]
                    } : {
                      services: prevComponent instanceof Array ? prevComponent : [prevComponent]
                    } : {},
                    sharedVar: {
                      ...options.sharedVar || {},
                      ...generatedOption.sharedVar || {}
                    }
                  });
                if (generatedOption.dimension && service instanceof SelectionService) {
                  service = service.dimension(generatedOption.dimension);
                  if (generatedOption.layers) {
                    service._layerInstances = generatedOption.layers.slice(0);
                  }
                  if (generatedOption.sharedVar) {
                    service.setSharedVars(generatedOption.sharedVar);
                  }
                }
                newPrevComponent.push(service);
                newPrevType = "Service";
              }
            }
            prevComponent = newPrevComponent;
            prevType = newPrevType;
          } else if (componentOption instanceof Array) {
            const newPrevComponent = [];
            let newPrevType = null;
            for (let j = 0; j < componentOption.length; j++) {
              const component = componentOption[j];
              if (component instanceof GraphicalTransformer2) {
                newPrevComponent.push(component);
                newPrevType = "Transformer";
              } else if (component instanceof Service2) {
                if (prevType == "Transformer") {
                  component._transformers.push(...prevComponent instanceof Array ? prevComponent : [prevComponent]);
                } else {
                  component._services.push(...prevComponent instanceof Array ? prevComponent : [prevComponent]);
                }
                newPrevComponent.push(component);
                newPrevType = "Service";
              } else if (component.comp.includes("Transformer")) {
                let transformer;
                if (component.name) {
                  if (GraphicalTransformer2.findTransformer(component.name).length > 0) {
                    transformer = GraphicalTransformer2.findTransformer(component.name)[0];
                  }
                }
                if (!transformer)
                  transformer = GraphicalTransformer2.initialize(component.comp, {
                    ...component,
                    sharedVar: {
                      ...options.sharedVar || {},
                      ...component.sharedVar || {}
                    }
                  });
                newPrevComponent.push(transformer);
                newPrevType = "Transformer";
              } else if (component.comp.includes("Service")) {
                let service;
                if (component.name) {
                  if (Service2.findService(component.name).length > 0) {
                    service = Service2.findService(component.name)[0];
                  }
                }
                if (!service)
                  service = Service2.initialize(component.comp, {
                    ...component,
                    ...prevComponent ? prevType == "Transformer" ? {
                      transformers: prevComponent instanceof Array ? prevComponent : [prevComponent]
                    } : {
                      services: prevComponent instanceof Array ? prevComponent : [prevComponent]
                    } : {},
                    sharedVar: {
                      ...options.sharedVar || {},
                      ...component.sharedVar || {}
                    }
                  });
                if (component.dimension && service instanceof SelectionService) {
                  service = service.dimension(component.dimension);
                  if (component.layers) {
                    service._layerInstances = component.layers.slice(0);
                  }
                  if (component.sharedVar) {
                    service.setSharedVars(component.sharedVar);
                  }
                }
                newPrevComponent.push(service);
                newPrevType = "Service";
              }
            }
            prevComponent = newPrevComponent;
            prevType = newPrevType;
          } else if (componentOption instanceof GraphicalTransformer2) {
            prevComponent = componentOption;
            prevType = "Transformer";
          } else if (componentOption instanceof Service2) {
            if (prevType == "Transformer") {
              componentOption._transformers.push(...prevComponent instanceof Array ? prevComponent : [prevComponent]);
            } else {
              componentOption._services.push(...prevComponent instanceof Array ? prevComponent : [prevComponent]);
            }
            prevComponent = componentOption;
            prevType = "Service";
          } else if (componentOption instanceof Command) {
            if (prevType == "Service") {
              if (prevComponent instanceof Array) {
                prevComponent.forEach((service) => service._command.push(componentOption));
              } else {
                prevComponent._command.push(componentOption);
              }
            }
          } else if (componentOption.comp.includes("Transformer")) {
            let transformer;
            if (componentOption.name) {
              if (GraphicalTransformer2.findTransformer(componentOption.name).length > 0) {
                transformer = GraphicalTransformer2.findTransformer(componentOption.name)[0];
              }
            }
            if (!transformer)
              transformer = GraphicalTransformer2.initialize(componentOption.comp, {
                ...options.layers && options.layers.length == 1 ? options.layers[0] instanceof Layer2 ? { layer: options.layers[0] } : { layer: options.layers[0].layer } : {},
                ...componentOption,
                sharedVar: {
                  ...options.sharedVar || {},
                  ...componentOption.sharedVar || {}
                }
              });
            prevComponent = transformer;
            prevType = "Transformer";
          } else if (componentOption.comp.includes("Service")) {
            let service;
            if (componentOption.name) {
              if (Service2.findService(componentOption.name).length > 0) {
                service = Service2.findService(componentOption.name)[0];
              }
            }
            if (!service)
              service = Service2.initialize(componentOption.comp, {
                ...options.layers && options.layers.length == 1 ? options.layers[0] instanceof Layer2 ? { layer: options.layers[0] } : { layer: options.layers[0].layer } : {},
                ...componentOption,
                ...prevComponent ? prevType == "Transformer" ? {
                  transformers: prevComponent instanceof Array ? prevComponent : [prevComponent]
                } : {
                  services: prevComponent instanceof Array ? prevComponent : [prevComponent]
                } : {},
                sharedVar: {
                  ...options.sharedVar || {},
                  ...componentOption.sharedVar || {}
                }
              });
            if (componentOption.dimension && service.isInstanceOf("SelectionService")) {
              service = service.dimension(componentOption.dimension);
              if (componentOption.layers) {
                service._layerInstances = componentOption.layers.slice(0);
              }
              if (componentOption.sharedVar) {
                service.setSharedVars(componentOption.sharedVar);
              }
            }
            prevComponent = service;
            prevType = "Service";
          }
        }
        if (prevComponent) {
          if (prevType == "Transformer") {
            if (prevComponent instanceof Array) {
              insertNode._transformers.push(...prevComponent);
            } else {
              insertNode._transformers.push(prevComponent);
            }
          } else {
            if (insertNode instanceof Instrument) {
              if (prevComponent instanceof Array) {
                insertNode._serviceInstances.push(...prevComponent);
              } else {
                insertNode._serviceInstances.push(prevComponent);
              }
            } else {
              if (prevComponent instanceof Array) {
                insertNode._services.push(...prevComponent);
              } else {
                insertNode._services.push(prevComponent);
              }
            }
          }
        }
      }
    }
    return instrument;
  }
};

// dist/esm/index.js
init_command2();
init_instrument2();
init_interactor2();
init_layer2();
init_service2();
init_history();
init_transformer2();
var esm_default = {
  Command,
  Instrument: Instrument2,
  Interactor: Interactor2,
  Layer: Layer2,
  Service: Service2,
  createHistoryTrrack,
  GraphicalTransformer: GraphicalTransformer2,
  Interaction
};
export {
  Command,
  GraphicalTransformer2 as GraphicalTransformer,
  Instrument2 as Instrument,
  Interaction,
  Interactor2 as Interactor,
  Layer2 as Layer,
  Service2 as Service,
  createHistoryTrrack,
  esm_default as default
};
