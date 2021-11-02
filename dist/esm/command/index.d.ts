import * as CommandConstructor from "./command";
import CommandClass from "./command";
export default CommandClass;
export declare const register: typeof CommandConstructor.default.register;
export declare const initialize: typeof CommandConstructor.default.initialize;
export declare const findCommand: typeof CommandConstructor.default.findCommand;
export declare const Command: typeof CommandConstructor.default;
export declare type Command = CommandClass;
