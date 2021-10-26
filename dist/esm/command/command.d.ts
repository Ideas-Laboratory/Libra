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
interface CommandConstructor {
    new (baseName: string, options: CommandInitOption): Command;
    register(baseName: string, options: CommandInitTemplate): void;
    unregister(baseName: string): boolean;
    initialize(baseName: string, options: CommandInitOption): Command;
    findService(baseNameOrRealName: string): Command[];
}
declare type CommandInitTemplate = CommandInitOption & {
    constructor?: CommandConstructor;
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
}
export declare function register(baseName: string, options: CommandInitTemplate): void;
export declare function unregister(baseName: string): boolean;
export declare function initialize(baseName: string, options: CommandInitOption): Command;
export declare function findCommand(baseNameOrRealName: string): Command[];
export {};
