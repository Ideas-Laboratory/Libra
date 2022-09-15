import Service from "./service";
import * as helpers from "../helpers";
import * as d3 from "d3";

export default class AnalysisService extends Service {
  _oldResult: any = null;
  _result: any = null;
  _nextTick: number = 0;

  constructor(baseName: string, options: any) {
    super(baseName, options);
    Object.entries(options.params || {}).forEach((entry) => {
      this.setSharedVar(entry[0], entry[1]);
    });
  }

  async setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (this._userOptions.algorithm && this._userOptions.params) {
      if (this._nextTick) {
        return;
      }
      this._nextTick = requestAnimationFrame(async () => {
        this._oldResult = this._result;
        try {
          this._result = await this._userOptions.algorithm({
            ...this._userOptions.params,
            ...this._sharedVar,
          });
          this._transformers.forEach((transformer) => {
            transformer.setSharedVars({
              result: this._result,
            });
          });
        } catch (e) {
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
    } else {
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

  isInstanceOf(name: string): boolean {
    return (
      "AnalysisService" === name ||
      this._baseName === name ||
      this._name === name
    );
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

(Service as any).AnalysisService = AnalysisService;

Service.register("AnalysisService", {
  constructor: AnalysisService,
});
