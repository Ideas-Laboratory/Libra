import InteractionService from "./service";
import { GraphicalTransformer } from "../transformer";
export default class SelectionService extends InteractionService {
    _oldResult: any;
    _result: any;
    _transformers: GraphicalTransformer[];
    _currentDimension: any[];
    _: any;
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    /** Cross filter */
    dimension(): void;
    filter(): void;
    get results(): any;
    get oldResults(): any;
}
