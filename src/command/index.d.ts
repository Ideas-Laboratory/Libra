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
}

export default interface CommandConstructor {
  new (baseName: string, options: CommandInitOption): Command;

  register(baseName: string, options: CommandInitTemplate): void;
  initialize(baseName: string, options: CommandInitOption): Command;
  findCommand(baseNameOrRealName: string): Command[];
}
