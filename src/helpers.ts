import { Instrument } from "./instrument";
import { Interactor } from "./interactor";
import { Layer } from "./layer";

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
  Quantitative2D,
  Nominal,
  Temporal,
}

// export enum AttrQueryType {

// }

// We assume the transformation in Libra are all affined
export type Transformation = {
  (domain: any): number;
  inverse(range: number): any;
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

export type DataBasedQuery =
  | QuantitativeQuery
  | Quantitative2DQuery
  | NominalQuery
  | TemporalQuery;

export type QuantitativeQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Quantitative;
  attrName: string;
  extent: [number, number];
};
export type Quantitative2DQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Quantitative2D;
  attrNameX: string;
  extentX: [number, number];
  attrNameY: string;
  extentY: [number, number];
};
export type NominalQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Nominal;
  attrName: string;
  extent: unknown[];
};
export type TemporalQuery = {
  baseOn: QueryType.Data;
  type: DataQueryType.Temporal;
  attrName: string;
  extent: [Date, Date];
  dateParser?: (value: unknown) => Date;
};

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

export function makeFindableList<T>(
  list: any,
  typing: T,
  addFunc: (newElement: T) => void
) {
  return new Proxy(list, {
    get(target, p) {
      if (p === "find") {
        return (name: string, defaultValue: string) => {
          const filteredResult = target.filter((item) =>
            item.isInstanceOf(name)
          );
          if (filteredResult.length <= 0 && defaultValue) {
            const newElement = (typing as any).initialize(defaultValue) as T;
            addFunc(newElement);
            filteredResult.push(newElement);
          }
          return makeFindableList(filteredResult, typing, addFunc);
        };
      } else if (p in target) {
        return target[p];
      } else {
        return function () {
          return target.map((t) => t[p].apply(t, arguments));
        };
      }
    },
  });
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
