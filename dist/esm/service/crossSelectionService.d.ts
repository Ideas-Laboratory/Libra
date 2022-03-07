import { Layer } from "..";
import SelectionService from "./selectionService";
export default class CrossSelectionService extends SelectionService {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    _sm: SelectionService[];
    _mode: "intersection" | "union";
    getSharedVar(sharedName: any, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    getResultOnLayer(layer: Layer<any>): Promise<any>;
}
