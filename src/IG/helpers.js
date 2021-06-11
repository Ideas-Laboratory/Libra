export function makeFlexibleListener() {
  return new Proxy(
    {},
    {
      get(target, p) {
        if (p === Symbol.iterator) return Object.keys(target)[Symbol.iterator];
        if (!target[p]) target[p] = [];
        return {
          set: (cbk) => target[p].push(cbk),
          add: (cbk) => target[p].push(cbk),
          clear: () => (target[p] = []),
          remove: (cbk) => {
            if (target[p].includes(cbk)) {
              target[p].splice(target[p].indexOf(cbk), 1);
            }
          },
          list: () => target[p],
        };
      },
    }
  );
}
