export declare const HistoryManager: {
    commit: (options: any) => Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
};
