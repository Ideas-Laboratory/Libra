import Service from "./service";
import { Layer } from "../layer";
export default class SelectionService extends Service {
    _currentDimension: any[];
    _selectionMapping: Map<string, any[]>;
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    _evaluate(layer: Layer<any>): void;
    isInstanceOf(name: string): boolean;
    /** Cross filter */
    dimension(dimension: string | string[], formatter?: ((value: any) => any) | ((value: any) => any)[]): this;
    filter(extent: any[] | any[][], options?: any): this;
    get extents(): {
        [k: string]: any[];
    };
}
