const registeredQuerys = {};

export default class Query {
  _result = [];
  _layer = null;
  _dirty = false;

  constructor(name = "Query") {
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

Query.register = function register(name, optionOrQuery) {
  let option;
  if (optionOrQuery instanceof Query) {
    option = optionOrQuery._toTemplate();
    option.constructor = optionOrQuery.constructor;
  } else {
    option = optionOrQuery;
    option.constructor = option.hasOwnProperty("constructor")
      ? option.constructor
      : Query;
  }
  registeredQuerys[name] = option;
  return true;
};

Query.unregister = function unregister(name) {
  delete registeredQuerys[name];
  return true;
};

Query.initialize = function initialize(name, ...params) {
  let option;
  if ((option = registeredQuerys[name])) {
    const query = new option.constructor(
      name,
      ...(option.extraParams || []),
      ...params
    );
    return query;
  }
  return null;
};

Query.register("Query", { constructor: Query });
