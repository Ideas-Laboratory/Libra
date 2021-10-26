import * as helpers from "../helpers";

type CommandInitOption = {
  name?: string;
  feedbacks?: (<T>(options: helpers.CommonHandlerInput<T>) => void)[];
  undo?: () => void;
  redo?: () => void;
  execute: <T>(options: helpers.CommonHandlerInput<T>) => void;
  preInitialize?: (command: Command) => void;
  postInitialize?: (command: Command) => void;
  preExecute?: (command: Command) => void;
  postExecute?: (command: Command) => void;
  [param: string]: any;
};

interface CommandConstructor {
  new (baseName: string, options: CommandInitOption): Command;

  register(baseName: string, options: CommandInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: CommandInitOption): Command;
  findService(baseNameOrRealName: string): Command[];
}

type CommandInitTemplate = CommandInitOption & {
  constructor?: CommandConstructor;
};

const registeredCommands: { [name: string]: CommandInitTemplate } = {};
const instanceCommands: Command[] = [];

export default class Command {
  _baseName: string;
  _name: string;
  _userOptions: CommandInitOption;
  _feedbacks: (<T>(options: helpers.CommonHandlerInput<T>) => void)[];
  _undo?: () => void;
  _redo?: () => void;
  _execute: <T>(options: helpers.CommonHandlerInput<T>) => void;
  _preInitialize?: (command: Command) => void;
  _postInitialize?: (command: Command) => void;
  _preExecute?: (command: Command) => void;
  _postExecute?: (command: Command) => void;

  constructor(baseName: string, options: CommandInitOption) {
    options.preInitialize && options.preInitialize.call(this, this);
    this._baseName = baseName;
    this._userOptions = options;
    this._name = options.name ?? baseName;
    this._feedbacks = options.feedback ?? [];
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

  execute<T>(options: helpers.CommonHandlerInput<T>) {
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

  isInstanceOf(name: string): boolean {
    return this._baseName === name || this._name === name;
  }
}

export function register(baseName: string, options: CommandInitTemplate): void {
  registeredCommands[baseName] = options;
}
export function unregister(baseName: string): boolean {
  delete registeredCommands[baseName];
  return true;
}
export function initialize(
  baseName: string,
  options: CommandInitOption
): Command {
  const mergedOptions = Object.assign(
    {},
    registeredCommands[baseName] ?? { constructor: Command },
    options
  );
  const service = new mergedOptions.constructor(baseName, mergedOptions);
  return service;
}
export function findCommand(baseNameOrRealName: string): Command[] {
  return instanceCommands.filter((command) =>
    command.isInstanceOf(baseNameOrRealName)
  );
}

(Command as any).register = register;
(Command as any).initialize = initialize;
(Command as any).findCommand = findCommand;
