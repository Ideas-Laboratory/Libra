declare const _default: {
    Command: typeof import("./command").default;
    Instrument: typeof import("./instrument").default;
    Interactor: typeof import("./interactor").default;
    Layer: typeof import("./layer").default;
    InteractionService: typeof import("./service").default;
    HistoryManager: {
        commit(): void;
        undo(): Promise<void>;
        redo(): Promise<void>;
    };
};
export default _default;
export { Command } from "./command";
export { Instrument } from "./instrument";
export { Interactor } from "./interactor";
export { Layer } from "./layer";
export { InteractionService } from "./service";
export { HistoryManager } from "./history";
