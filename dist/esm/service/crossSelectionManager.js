import SelectionManager from "./selectionManager";
import InteractionService from "./service";
export default class CrossSelectionManager extends SelectionManager {
    constructor() {
        super(...arguments);
        this._oldResult = [];
        this._result = [];
        this._nextTick = 0;
        this._mode = "intersection";
    }
    getSharedVar(sharedName, options) {
        if (options && options.keepAll) {
            return this._sm.map((sm) => sm.getSharedVar(sharedName, options));
        }
        return this._sm.map((sm) => sm.getSharedVar(sharedName, options))[0];
    }
    async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        if (sharedName == "$SelectionManager") {
            this._sm = value;
            return;
        }
        if (sharedName == "$mode") {
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
                let s;
                for (let sm of this._sm) {
                    const result = await sm.results;
                    if (!s) {
                        s = new Set(result);
                    }
                    else {
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
        }
        else {
            this.postUpdate();
        }
    }
    isInstanceOf(name) {
        return ("CrossSelectionManager" === name ||
            "SelectionManager" === name ||
            this._baseName === name ||
            this._name === name);
    }
}
InteractionService.register("CrossSelectionManager", {
    constructor: CrossSelectionManager,
});
