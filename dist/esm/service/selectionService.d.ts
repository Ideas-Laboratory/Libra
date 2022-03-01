import InteractionService from "./service";
export default class SelectionService extends InteractionService {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    get results(): any;
    get oldResults(): any;
}
