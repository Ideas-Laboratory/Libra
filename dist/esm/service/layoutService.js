import InteractionService from "./service";
export default class LayoutService extends InteractionService {
    constructor(baseName, options) {
        super(baseName, options);
        this._oldResult = null;
        this._result = null;
        this._nextTick = 0;
        Object.entries(options.params || {}).forEach((entry) => {
            this.setSharedVar(entry[0], entry[1]);
        });
    }
    async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._userOptions.layout) {
            if (this._nextTick) {
                return;
            }
            this._nextTick = requestAnimationFrame(async () => {
                this._oldResult = this._result;
                try {
                    this._result = await this._userOptions.layout({
                        ...(this._userOptions.params ?? {}),
                        ...this._sharedVar,
                    });
                }
                catch (e) {
                    console.error(e);
                    this._result = undefined;
                }
                this._nextTick = 0;
                this.postUpdate();
            });
        }
        else {
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("AlgorithmService" === name ||
            this._baseName === name ||
            this._name === name);
    }
    get results() {
        if (this._nextTick) {
            return new Promise((res) => {
                window.requestAnimationFrame(() => {
                    res(this._result);
                });
            });
        }
        return this._result;
    }
    get oldResults() {
        if (this._nextTick) {
            return new Promise((res) => {
                window.requestAnimationFrame(() => {
                    res(this._oldResult);
                });
            });
        }
        return this._oldResult;
    }
}
InteractionService.register("LayoutService", {
    constructor: LayoutService,
});
