import { instanceServices } from "../service";
import { instanceTransformers } from "../transformer";
import { instanceCommands } from "../command";
import { instanceInstruments } from "../instrument";
import { instanceInteractors } from "../interactor";
import { deepClone } from "../helpers";
const historyInstanceMapping = new Map();
export function createHistoryTrrack() {
    let historyTrace = null;
    let currentHistoryNode = null;
    let commitLock = false;
    const HistoryManager = {
        traceStructure: (node = historyTrace) => {
            return {
                recordList: [...node.record.keys()],
                children: node.children.map((node) => HistoryManager.traceStructure(node)),
            };
        },
        commit: async () => {
            if (commitLock) {
                return;
            }
            const record = new Map();
            [
                { list: instanceInstruments, fields: ["_sharedVar"] },
                { list: instanceServices, fields: ["_sharedVar"] },
                { list: instanceTransformers, fields: ["_sharedVar"] },
                { list: instanceInteractors, fields: ["_state", "_modalities"] },
            ].forEach(({ list, fields, }) => {
                list
                    .filter((component) => tryGetHistoryTrrackInstance(component) === HistoryManager)
                    .forEach((component) => {
                    record.set(component, Object.fromEntries(fields.map((field) => [field, deepClone(component[field])])));
                });
            });
            const newHistoryNode = {
                record,
                prev: currentHistoryNode,
                next: null,
                children: [],
            };
            if (currentHistoryNode) {
                currentHistoryNode.children.push(newHistoryNode);
            }
            currentHistoryNode = newHistoryNode;
        },
        async undo() {
            if (currentHistoryNode && currentHistoryNode.prev) {
                currentHistoryNode.prev.next = currentHistoryNode;
                const record = currentHistoryNode.prev.record;
                commitLock = true;
                for (let [component, records] of record.entries()) {
                    Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                    if ("_sharedVar" in records &&
                        Object.keys(records._sharedVar).length > 0) {
                        // Invoke update manually
                        component.setSharedVar(...Object.entries(records._sharedVar)[0]);
                    }
                }
                commitLock = false;
                currentHistoryNode = currentHistoryNode.prev;
            }
        },
        async redo() {
            if (currentHistoryNode && currentHistoryNode.next) {
                const record = currentHistoryNode.next.record;
                commitLock = true;
                for (let [component, records] of record.entries()) {
                    Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                    if ("_sharedVar" in records &&
                        Object.keys(records._sharedVar).length > 0) {
                        // Invoke update manually
                        component.setSharedVar(...Object.entries(records._sharedVar)[0]);
                    }
                }
                commitLock = false;
                currentHistoryNode = currentHistoryNode.next;
            }
        },
    };
    [
        instanceServices,
        instanceTransformers,
        instanceCommands,
        instanceInstruments,
        instanceInteractors,
    ]
        .flatMap((x) => x)
        .forEach((component) => {
        if (!historyInstanceMapping.has(component)) {
            historyInstanceMapping.set(component, HistoryManager);
        }
    });
    HistoryManager.commit();
    historyTrace = currentHistoryNode;
    return HistoryManager;
}
export function tryGetHistoryTrrackInstance(component) {
    const directHM = historyInstanceMapping.get(component);
    if (directHM) {
        return directHM;
    }
    // Otherwise, return a mimic HM that does nothing
    return {
        traceStructure() {
            return null;
        },
        async commit() { },
        async undo() { },
        async redo() { },
    };
}
export function tryRegisterDynamicInstance(parentComponent, newComponent) {
    const HM = historyInstanceMapping.get(parentComponent);
    if (HM) {
        historyInstanceMapping.set(newComponent, HM);
    }
}
