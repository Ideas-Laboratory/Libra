export const LibraSymbol = Symbol("Libra");
export var QueryType;
(function (QueryType) {
    QueryType[QueryType["Shape"] = 0] = "Shape";
    QueryType[QueryType["Data"] = 1] = "Data";
    QueryType[QueryType["Attr"] = 2] = "Attr";
})(QueryType || (QueryType = {}));
export var ShapeQueryType;
(function (ShapeQueryType) {
    ShapeQueryType[ShapeQueryType["SurfacePoint"] = 0] = "SurfacePoint";
    ShapeQueryType[ShapeQueryType["Point"] = 1] = "Point";
    ShapeQueryType[ShapeQueryType["Circle"] = 2] = "Circle";
    ShapeQueryType[ShapeQueryType["Rect"] = 3] = "Rect";
    ShapeQueryType[ShapeQueryType["Polygon"] = 4] = "Polygon";
})(ShapeQueryType || (ShapeQueryType = {}));
export var DataQueryType;
(function (DataQueryType) {
    DataQueryType[DataQueryType["Quantitative"] = 0] = "Quantitative";
    DataQueryType[DataQueryType["Nominal"] = 1] = "Nominal";
    DataQueryType[DataQueryType["Temporal"] = 2] = "Temporal";
})(DataQueryType || (DataQueryType = {}));
class NonsenseClass {
}
let tryRegisterDynamicInstance = (...args) => { };
export function makeFindableList(list, typing, addFunc, removeFunc, self) {
    return new Proxy(list, {
        get(target, p) {
            if (p === "find") {
                return function (name, defaultValue) {
                    if (!("initialize" in typing)) {
                        const filteredResult = target.slice();
                        filteredResult.forEach((newTarget) => {
                            newTarget.find(...arguments);
                        });
                        return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
                    }
                    else {
                        const filteredResult = target.filter((item) => item.isInstanceOf(name));
                        if (filteredResult.length <= 0 && defaultValue) {
                            const newElement = typing.initialize(defaultValue);
                            addFunc(newElement);
                            filteredResult.push(newElement);
                            tryRegisterDynamicInstance(self, newElement);
                        }
                        return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
                    }
                };
            }
            else if (p === "add") {
                return (...args) => {
                    const filteredResult = target.slice();
                    if (!("initialize" in typing)) {
                        filteredResult.forEach((newTarget) => {
                            newTarget.add(...args);
                        });
                        return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
                    }
                    else {
                        const newElement = typing.initialize(...args);
                        addFunc(newElement);
                        filteredResult.push(newElement);
                        tryRegisterDynamicInstance(self, newElement);
                        return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
                    }
                };
            }
            else if (p === "remove") {
                return (name) => {
                    if (typing === NonsenseClass) {
                        const filteredResult = target.slice();
                        filteredResult.forEach((newTarget) => {
                            newTarget.remove(name);
                        });
                        return makeFindableList(filteredResult, typing, addFunc, removeFunc, self);
                    }
                    else {
                        const origin = target.slice();
                        const filteredResult = origin.filter((item) => item.isInstanceOf(name));
                        filteredResult.forEach((item) => {
                            removeFunc(item);
                            origin.splice(origin.indexOf(item), 1);
                        });
                        return makeFindableList(origin, typing, addFunc, removeFunc, self);
                    }
                };
            }
            else if (p in target && p !== "join" && p !== "filter") {
                return target[p];
            }
            else {
                if (!target.length) {
                    const f = () => { };
                    f[Symbol.iterator] = function* () { };
                    return f;
                }
                else if (target[0][p] instanceof Function) {
                    return function () {
                        return makeFindableList(target.map((t) => t[p].apply(t, arguments)), NonsenseClass, () => { }, () => { }, self);
                    };
                }
                else {
                    return makeFindableList(target.map((t) => t[p]), NonsenseClass, () => { }, () => { }, self);
                }
            }
        },
    });
}
export function getTransform(elem) {
    try {
        const transform = elem
            .getAttribute("transform")
            .split("(")[1]
            .split(")")[0]
            .split(",")
            .map((i) => parseFloat(i));
        return transform;
    }
    catch (e) {
        return [0, 0];
    }
}
/**
 * Parse an event selector string.
 * Returns an array of event stream definitions.
 */
