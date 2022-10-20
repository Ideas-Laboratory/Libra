import { instanceServices, Service } from "../service";
import { instanceTransformers, GraphicalTransformer } from "../transformer";
import { instanceCommands, Command } from "../command";
import { instanceInstruments, Instrument } from "../instrument";
import { instanceInteractors, Interactor } from "../interactor";
import { deepClone } from "../helpers";

export type AllRecordingComponents =
  | Service
  | GraphicalTransformer
  | Command
  | Instrument
  | Interactor;

type RecordingComponentsWithSharedVariables =
  | Service
  | GraphicalTransformer
  | Instrument;

type HistoryNode = {
  record: Map<AllRecordingComponents, { [key: string]: any }>;
  prev?: HistoryNode;
  next?: HistoryNode;
  children: HistoryNode[];
};

type HistoryTrrackNodeDescription = {
  recordList: AllRecordingComponents[];
  children: HistoryTrrackNodeDescription[];
};

type HistoryManagerTrrackInstance = {
  traceStructure: (node?: HistoryNode) => HistoryTrrackNodeDescription;
  commit(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
};

const historyInstanceMapping = new Map<
  AllRecordingComponents,
  HistoryManagerTrrackInstance
>();

export function createHistoryTrrack() {
  let historyTrace: HistoryNode = null;
  let currentHistoryNode: HistoryNode = null;
  let commitLock = false;

  const HistoryManager = {
    traceStructure: (
      node: HistoryNode = historyTrace
    ): HistoryTrrackNodeDescription => {
      return {
        recordList: [...node.record.keys()],
        children: node.children.map((node) =>
          HistoryManager.traceStructure(node)
        ),
      };
    },
    commit: async () => {
      if (commitLock) {
        return;
      }
      const record = new Map<AllRecordingComponents, any>();
      [
        { list: instanceInstruments, fields: ["_sharedVar"] },
        { list: instanceServices, fields: ["_sharedVar"] },
        { list: instanceTransformers, fields: ["_sharedVar"] },
        { list: instanceInteractors, fields: ["_state", "_modalities"] },
      ].forEach(
        ({
          list,
          fields,
        }: {
          list: AllRecordingComponents[];
          fields: string[];
        }) => {
          list
            .filter(
              (component) =>
                tryGetHistoryTrrackInstance(component) === HistoryManager
            )
            .forEach((component) => {
              record.set(
                component,
                Object.fromEntries(
                  fields.map((field) => [field, deepClone(component[field])])
                )
              );
            });
        }
      );
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
          Object.entries(records).forEach(
            ([k, v]) => (component[k] = deepClone(v))
          );
          if (
            "_sharedVar" in records &&
            Object.keys(records._sharedVar).length > 0
          ) {
            // Invoke update manually
            (component as RecordingComponentsWithSharedVariables).setSharedVar(
              ...Object.entries(records._sharedVar)[0]
            );
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
          Object.entries(records).forEach(
            ([k, v]) => (component[k] = deepClone(v))
          );
          if (
            "_sharedVar" in records &&
            Object.keys(records._sharedVar).length > 0
          ) {
            // Invoke update manually
            (component as RecordingComponentsWithSharedVariables).setSharedVar(
              ...Object.entries(records._sharedVar)[0]
            );
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
    .flatMap<AllRecordingComponents>((x) => x)
    .forEach((component) => {
      if (!historyInstanceMapping.has(component)) {
        historyInstanceMapping.set(component, HistoryManager);
      }
    });

  HistoryManager.commit();
  historyTrace = currentHistoryNode;

  return HistoryManager;
}

export function tryGetHistoryTrrackInstance(
  component: AllRecordingComponents
): HistoryManagerTrrackInstance {
  const directHM = historyInstanceMapping.get(component);
  if (directHM) {
    return directHM;
  }
  // Otherwise, return a mimic HM that does nothing
  return {
    traceStructure() {
      return null;
    },
    async commit() {},
    async undo() {},
    async redo() {},
  };
}

export function tryRegisterDynamicInstance(
  parentComponent: AllRecordingComponents,
  newComponent: AllRecordingComponents
) {
  const HM = historyInstanceMapping.get(parentComponent);
  if (HM) {
    historyInstanceMapping.set(newComponent, HM);
  }
}
