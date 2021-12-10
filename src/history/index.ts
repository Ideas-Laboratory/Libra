import { instanceServices } from "../service";

let historyRecords = [];
let historyPointer = -1;
let commitLock = false;

export const HistoryManager = {
  commit() {
    if (commitLock) {
      return;
    }
    const record = new Map();
    instanceServices.forEach((service) => {
      if ("results" in service) {
        record.set(service, (service as any).results);
      }
    });
    historyRecords.splice(historyPointer + 1, historyRecords.length, record);
    historyPointer++;
  },
  undo() {
    historyPointer--;
    if (historyPointer < 0) {
      historyPointer = 0;
      return;
    }
    const record = historyRecords[historyPointer];
    commitLock = true;
    for (let [service, results] of record.entries()) {
      service._result = results;
      if (service._on.update) {
        service._on.update.forEach((command) =>
          command.execute({
            self: service,
            layer:
              service._layerInstances.length == 1
                ? service._layerInstances[0]
                : null,
            instrument: null,
            interactor: null,
          })
        );
      }
    }
    commitLock = false;
  },
  redo() {
    historyPointer++;
    if (historyPointer >= historyRecords.length) {
      historyPointer = historyRecords.length - 1;
      return;
    }
    const record = historyRecords[historyPointer];
    commitLock = true;
    for (let [service, results] of record.entries()) {
      service._result = results;
      if (service._on.update) {
        service._on.update.forEach((command) =>
          command.execute({
            self: service,
            layer:
              service._layerInstances.length == 1
                ? service._layerInstances[0]
                : null,
            instrument: null,
            interactor: null,
          })
        );
      }
    }
    commitLock = false;
  },
};
