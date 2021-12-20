const registeredCommands = {};
const instanceCommands = [];
export default class Command {
    constructor(baseName, options) {
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? baseName;
        this._feedbacks = options.feedbacks ?? [];
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
    static register(baseName, options) {
        registeredCommands[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredCommands[baseName];
        return true;
    }
    static initialize(baseName, options) {
        const mergedOptions = Object.assign({}, registeredCommands[baseName] ?? { constructor: Command }, options ?? {});
        const service = new mergedOptions.constructor(baseName, mergedOptions);
        return service;
    }
    static findCommand(baseNameOrRealName) {
        return instanceCommands.filter((command) => command.isInstanceOf(baseNameOrRealName));
    }
}
export const register = Command.register;
export const unregister = Command.unregister;
export const initialize = Command.initialize;
export const findCommand = Command.findCommand;
