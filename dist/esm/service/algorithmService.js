import Service from "./service";
export default class AnalysisService extends Service {
    constructor(baseName, options) {
        super(baseName, {
            ...options,
            resultAlias: options.resultAlias ?? "result",
        });
        this._oldResult = null;
        this._result = null;
        this._nextTick = 0;
        this._computing = null;
    }
    isInstanceOf(name) {
        return ("AnalysisService" === name ||
            this._baseName === name ||
            this._name === name);
    }
}
Service.AnalysisService = AnalysisService;
Service.register("AnalysisService", {
    constructor: AnalysisService,
});
