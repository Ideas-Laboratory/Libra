import { Service } from "../service";
import { GraphicalTransformer } from "../transformer";
import { Command } from "../command";
import { Instrument } from "../instrument";
import { Interactor } from "../interactor";
export declare type AllRecordingComponents = Service | GraphicalTransformer | Command | Instrument | Interactor;
declare type HistoryNode = {
    record: Map<AllRecordingComponents, {
        [key: string]: any;
    }>;
    prev?: HistoryNode;
    next?: HistoryNode;
    children: HistoryNode[];
};
declare type HistoryTrrackNodeDescription = {
    recordList: AllRecordingComponents[];
    children: HistoryTrrackNodeDescription[];
    current: boolean;
};
declare type HistoryManagerTrrackInstance = {
    traceStructure: (node?: HistoryNode) => HistoryTrrackNodeDescription;
    commit(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
};
export declare function createHistoryTrrack(): {
    traceStructure: (node?: HistoryNode) => HistoryTrrackNodeDescription;
    commit: () => Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    jump(path?: number[]): Promise<void>;
};
export declare function tryGetHistoryTrrackInstance(component: AllRecordingComponents): HistoryManagerTrrackInstance;
export declare function tryRegisterDynamicInstance(parentComponent: AllRecordingComponents, newComponent: AllRecordingComponents): void;
export {};
