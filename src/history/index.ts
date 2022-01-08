import { instanceServices } from "../service";
import { instanceCommands } from "../command";

let historyRecords = [];
let historyPointer = -1;
let commitLock = false;

export const HistoryManager = {
  commit: async (options) => {
    if (commitLock) {
      return;
    }
    const record = new Map();
    await Promise.all(
      instanceServices.map(async (service) => {
        if ("results" in service) {
          record.set(service, [
            await (service as any).results,
            (options || {}).command,
            options,
          ]);
        }
      })
    );
    historyRecords.splice(historyPointer + 1, historyRecords.length, record);
    historyPointer++;
  },
  async undo() {
    historyPointer--;
    if (historyPointer < 0) {
      historyPointer = 0;
      return;
    }
    const record = historyRecords[historyPointer];
    commitLock = true;
    for (let [service, [results, command, options]] of record.entries()) {
      service._result = results;
      if (command && options) await command.execute(options);
    }
    commitLock = false;
  },
  async redo() {
    historyPointer++;
    if (historyPointer >= historyRecords.length) {
      historyPointer = historyRecords.length - 1;
      return;
    }
    const record = historyRecords[historyPointer];
    commitLock = true;
    for (let [service, [results, command, options]] of record.entries()) {
      service._result = results;
      if (command && options) await command.execute(options);
    }
    commitLock = false;
  },
};
