export function makeFlexibleListener() {
  return new Proxy(
    { listener: {}, counter: {} },
    {
      get(target, p) {
        if (p === Symbol.iterator)
          return Object.keys(target.listener)[Symbol.iterator];
        if (!target.listener[p]) target.listener[p] = [];
        if (!target.counter[p]) target.counter[p] = 0;
        return {
          set: (cbk) => {
            target.counter[p]++;
            target.listener[p].push(cbk);
          },
          add: (cbk) => {
            target.counter[p]++;
            target.listener[p].push(cbk);
          },
          prepend: (cbk) => target.listener[p].unshift(cbk),
          clear: () => {
            target.counter[p] = 0;
            target.listener[p] = [];
          },
          remove: (cbk) => {
            if (target.listener[p].includes(cbk)) {
              target.counter[p]--;
              target.listener[p].splice(target.listener[p].indexOf(cbk), 1);
            }
          },
          list: () => target.listener[p],
          size: () => target.counter[p],
        };
      },
    }
  );
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj)); // TODO: change to advance method later
}

export function makeComposableSelectionManager(self) {
  return new Proxy(self, {
    get(target, p) {
      return target[p];
    },
    set(target, p, value) {
      if (!target.hasOwnProperty(p)) {
        target.selectionManagers.forEach((selectionManager) => {
          if (selectionManager.hasOwnProperty(p)) {
            selectionManager[p] = value;
          }
        });
      } else {
        target[p] = value;
      }
    },
    has(target, p) {
      if (!target.hasOwnProperty(p)) {
        return !!target.selectionManagers.find((selectionManager) =>
          selectionManager.hasOwnProperty(p)
        );
      } else {
        return true;
      }
    },
    getOwnPropertyDescriptor(target, p) {
      if (!target.hasOwnProperty(p)) {
        return target.selectionManagers.find((selectionManager) =>
          selectionManager.hasOwnProperty(p)
        )
          ? { configurable: true, enumerable: true }
          : undefined;
      } else {
        return { configurable: true, enumerable: true };
      }
    },
    ownKeys(target) {
      let result = Reflect.ownKeys(target);
      target.selectionManagers.forEach((selectionManager) => {
        result = result.concat(Reflect.ownKeys(selectionManager));
      });
      return [...new Set(result)];
    },
  });
}

export class FreezableMap extends Map {
  set(...args) {
    if (Object.isFrozen(this)) return this;

    return super.set(...args);
  }
  delete(...args) {
    if (Object.isFrozen(this)) return false;

    return super.delete(...args);
  }
  clear() {
    if (Object.isFrozen(this)) return;

    return super.clear();
  }
}
