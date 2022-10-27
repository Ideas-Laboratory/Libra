import Service from "./service";
export default class LayoutService extends Service {
    constructor(baseName, options) {
        super(baseName, {
            ...options,
            resultAlias: options.resultAlias ?? "layoutResult",
        });
        this._oldResult = null;
        this._result = null;
        this._nextTick = 0;
        this._computing = null;
    }
    isInstanceOf(name) {
        return ("LayoutService" === name || this._baseName === name || this._name === name);
    }
}
Service.LayoutService = LayoutService;
Service.register("LayoutService", {
    constructor: LayoutService,
});
