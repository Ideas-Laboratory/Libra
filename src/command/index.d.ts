import * as helpers from "../helpers";

type CommandInitOption = {
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

type CommandInitTemplate = CommandInitOption & {
  constructor?: CommandConstructor;
};

export declare class Command {
  constructor(baseName: string, options: CommandInitOption);

  undo(): void;
  redo(): void;
  execute<T>(options: helpers.CommonHandlerInput<T>): void;
  isInstanceOf(name: string): boolean;
}

export default interface CommandConstructor {
  new (baseName: string, options: CommandInitOption): Command;

  register(baseName: string, options: CommandInitTemplate): void;
  unregister(baseName: string): boolean;
  initialize(baseName: string, options: CommandInitOption): Command;
  findCommand(baseNameOrRealName: string): Command[];
}

export function register(baseName: string, options: CommandInitTemplate): void;
export function unregister(baseName: string): boolean;
export function initialize(
  baseName: string,
  options: CommandInitOption
): Command;
export function findCommand(baseNameOrRealName: string): Command[];
