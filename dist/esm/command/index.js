import * as CommandConstructor from "./command";
import CommandClass from "./command";
export default CommandClass;
export const register = CommandConstructor.register;
export const initialize = CommandConstructor.initialize;
export const findCommand = CommandConstructor.findCommand;
export const Command = CommandClass;
