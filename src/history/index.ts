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
  current: boolean;
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

export async function createHistoryTrrack() {
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
        current: node === currentHistoryNode,
      };
    },
    commit: async () => {
      if (commitLock) {
        return;
      }
      const record = new Map<AllRecordingComponents, any>();
      for (let { component, fields } of [
        { list: instanceInteractors, fields: ["_state", "_modalities"] },
        { list: instanceInstruments, fields: ["_sharedVar"] },
        { list: instanceServices, fields: ["_sharedVar"] },
        { list: instanceTransformers, fields: ["_sharedVar"] },
      ].flatMap(
        ({
          list,
          fields,
        }: {
          list: AllRecordingComponents[];
          fields: string[];
        }) =>
          list
            .filter(
              (component) =>
                tryGetHistoryTrrackInstance(component) === HistoryManager
            )
            .map((component) => ({ component, fields }))
      )) {
        await (component as any).results; // Ensure all works have been done
        record.set(
          component,
          Object.fromEntries(
            fields.map((field) => [field, deepClone(component[field])])
          )
        );
      }
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
        // try {
        for (let [component, records] of record.entries()) {
          let layerHold = null;
          if ("_sharedVar" in component && component._sharedVar.layer) {
            layerHold = component._sharedVar.layer;
          }
          Object.entries(records).forEach(
            ([k, v]) => (component[k] = deepClone(v))
          );
          if (
            layerHold &&
            "_sharedVar" in component &&
            !component._sharedVar.layer
          ) {
            component._sharedVar.layer = layerHold;
          }
          if ("_sharedVar" in records) {
            // Invoke update manually
            await (
              component as RecordingComponentsWithSharedVariables
            ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
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
      if (
        currentHistoryNode &&
        currentHistoryNode.children.length === 1 &&
        !currentHistoryNode.next
      ) {
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
            Object.entries(records).forEach(
              ([k, v]) => (component[k] = deepClone(v))
            );
            if (
              layerHold &&
              "_sharedVar" in component &&
              !component._sharedVar.layer
            ) {
              component._sharedVar.layer = layerHold;
            }
            if ("_sharedVar" in records) {
              // Invoke update manually
              await (
                component as RecordingComponentsWithSharedVariables
              ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
            }
          }
          currentHistoryNode = currentHistoryNode.next;
        } catch (e) {
          console.error("Fail to redo history!", e);
          // Rollback
          const record = currentHistoryNode.record;
          for (let [component, records] of record.entries()) {
            Object.entries(records).forEach(
              ([k, v]) => (component[k] = deepClone(v))
            );
            if ("_sharedVar" in records) {
              // Invoke update manually
              await (
                component as RecordingComponentsWithSharedVariables
              ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
            }
          }
        }
        commitLock = false;
      }
    },
    async jump(path: number[] = []) {
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
            Object.entries(records).forEach(
              ([k, v]) => (component[k] = deepClone(v))
            );
            if (
              layerHold &&
              "_sharedVar" in component &&
              !component._sharedVar.layer
            ) {
              component._sharedVar.layer = layerHold;
            }
            if ("_sharedVar" in records) {
              // Invoke update manually
              await (
                component as RecordingComponentsWithSharedVariables
              ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
            }
          }
          currentHistoryNode = targetNode;
        } catch (e) {
          console.error("Fail to jump history!", e);
          // Rollback
          const record = currentHistoryNode.record;
          for (let [component, records] of record.entries()) {
            Object.entries(records).forEach(
              ([k, v]) => (component[k] = deepClone(v))
            );
            if ("_sharedVar" in records) {
              // Invoke update manually
              await (
                component as RecordingComponentsWithSharedVariables
              ).setSharedVar("$LIBRA_FORCE_UPDATE", undefined);
            }
          }
        }
        commitLock = false;
      } else {
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
    .flatMap<AllRecordingComponents>((x) => x)
    .forEach((component) => {
      if (!historyInstanceMapping.has(component)) {
        historyInstanceMapping.set(component, HistoryManager);
      }
    });

  await HistoryManager.commit();
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
