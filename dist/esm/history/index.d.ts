export declare const HistoryManager: {
    commit(): void;
    undo(): Promise<void>;
    redo(): Promise<void>;
};
