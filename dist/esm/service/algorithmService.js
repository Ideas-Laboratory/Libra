import Service from "./service";
export default class AnalysisService extends Service {
    constructor(baseName, options) {
        super(baseName, options);
        this._oldResult = null;
        this._result = null;
        this._nextTick = 0;
    }
    async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._userOptions.evaluate && this._userOptions.params) {
            if (this._nextTick) {
                return;
            }
            this._nextTick = requestAnimationFrame(async () => {
                this._oldResult = this._result;
                try {
                    this._result = await this._userOptions.evaluate({
                        self: this,
                        ...this._userOptions.params,
                        ...this._sharedVar,
                    });
                    this._services.forEach((service) => {
                        service.setSharedVar("result", this._result);
                    });
                    this._transformers.forEach((transformer) => {
                        transformer.setSharedVars({
                            result: this._result,
                        });
                    });
                }
                catch (e) {
                    console.error(e);
                    this._result = undefined;
                }
                this._nextTick = 0;
                // if (this._on.update) {
                //   for (let command of this._on.update) {
                //     if (command instanceof Function) {
                //       await command({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     } else {
                //       await command.execute({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     }
                //   }
                // }
                // if (this._on[`update:${sharedName}`]) {
                //   for (let command of this._on[`update:${sharedName}`]) {
                //     if (command instanceof Function) {
                //       await command({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     } else {
                //       await command.execute({
                //         self: this,
                //         layer:
                //           options?.layer ??
                //           (this._layerInstances.length == 1
                //             ? this._layerInstances[0]
                //             : null),
                //         instrument: options?.instrument ?? null,
                //         interactor: options?.interactor ?? null,
                //       });
                //     }
                //   }
                // }
                this.postUpdate();
            });
        }
        else {
            // if (this._on.update) {
            //   for (let command of this._on.update) {
            //     if (command instanceof Function) {
            //       await command({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     } else {
            //       await command.execute({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     }
            //   }
            // }
            // if (this._on[`update:${sharedName}`]) {
            //   for (let command of this._on[`update:${sharedName}`]) {
            //     if (command instanceof Function) {
            //       await command({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     } else {
            //       await command.execute({
            //         self: this,
            //         layer:
            //           options?.layer ??
            //           (this._layerInstances.length == 1
            //             ? this._layerInstances[0]
            //             : null),
            //         instrument: options?.instrument ?? null,
            //         interactor: options?.interactor ?? null,
            //       });
            //     }
            //   }
            // }
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("AnalysisService" === name ||
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
Service.AnalysisService = AnalysisService;
Service.register("AnalysisService", {
    constructor: AnalysisService,
});
