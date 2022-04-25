import * as helpers from "../helpers";
import { GraphicalTransformer } from "../transformer";
const registeredServices = {};
export const instanceServices = [];
export default class InteractionService {
    constructor(baseName, options) {
        this._linkCache = {};
        this._transformers = [];
        options.preInitialize && options.preInitialize.call(this, this);
        this._baseName = baseName;
        this._userOptions = options;
        this._name = options.name ?? baseName;
        // this._on = options.on ?? {};
        this._sharedVar = {};
        this._layerInstances = [];
        this._preInitialize = options.preInitialize ?? null;
        this._postInitialize = options.postInitialize ?? null;
        this._preUpdate = options.preUpdate ?? null;
        this._postUpdate = options.postUpdate ?? null;
        this._preAttach = options.preAttach ?? null;
        this._postUse = options.postUse ?? null;
        Object.entries(options.sharedVar || {}).forEach((entry) => {
            this.setSharedVar(entry[0], entry[1]);
        });
        if (options.layer) {
            this._layerInstances.push(options.layer);
        }
        instanceServices.push(this);
        options.postInitialize && options.postInitialize.call(this, this);
    }
    // on(action: string, command: Command): void {
    //   if (!this._on[action]) {
    //     this._on[action] = [];
    //   }
    //   this._on[action].push(command);
    // }
    getSharedVar(sharedName, options) {
        if (options &&
            options.layer &&
            this._layerInstances.length &&
            !this._layerInstances.includes(options.layer)) {
            return undefined;
        }
        if (!(sharedName in this._sharedVar) &&
            options &&
            "defaultValue" in options) {
            this.setSharedVar(sharedName, options.defaultValue, options);
        }
        return this._sharedVar[sharedName];
    }
    async setSharedVar(sharedName, value, options) {
        this.preUpdate();
        this._sharedVar[sharedName] = value;
        // if (this._on.update) {
        //   for (let command of this._on.update) {
        //     if (command instanceof Function) {
        //       await command({
        //         self: this,
        //         layer: options?.layer ?? null,
        //         instrument: options?.instrument ?? null,
        //         interactor: options?.interactor ?? null,
        //       });
        //     } else {
        //       await command.execute({
        //         self: this,
        //         layer: options?.layer ?? null,
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
        //         layer: options?.layer ?? null,
        //         instrument: options?.instrument ?? null,
        //         interactor: options?.interactor ?? null,
        //       });
        //     } else {
        //       await command.execute({
        //         self: this,
        //         layer: options?.layer ?? null,
        //         instrument: options?.instrument ?? null,
        //         interactor: options?.interactor ?? null,
        //       });
        //     }
        //   }
        // }
        this.postUpdate();
    }
    // watchSharedVar(sharedName: string, handler: Command) {
    //   this.on(`update:${sharedName}`, handler);
    // }
    preUpdate() {
        this._preUpdate && this._preUpdate.call(this, this);
    }
    postUpdate() {
        const linkProps = this.getSharedVar("linkProps") || Object.keys(this._sharedVar);
        if (this._sharedVar.linking) {
            for (let prop of linkProps) {
                if (this._linkCache[prop] === this._sharedVar[prop])
                    continue;
                this._sharedVar.linking.setSharedVar(prop, this._sharedVar[prop]);
            }
        }
        this._postUpdate && this._postUpdate.call(this, this);
    }
    preAttach(instrument) {
        this._preAttach && this._preAttach.call(this, this, instrument);
    }
    postUse(instrument) {
        this._postUse && this._postUse.call(this, this, instrument);
    }
    isInstanceOf(name) {
        return this._baseName === name || this._name === name;
    }
    get transformers() {
        return helpers.makeFindableList(this._transformers.slice(0), GraphicalTransformer, (e) => this._transformers.push(e));
    }
    static register(baseName, options) {
        registeredServices[baseName] = options;
    }
    static unregister(baseName) {
        delete registeredServices[baseName];
        return true;
    }
    static initialize(baseName, options) {
        const mergedOptions = Object.assign({}, registeredServices[baseName] ?? { constructor: InteractionService }, options ?? {}, {
            // needs to deep merge object
            on: Object.assign({}, (registeredServices[baseName] ?? {}).on ?? {}, options?.on ?? {}),
            sharedVar: Object.assign({}, (registeredServices[baseName] ?? {}).sharedVar ?? {}, options?.sharedVar ?? {}),
        });
        const service = new mergedOptions.constructor(baseName, mergedOptions);
        return service;
    }
    static findService(baseNameOrRealName) {
        return instanceServices.filter((service) => service.isInstanceOf(baseNameOrRealName));
    }
}
export const register = InteractionService.register;
export const unregister = InteractionService.unregister;
export const initialize = InteractionService.initialize;
export const findService = InteractionService.findService;
