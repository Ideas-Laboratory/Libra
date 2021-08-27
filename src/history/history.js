import { instanceSelectionManagers } from "../selectionManager";
import { instanceInteractors } from "../interactor";
import { instanceInstruments } from "../instrument";
import { instanceLayers } from "../layer";
import { deepClone, FreezableMap } from "../helpers";

function collect() {
  const context = {
    layers: new FreezableMap(),
    instruments: new FreezableMap(),
    interactors: new FreezableMap(),
    selectionManagers: new FreezableMap(),
  };
  instanceLayers.forEach((layer) =>
    context.layers.set(layer, collectLayer(layer))
  );
  instanceInstruments.forEach((instrument) =>
    context.instruments.set(instrument, collectInstrument(instrument))
  );
  instanceSelectionManagers.forEach((selectionManager) =>
    context.selectionManagers.set(
      selectionManager,
      collectSelectionManager(selectionManager)
    )
  );
  instanceInteractors.forEach((interactor) =>
    context.interactors.set(interactor, collectInteractor(interactor))
  );
  Object.freeze(context);
  Object.freeze(context.layers);
  Object.freeze(context.instruments);
  Object.freeze(context.interactors);
  Object.freeze(context.selectionManagers);
  return context;
}

function restore(context) {
  context.layers
    .entries()
    .forEach(([obj, context]) => restoreLayer(obj, context));
  context.instruments
    .entries()
    .forEach(([obj, context]) => restoreInstrument(obj, context));
  context.selectionManagers
    .entries()
    .forEach(([obj, context]) => restoreSelectionManager(obj, context));
  context.interactors
    .entries()
    .forEach(([obj, context]) => restoreInteractor(obj, context));
}

function collectLayer(layer) {
  return deepClone(layer._sharedVar);
}

function collectInstrument(instrument) {
  return deepClone(instrument._props);
}

function collectInteractor(interactor) {
  return interactor._state;
}

function collectSelectionManager(selectionManager) {
  const keys = Object.keys(selectionManager).filter(
    (key) =>
      !(selectionManager[key] instanceof Function) &&
      !["layers", "result"].includes(key)
  );
  return deepClone(
    Object.fromEntries(keys.map((key) => [key, selectionManager[key]]))
  );
}

function restoreLayer(context, layer) {
  layer._sharedVar = deepClone(context);
}

function restoreInstrument(context, instrument) {
  instrument._props = deepClone(context);
}

function restoreInteractor(context, interactor) {
  interactor._state = context;
}

function restoreSelectionManager(context, selectionManager) {
  Object.keys(context).forEach(
    (key) => (selectionManager[key] = deepClone(context[key]))
  );
}

let contexts = [];
let pointer = 0;
let inited = false;

export default {
  init() {
    pointer = 0;
    contexts = [];
    const context = collect();
    contexts.push(context);
    inited = true;
  },

  push() {
    if (!inited) return;
    const context = collect();
    contexts.splice(pointer + 1, contexts.length, context);
  },

  replace() {
    if (!inited) return;
    const context = collect();
    contexts.splice(pointer, contexts.length, context);
  },

  undo() {
    if (!inited) return;
    if (pointer > 0) pointer--;
    restore(contexts[pointer]);
  },

  redo() {
    if (!inited) return;
    if (pointer < contexts.length - 1) pointer++;
    restore(contexts[pointer]);
  },

  restore() {
    if (!inited) return;
    restore(contexts[pointer]);
  },
};
