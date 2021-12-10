import InteractionService from "./service";
import * as helpers from "../helpers";
import * as d3 from "d3";

export default class AlgorithmManager extends InteractionService {
  _oldResult: any = null;
  _result: any = null;
  _nextTick: number = 0;

  constructor(baseName: string, options: any) {
    super(baseName, options);
    Object.entries(options.params || {}).forEach((entry) => {
      this.setSharedVar(entry[0], entry[1]);
    });
  }

  setSharedVar(sharedName: string, value: any, options?: any) {
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
          this._on.update.forEach((command) =>
            command.execute({
              self: this,
              layer:
                options?.layer ??
                (this._layerInstances.length == 1
                  ? this._layerInstances[0]
                  : null),
              instrument: options?.instrument ?? null,
              interactor: options?.interactor ?? null,
            })
          );
        }
        if (this._on[`update:${sharedName}`]) {
          this._on[`update:${sharedName}`].forEach((command) =>
            command.execute({
              self: this,
              layer:
                options?.layer ??
                (this._layerInstances.length == 1
                  ? this._layerInstances[0]
                  : null),
              instrument: options?.instrument ?? null,
              interactor: options?.interactor ?? null,
            })
          );
        }

        this.postUpdate();
      });
    } else {
      if (this._on.update) {
        this._on.update.forEach((command) =>
          command.execute({
            self: this,
            layer:
              options?.layer ??
              (this._layerInstances.length == 1
                ? this._layerInstances[0]
                : null),
            instrument: options?.instrument ?? null,
            interactor: options?.interactor ?? null,
          })
        );
      }
      if (this._on[`update:${sharedName}`]) {
        this._on[`update:${sharedName}`].forEach((command) =>
          command.execute({
            self: this,
            layer:
              options?.layer ??
              (this._layerInstances.length == 1
                ? this._layerInstances[0]
                : null),
            instrument: options?.instrument ?? null,
            interactor: options?.interactor ?? null,
          })
        );
      }

      this.postUpdate();
    }
  }

  isInstanceOf(name: string): boolean {
    return (
      "AlgorithmManager" === name ||
      this._baseName === name ||
      this._name === name
    );
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