export function parseEventSelector(selector) {
    return parseMerge(selector.trim()).map(parseSelector);
}
const VIEW = "view", LBRACK = "[", RBRACK = "]", LBRACE = "{", RBRACE = "}", COLON = ":", COMMA = ",", NAME = "@", GT = ">", ILLEGAL = /[[\]{}]/, DEFAULT_SOURCE = VIEW, DEFAULT_MARKS = {
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
}, MARKS = DEFAULT_MARKS;
function isMarkType(type) {
    return MARKS.hasOwnProperty(type);
}
function find(s, i, endChar, pushChar, popChar) {
    let count = 0, c;
    const n = s.length;
    for (; i < n; ++i) {
        c = s[i];
        if (!count && c === endChar)
            return i;
        else if (popChar && popChar.indexOf(c) >= 0)
            --count;
        else if (pushChar && pushChar.indexOf(c) >= 0)
            ++count;
    }
    return i;
}
function parseMerge(s) {
    const output = [], n = s.length;
    let start = 0, i = 0;
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
function parseSelector(s) {
    return s[0] === "[" ? parseBetween(s) : parseStream(s);
}
function parseBetween(s) {
    const n = s.length;
    let i = 1, b, stream;
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
    }
    else {
        stream.between = bt;
    }
    return stream;
}
function parseStream(s) {
    const stream = {
        source: DEFAULT_SOURCE,
        type: "",
    }, source = [];
    let throttle = [0, 0], markname = 0, start = 0, n = s.length, i = 0, j, filter;
    // extract throttle from end
    if (s[n - 1] === RBRACE) {
        i = s.lastIndexOf(LBRACE);
        if (i >= 0) {
            try {
                throttle = parseThrottle(s.substring(i + 1, n - 1));
            }
            catch (e) {
                throw "Invalid throttle specification: " + s;
            }
            s = s.slice(0, i).trim();
            n = s.length;
        }
        else
            throw "Unmatched right brace: " + s;
        i = 0;
    }
    if (!n)
        throw s;
    // set name flag based on first char
    if (s[0] === NAME)
        markname = ++i;
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
    }
    else {
        source.push(s.substring(start, i).trim());
        filter = [];
        start = ++i;
        if (start === n)
            throw "Unmatched left bracket: " + s;
    }
    // extract filters
    while (i < n) {
        i = find(s, i, RBRACK);
        if (i === n)
            throw "Unmatched left bracket: " + s;
        filter.push(s.substring(start, i).trim());
        if (i < n - 1 && s[++i] !== LBRACK)
            throw "Expected left bracket: " + s;
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
        }
        else if (isMarkType(source[0])) {
            stream.marktype = source[0];
        }
        else {
            stream.source = source[0];
        }
    }
    else {
        stream.type = source[0];
    }
    if (stream.type.slice(-1) === "!") {
        stream.consume = true;
        stream.type = stream.type.slice(0, -1);
    }
    if (filter != null)
        stream.filter = filter;
    if (throttle[0])
        stream.throttle = throttle[0];
    if (throttle[1])
        stream.debounce = throttle[1];
    return stream;
}
function parseThrottle(s) {
    const a = s.split(COMMA);
    if (!s.length || a.length > 2)
        throw s;
    return a.map(function (_) {
        const x = +_;
        if (x !== x)
            throw s;
        return x;
    });
}
export function deepClone(obj) {
    if (obj instanceof Array) {
        return obj.map(deepClone);
    }
    if ([
        "string",
        "number",
        "boolean",
        "undefined",
        "bigint",
        "symbol",
        "function",
    ].includes(typeof obj)) {
        return obj;
    }
    if (obj === null)
        return null;
    if (LibraSymbol in obj && obj[LibraSymbol]) {
        return obj;
    }
    const propertyObject = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), propertyObject);
}
export const global = {
    stopTransient: false,
};
import("./history").then((HM) => {
    tryRegisterDynamicInstance = HM.tryRegisterDynamicInstance;
});
