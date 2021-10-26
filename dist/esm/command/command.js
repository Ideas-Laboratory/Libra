const registeredCommands = {};
const instanceCommands = [];
export default class Command {
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
}
export function register(baseName, options) {
    registeredCommands[baseName] = options;
}
export function unregister(baseName) {
    delete registeredCommands[baseName];
    return true;
}
export function initialize(baseName, options) {
    var _a;
    const mergedOptions = Object.assign({}, (_a = registeredCommands[baseName]) !== null && _a !== void 0 ? _a : { constructor: Command }, options);
    const service = new mergedOptions.constructor(baseName, mergedOptions);
    return service;
}
export function findCommand(baseNameOrRealName) {
    return instanceCommands.filter((command) => command.isInstanceOf(baseNameOrRealName));
}
Command.register = register;
Command.initialize = initialize;
Command.findCommand = findCommand;
