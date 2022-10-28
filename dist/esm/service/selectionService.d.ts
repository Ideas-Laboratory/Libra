import Service from "./service";
export default class SelectionService extends Service {
    _currentDimension: any[];
    constructor(baseName: string, options: any);
    setSharedVar(sharedName: string, value: any, options?: any): Promise<void>;
    isInstanceOf(name: string): boolean;
    /** Cross filter */
    dimension(): void;
    filter(): void;
}
