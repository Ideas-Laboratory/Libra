import * as helpers from "../helpers";
declare type CommandInitOption = {
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
declare type CommandInitTemplate = CommandInitOption & {
    [param: string]: any;
    constructor?: typeof Command;
};
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
    constructor(baseName: string, options: CommandInitOption);
    undo(): void;
    redo(): void;
    execute<T>(options: helpers.CommonHandlerInput<T>): void;
    preExecute(): void;
    postExecute(): void;
    isInstanceOf(name: string): boolean;
    static register(baseName: string, options: CommandInitTemplate): void;
    static unregister(baseName: string): boolean;
    static initialize(baseName: string, options: CommandInitOption): Command;
    static findCommand(baseNameOrRealName: string): Command[];
}
export declare const register: typeof Command.register;
export declare const unregister: typeof Command.unregister;
export declare const initialize: typeof Command.initialize;
export declare const findCommand: typeof Command.findCommand;
export {};
