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
    async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (this._userOptions.algorithm && this._userOptions.params) {
            if (this._nextTick) {
                return;
            }
            this._nextTick = requestAnimationFrame(async () => {
                this._oldResult = this._result;
                this._result = await this._userOptions.algorithm({
                    ...this._userOptions.params,
                    ...this._sharedVar,
                });
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
        return ("AlgorithmManager" === name ||
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
InteractionService.register("AlgorithmManager", {
    constructor: AlgorithmManager,
});
