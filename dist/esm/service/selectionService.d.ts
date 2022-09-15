import Service from "./service";
import { GraphicalTransformer } from "../transformer";
export default class SelectionService extends Service {
    _oldResult: any;
    _result: any;
    _transformers: GraphicalTransformer[];
    _currentDimension: any[];
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    /** Cross filter */
    dimension(): void;
    filter(): void;
    get results(): any;
    get oldResults(): any;
}
