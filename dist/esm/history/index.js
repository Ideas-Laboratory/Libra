import { instanceServices } from "../service";
import { instanceTransformers } from "../transformer";
import { instanceCommands } from "../command";
import { instanceInstruments } from "../instrument";
import { instanceInteractors } from "../interactor";
import { deepClone } from "../helpers";
const historyInstanceMapping = new Map();
export async function createHistoryTrrack() {
    let historyTrace = null;
    let currentHistoryNode = null;
    let commitLock = false;
    const HistoryManager = {
        traceStructure: (node = historyTrace) => {
            return {
                recordList: [...node.record.keys()],
                children: node.children.map((node) => HistoryManager.traceStructure(node)),
                current: node === currentHistoryNode,
            };
        },
        commit: async (commandName) => {
            if (commitLock) {
                return;
            }
            const record = new Map();
            for (let { component, fields } of [
                { list: instanceInteractors, fields: ["_state", "_modalities"] },
                { list: instanceInstruments, fields: ["_sharedVar"] },
                { list: instanceServices, fields: ["_sharedVar", "_result", "_oldResult"] },
                { list: instanceTransformers, fields: ["_sharedVar"] },
            ].flatMap(({ list, fields, }) => list
                .filter((component) => tryGetHistoryTrrackInstance(component) === HistoryManager)
                .map((component) => ({ component, fields })))) {
                await component.results; // Ensure all works have been done
                record.set(component, Object.fromEntries(fields.map((field) => [field, deepClone(component[field])])));
            }
            // If push not default command, then override back.
            if (commandName && commandName != "Log") {
                const checkParent = (historyNode) => {
                    if (historyNode.name === 'Log' && historyNode.prev && historyNode.prev.children.length == 1) {
                        historyNode.prev.children = [];
                        return checkParent(historyNode.prev);
                    }
                    if (historyNode.name === 'Log' && historyNode.prev) {
                        historyNode.prev.children.splice(historyNode.prev.children.indexOf(historyNode), 1);
                        return checkParent(historyNode.prev);
                    }
                    return historyNode;
                };
                currentHistoryNode = checkParent(currentHistoryNode);
            }
            const newHistoryNode = {
                name: commandName,
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
                // try {
                for (let [component, records] of record.entries()) {
                    let layerHold = null;
                    if ("_sharedVar" in component && component._sharedVar.layer) {
                        layerHold = component._sharedVar.layer;
                    }
                    Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                    if (layerHold &&
                        "_sharedVar" in component &&
                        !component._sharedVar.layer) {
                        component._sharedVar.layer = layerHold;
                    }
                    if ("_sharedVar" in records) {
                        // Invoke update manually
                        await component.setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                    }
                }
                currentHistoryNode = currentHistoryNode.prev;
                // } catch (e) {
                //   console.error("Fail to undo history!", e);
                //   // Rollback
                //   const record = currentHistoryNode.record;
                //   for (let [component, records] of record.entries()) {
                //     Object.entries(records).forEach(
                //       ([k, v]) => (component[k] = deepClone(v))
                //     );
                //     if ("_sharedVar" in records) {
                //       // Invoke update manually
                //       await (
                //         component as RecordingComponentsWithSharedVariables
                //       ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                //     }
                //   }
                // }
                commitLock = false;
            }
        },
        async redo() {
            if (currentHistoryNode &&
                currentHistoryNode.children.length === 1 &&
                !currentHistoryNode.next) {
                currentHistoryNode.next = currentHistoryNode.children[0];
            }
            if (currentHistoryNode && currentHistoryNode.next) {
                const record = currentHistoryNode.next.record;
                commitLock = true;
                try {
                    for (let [component, records] of record.entries()) {
                        let layerHold = null;
                        if ("_sharedVar" in component && component._sharedVar.layer) {
                            layerHold = component._sharedVar.layer;
                        }
                        Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                        if (layerHold &&
                            "_sharedVar" in component &&
                            !component._sharedVar.layer) {
                            component._sharedVar.layer = layerHold;
                        }
                        if ("_sharedVar" in records) {
                            // Invoke update manually
                            await component.setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                        }
                    }
                    currentHistoryNode = currentHistoryNode.next;
                }
                catch (e) {
                    console.error("Fail to redo history!", e);
                    // Rollback
                    const record = currentHistoryNode.record;
                    for (let [component, records] of record.entries()) {
                        Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                        if ("_sharedVar" in records) {
                            // Invoke update manually
                            await component.setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                        }
                    }
                }
                commitLock = false;
            }
        },
        async jump(path = []) {
            const targetNode = path.reduce((p, v) => p?.children[v], historyTrace);
            if (targetNode) {
                const record = targetNode.record;
                commitLock = true;
                try {
                    for (let [component, records] of record.entries()) {
                        let layerHold = null;
                        if ("_sharedVar" in component && component._sharedVar.layer) {
                            layerHold = component._sharedVar.layer;
                        }
                        Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                        if (layerHold &&
                            "_sharedVar" in component &&
                            !component._sharedVar.layer) {
                            component._sharedVar.layer = layerHold;
                        }
                        if ("_sharedVar" in records) {
                            // Invoke update manually
                            await component.setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                        }
                    }
                    currentHistoryNode = targetNode;
                }
                catch (e) {
                    console.error("Fail to jump history!", e);
                    // Rollback
                    const record = currentHistoryNode.record;
                    for (let [component, records] of record.entries()) {
                        Object.entries(records).forEach(([k, v]) => (component[k] = deepClone(v)));
                        if ("_sharedVar" in records) {
                            // Invoke update manually
                            await component.setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
                        }
                    }
                }
                commitLock = false;
            }
            else {
                console.error(`History path [${path.join(", ")}] does not exist!`);
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
    await HistoryManager.commit();
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
