import { Layer } from "..";
import SelectionService from "./selectionService";
import Service from "./service";

export default class CrossSelectionService extends SelectionService {
  _oldResult: any = [];
  _result: any = [];
  _nextTick: number = 0;
  _sm: SelectionService[];
  _mode: "intersection" | "union" = "intersection";

  getSharedVar(sharedName, options?: any) {
    if (options && options.keepAll) {
      return this._sm.map((sm) => sm.getSharedVar(sharedName, options));
    }
    if (options && options.layer) {
      return this._sm
        .map((sm) => sm.getSharedVar(sharedName, options))
        .find((x) => x !== undefined);
    }
    return this._sm.map((sm) => sm.getSharedVar(sharedName, options))[0];
  }

  async setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (sharedName == "$SelectionService") {
      this._sm = value;
      return;
    }
    if (sharedName == "$Mode") {
      this._mode = value;
      return;
    }
    this._sm.forEach((sm) => sm.setSharedVar(sharedName, value, options));
    if (options?.layer || this._layerInstances.length == 1) {
      if (this._nextTick) {
        return;
      }
      this._nextTick = requestAnimationFrame(async () => {
        this._oldResult = this._result;
        let s: Set<any>;
        for (let sm of this._sm) {
          const result = await sm.results;
          if (!s) {
            s = new Set(result);
          } else {
            const tempS = new Set(result);
            switch (this._mode) {
              case "intersection":
                tempS.forEach((r) => {
                  if (!s.has(r)) {
                    tempS.delete(r);
                  }
                });
                break;
              case "union":
                s.forEach((r) => {
                  tempS.add(r);
                });
                break;
              default:
                break;
            }
            s = tempS;
          }
        }
        this._result = [...s];

        this._nextTick = 0;

        this.postUpdate();
      });
    } else {
      this.postUpdate();
    }
  }

  isInstanceOf(name: string): boolean {
    return (
      "CrossSelectionService" === name ||
      "SelectionService" === name ||
      this._baseName === name ||
      this._name === name
    );
  }

  async getResultOnLayer(layer: Layer<any>): Promise<any> {
    Object.entries(this._sharedVar)
      .filter(([key]) => !key.startsWith("$"))
      .forEach(([key, value]) => {
        this._sm.forEach((sm) => sm.setSharedVar(key, value, { layer }));
      });
    return await (async () => {
      this._oldResult = this._result;
      let s: Set<any>;
      for (let sm of this._sm) {
        const result = await sm.results;
        if (!s) {
          s = new Set(result);
        } else {
          const tempS = new Set(result);
          switch (this._mode) {
            case "intersection":
              tempS.forEach((r) => {
                if (!s.has(r)) {
                  tempS.delete(r);
                }
              });
              break;
            case "union":
              s.forEach((r) => {
                tempS.add(r);
              });
              break;
            default:
              break;
          }
          s = tempS;
        }
      }
      this._result = [...s];

      this._nextTick = 0;
    })();
  }
}

Service.register("CrossSelectionService", {
  constructor: CrossSelectionService,
});
