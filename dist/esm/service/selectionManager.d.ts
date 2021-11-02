import InteractionService from "./service";
export default class SelectionManager extends InteractionService {
    _oldResult: any;
    _result: any;
    setSharedVar(sharedName: string, value: any, options?: any): void;
    isInstanceOf(name: string): boolean;
    get results(): any;
    get oldResults(): any;
}
