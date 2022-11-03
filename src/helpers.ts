import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";
import { AllRecordingComponents } from "./history";

export const LibraSymbol = Symbol("Libra");

export enum QueryType {
  Shape,
  Data,
  Attr,
}

export enum ShapeQueryType {
  SurfacePoint,
  Point,
  Circle,
  Rect,
  Polygon,
}

export enum DataQueryType {
  Quantitative,
  Nominal,
  Temporal,
}

// export enum AttrQueryType {

// }

// We assume the transformation in Libra are all affined
type DomainInputType = any[] | void;
type DomainOutputType<T> = T extends any[] ? void : any[];
type RangeInputType = number[];
type RangeOutputType<T> = T extends void ? void : number[];

export type Transformation = {
  (domain: any): number;
  invert(range: number): any;
  copy(): Transformation;
  domain?(): any[];
  domain?(newDomain: any[]): Transformation;
  range?(): number[];
  range?(newRange: number[]): Transformation;
  clamp?(bool: boolean): Transformation;
};

export type ShapeBasedQuery =
  | SurfacePointQuery
  | PointQuery
  | CircleQuery
  | RectQuery
  | PolygonQuery;

export type SurfacePointQuery = {
  baseOn: QueryType.Shape;
  type: ShapeQueryType.SurfacePoint;
  x: number;
  y: number;
};

export type PointQuery = {
  baseOn: QueryType.Shape;
  type: ShapeQueryType.Point;
  x: number;
  y: number;
};

export type CircleQuery = {
  baseOn: QueryType.Shape;
  type: ShapeQueryType.Circle;
  x: number;
  y: number;
  r: number;
};

export type RectQuery = {
  baseOn: QueryType.Shape;
  type: ShapeQueryType.Rect;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PolygonQuery = {
  baseOn: QueryType.Shape;
  type: ShapeQueryType.Polygon;
  points: { x: number; y: number }[];
};

export type DataBasedQuery = QuantitativeQuery | NominalQuery | TemporalQuery;

export type QuantitativeQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Quantitative;
} & (
  | {
      attrName: string;
      extent: [number, number];
    }
  | {
      attrName: string[];
      extent: [number, number][];
    }
);
export type NominalQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Nominal;
} & (
  | {
      attrName: string;
      extent: unknown[];
    }
  | {
      attrName: string[];
      extent: unknown[][];
    }
);
export type TemporalQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Temporal;
} & (
  | {
      attrName: string;
      extent: [Date, Date];
      dateParser?: (value: unknown) => Date;
    }
  | {
      attrName: string[];
      extent: [Date, Date][];
      dateParser?: ((value: unknown) => Date)[];
    }
);

export type AttributeBasedQuery = {
  baseOn: QueryType.Attr;
  type: string;
  attrName: string;
  value: unknown;
  //[parameter: string]: any;
};

export type ArbitraryQuery =
  | ShapeBasedQuery
  | DataBasedQuery
  | AttributeBasedQuery;

export type CommonHandlerInput<T> = {
  self: T;
  layer: Layer<any>;
  instrument: Instrument;
  interactor: Interactor;
  [parameter: string]: any;
};

class NonsenseClass {}

