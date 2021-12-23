import InteractionService from "./service";
export default class AlgorithmManager extends InteractionService {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    get results(): any;
    get oldResults(): any;
}
