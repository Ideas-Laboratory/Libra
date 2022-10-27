import Service from "./service";
export default class AnalysisService extends Service {
    _oldResult: any;
    _result: any;
    _nextTick: number;
    _computing: Promise<any>;
    constructor(baseName: string, options: any);
    isInstanceOf(name: string): boolean;
}