let tryRegisterDynamicInstance;
export function makeFindableList<T extends AllRecordingComponents>(
  list: any,
  typing:
    | { new (...args: any[]): NonsenseClass }
    | { initialize(...args: any[]): T },
  addFunc: (newElement: T) => void,
  removeFunc: (element: T) => void,
  self: AllRecordingComponents
) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return function (name: string, defaultValue: string) {
          if (!("initialize" in typing)) {
            const filteredResult = target.slice();
            filteredResult.forEach((newTarget) => {
              newTarget.find(...arguments);
            });
            return makeFindableList(
              filteredResult,
              typing,
              addFunc,
              removeFunc,
              self
            );
          } else {
            const filteredResult = target.filter((item) =>
              item.isInstanceOf(name)
            );
            if (filteredResult.length <= 0 && defaultValue) {
              const newElement = typing.initialize(defaultValue) as T;
              addFunc(newElement);
              filteredResult.push(newElement);
              tryRegisterDynamicInstance(self, newElement);
            }
            return makeFindableList(
              filteredResult,
              typing,
              addFunc,
              removeFunc,
              self
            );
          }
        };
      } else if (p === "add") {
        return (...args: any[]) => {
          const filteredResult = target.slice();
          if (!("initialize" in typing)) {
            filteredResult.forEach((newTarget) => {
              newTarget.add(...args);
            });
            return makeFindableList(
              filteredResult,
              typing,
              addFunc,
              removeFunc,
              self
            );
          } else {
            const newElement = typing.initialize(...args) as T;
            addFunc(newElement);
            filteredResult.push(newElement);
            tryRegisterDynamicInstance(self, newElement);
            return makeFindableList(
              filteredResult,
              typing,
              addFunc,
              removeFunc,
              self
            );
          }
        };
      } else if (p === "remove") {
        return (name: string) => {
          if (typing === NonsenseClass) {
            const filteredResult = target.slice();
            filteredResult.forEach((newTarget) => {
              newTarget.remove(name);
            });
            return makeFindableList(
              filteredResult,
              typing,
              addFunc,
              removeFunc,
              self
            );
          } else {
            const origin = target.slice();
            const filteredResult = origin.filter((item) =>
              item.isInstanceOf(name)
            );
            filteredResult.forEach((item) => {
              removeFunc(item);
              origin.splice(origin.indexOf(item), 1);
            });
            return makeFindableList(origin, typing, addFunc, removeFunc, self);
          }
        };
      } else if (p in target && p !== "join" && p !== "filter") {
        return target[p];
      } else {
        if (!target.length) {
          const f = () => {};
          f[Symbol.iterator] = function* () {};
          return f;
        } else if (target[0][p] instanceof Function) {
          return function () {
            return makeFindableList(
              target.map((t) => t[p].apply(t, arguments)),
              NonsenseClass,
              () => {},
              () => {},
              self
            );
          };
        } else {
          return makeFindableList(
            target.map((t) => t[p]),
            NonsenseClass,
            () => {},
            () => {},
            self
          );
        }
      }
    },
  });
}

export function getTransform(elem: SVGElement) {
  try {
    const transform = elem
      .getAttribute("transform")
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((i) => parseFloat(i));
    return transform;
  } catch (e) {
    return [0, 0];
  }
}

/**
 * Parse an event selector string.
 * Returns an array of event stream definitions.
 */
export function parseEventSelector(selector: string) {
  return parseMerge(selector.trim()).map(parseSelector);
}

const VIEW = "view",
  LBRACK = "[",
  RBRACK = "]",
  LBRACE = "{",
  RBRACE = "}",
  COLON = ":",
  COMMA = ",",
  NAME = "@",
  GT = ">",
  ILLEGAL = /[[\]{}]/,
  DEFAULT_SOURCE = VIEW,
  DEFAULT_MARKS = {
    "*": 1,
    arc: 1,
    area: 1,
    group: 1,
    image: 1,
    line: 1,
    path: 1,
    rect: 1,
    rule: 1,
    shape: 1,
    symbol: 1,
    text: 1,
    trail: 1,
  },
  MARKS = DEFAULT_MARKS;

function isMarkType(type: string) {
  return MARKS.hasOwnProperty(type);
}

function find(
  s: string,
  i: number,
  endChar: string,
  pushChar?: string,
  popChar?: string
) {
  let count = 0,
    c: string;
  const n = s.length;

  for (; i < n; ++i) {
    c = s[i];
    if (!count && c === endChar) return i;
    else if (popChar && popChar.indexOf(c) >= 0) --count;
    else if (pushChar && pushChar.indexOf(c) >= 0) ++count;
  }
  return i;
}

export type EventStream = {
  source: string;
  type: string;
  markname?: string;
  marktype?: string;
  consume?: boolean;
  filter?: string[];
  throttle?: number;
  debounce?: number;
};

export type BetweenEventStream =
  | (EventStream & {
      between: (EventStream | BetweenEventStream)[];
    })
  | {
      between: (EventStream | BetweenEventStream)[];
      stream: BetweenEventStream[];
    };

function parseMerge(s: string) {
  const output: string[] = [],
    n = s.length;
  let start = 0,
    i = 0;

  while (i < n) {
    i = find(s, i, COMMA, LBRACK + LBRACE, RBRACK + RBRACE);
    output.push(s.substring(start, i).trim());
    start = ++i;
  }

  if (output.length === 0) {
    throw "Empty event selector: " + s;
  }
  return output;
}

