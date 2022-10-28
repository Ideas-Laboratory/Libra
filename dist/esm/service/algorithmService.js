import Service from "./service";
export default class AnalysisService extends Service {
    constructor(baseName, options) {
        super(baseName, {
            ...options,
            resultAlias: options.resultAlias ?? "result",
        });
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
