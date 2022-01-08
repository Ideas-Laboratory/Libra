import SelectionManager from "./selectionManager";
export default class CrossSelectionManager extends SelectionManager {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    _sm: SelectionManager[];
    _mode: "intersection" | "union";
    getSharedVar(sharedName: any, options?: any): any;
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
}
