import InteractionService from "./service";
import { GraphicalTransformer } from "../transformer";
export default class SelectionService extends InteractionService {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    _transformers: GraphicalTransformer[];
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    get results(): any;
    get oldResults(): any;
}
