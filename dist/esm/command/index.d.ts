import * as CommandConstructor from "./command";
import CommandClass from "./command";
export default CommandClass;
export declare const register: typeof CommandConstructor.register;
export declare const initialize: typeof CommandConstructor.initialize;
export declare const findCommand: typeof CommandConstructor.findCommand;
export declare const Command: typeof CommandConstructor.default;
export declare type Command = CommandClass;