function parseSelector(s: string) {
  return s[0] === "[" ? parseBetween(s) : parseStream(s);
}

function parseBetween(s: string): BetweenEventStream {
  const n = s.length;
  let i = 1,
    b: string[],
    stream;

  i = find(s, i, RBRACK, LBRACK, RBRACK);
  if (i === n) {
    throw "Empty between selector: " + s;
  }

  b = parseMerge(s.substring(1, i));
  if (b.length !== 2) {
    throw "Between selector must have two elements: " + s;
  }

  s = s.slice(i + 1).trim();
  if (s[0] !== GT) {
    throw "Expected '>' after between selector: " + s;
  }

  const bt = b.map(parseSelector);

  stream = parseSelector(s.slice(1).trim());
  if (stream.between) {
    return {
      between: bt,
      stream: stream,
    };
  } else {
    stream.between = bt;
  }

  return stream;
}

function parseStream(s: string) {
  const stream: EventStream = {
      source: DEFAULT_SOURCE,
      type: "",
    },
    source = [];
  let throttle = [0, 0],
    markname = 0,
    start = 0,
    n = s.length,
    i = 0,
    j: number,
    filter: string[];

  // extract throttle from end
  if (s[n - 1] === RBRACE) {
    i = s.lastIndexOf(LBRACE);
    if (i >= 0) {
      try {
        throttle = parseThrottle(s.substring(i + 1, n - 1));
      } catch (e) {
        throw "Invalid throttle specification: " + s;
      }
      s = s.slice(0, i).trim();
      n = s.length;
    } else throw "Unmatched right brace: " + s;
    i = 0;
  }

  if (!n) throw s;

  // set name flag based on first char
  if (s[0] === NAME) markname = ++i;

  // extract first part of multi-part stream selector
  j = find(s, i, COLON);
  if (j < n) {
    source.push(s.substring(start, j).trim());
    start = i = ++j;
  }

  // extract remaining part of stream selector
  i = find(s, i, LBRACK);
  if (i === n) {
    source.push(s.substring(start, n).trim());
  } else {
    source.push(s.substring(start, i).trim());
    filter = [];
    start = ++i;
    if (start === n) throw "Unmatched left bracket: " + s;
  }

  // extract filters
  while (i < n) {
    i = find(s, i, RBRACK);
    if (i === n) throw "Unmatched left bracket: " + s;
    filter.push(s.substring(start, i).trim());
    if (i < n - 1 && s[++i] !== LBRACK) throw "Expected left bracket: " + s;
    start = ++i;
  }

  // marshall event stream specification
  if (!(n = source.length) || ILLEGAL.test(source[n - 1])) {
    throw "Invalid event selector: " + s;
  }

  if (n > 1) {
    stream.type = source[1];
    if (markname) {
      stream.markname = source[0].slice(1);
    } else if (isMarkType(source[0])) {
      stream.marktype = source[0];
    } else {
      stream.source = source[0];
    }
  } else {
    stream.type = source[0];
  }
  if (stream.type.slice(-1) === "!") {
    stream.consume = true;
    stream.type = stream.type.slice(0, -1);
  }
  if (filter != null) stream.filter = filter;
  if (throttle[0]) stream.throttle = throttle[0];
  if (throttle[1]) stream.debounce = throttle[1];

  return stream;
}

function parseThrottle(s: string) {
  const a = s.split(COMMA);
  if (!s.length || a.length > 2) throw s;
  return a.map(function (_) {
    const x = +_;
    if (x !== x) throw s;
    return x;
  });
}

export function deepClone(obj) {
  if (obj instanceof Array) {
    return obj.map(deepClone);
  }
  if (
    [
      "string",
      "number",
      "boolean",
      "undefined",
      "bigint",
      "symbol",
      "function",
    ].includes(typeof obj)
  ) {
    return obj;
  }
  if (obj === null) return null;
  if (LibraSymbol in obj && obj[LibraSymbol]) {
    return obj;
  }
  const propertyObject = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
  return Object.assign(
    Object.create(Object.getPrototypeOf(obj)),
    propertyObject
  );
}

export const global = {
  stopTransient: false,
};

import("./history").then((HM) => {
  tryRegisterDynamicInstance = HM.tryRegisterDynamicInstance;
});
