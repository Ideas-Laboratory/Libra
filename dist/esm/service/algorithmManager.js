import InteractionService from "./service";
export default class AlgorithmManager extends InteractionService {
    constructor(baseName, options) {
        super(baseName, options);
        this._oldResult = null;
        this._result = null;
        this._nextTick = 0;
        Object.entries(options.params || {}).forEach((entry) => {
            this.setSharedVar(entry[0], entry[1]);
        });
    }
    setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._userOptions.algorithm && this._userOptions.params) {
            if (this._nextTick) {
                cancelAnimationFrame(this._nextTick);
            }
            this._nextTick = requestAnimationFrame(() => {
                this._oldResult = this._result;
                this._result = this._userOptions.algorithm({
                    ...this._userOptions.params,
                    ...this._sharedVar,
                });
                this._nextTick = 0;
                if (this._on.update) {
                    this._on.update.forEach((command) => {
                        var _a, _b, _c;
                        return command.execute({
                            self: this,
                            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                                ? this._layerInstances[0]
                                : null),
                            instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                            interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                        });
                    });
                }
                if (this._on[`update:${sharedName}`]) {
                    this._on[`update:${sharedName}`].forEach((command) => {
                        var _a, _b, _c;
                        return command.execute({
                            self: this,
                            layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                                ? this._layerInstances[0]
                                : null),
                            instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                            interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                        });
                    });
                }
                this.postUpdate();
            });
        }
        else {
            if (this._on.update) {
                this._on.update.forEach((command) => {
                    var _a, _b, _c;
                    return command.execute({
                        self: this,
                        layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                            ? this._layerInstances[0]
                            : null),
                        instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                        interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                    });
                });
            }
            if (this._on[`update:${sharedName}`]) {
                this._on[`update:${sharedName}`].forEach((command) => {
                    var _a, _b, _c;
                    return command.execute({
                        self: this,
                        layer: (_a = options === null || options === void 0 ? void 0 : options.layer) !== null && _a !== void 0 ? _a : (this._layerInstances.length == 1
                            ? this._layerInstances[0]
                            : null),
                        instrument: (_b = options === null || options === void 0 ? void 0 : options.instrument) !== null && _b !== void 0 ? _b : null,
                        interactor: (_c = options === null || options === void 0 ? void 0 : options.interactor) !== null && _c !== void 0 ? _c : null,
                    });
                });
            }
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("AlgorithmManager" === name ||
            this._baseName === name ||
            this._name === name);
    }
    get results() {
        return this._result;
    }
    get oldResults() {
        return this._oldResult;
    }
}
InteractionService.register("AlgorithmManager", {
    constructor: AlgorithmManager,
});
