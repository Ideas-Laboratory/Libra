import Service from "./service";
import * as helpers from "../helpers";
import * as d3 from "d3";

export default class AnalysisService extends Service {
  constructor(baseName: string, options: any) {
    super(baseName, {
      ...options,
      resultAlias: options.resultAlias ?? "result",
    });
  }

  isInstanceOf(name: string): boolean {
    return (
      "AnalysisService" === name ||
      this._baseName === name ||
      this._name === name
    );
  }
}

(Service as any).AnalysisService = AnalysisService;

Service.register("AnalysisService", {
  constructor: AnalysisService,
});

Service.register("FilterService", {
  constructor: AnalysisService,
  evaluate({ data, extents, result, fields }) {
    if (!extents && (!result || !result.length || !fields || !fields.length)) {
      if (!extents) return [];
      return data;
    }
    if (extents) {
      Object.entries(extents).forEach(([field, extent]) => {
        if (extent[0] >= extent[1] || isNaN(extent[0]) || isNaN(extent[1]))
          return;
        data = data.filter(
          (d) => d[field] >= extent[0] && d[field] <= extent[1]
        );
      });
    } else {
      const datum = d3.selectAll(result).datum();
      if (datum)
        fields.forEach((field) => {
          data = data.filter((d) => d[field] == datum[field]);
        });
    }
    return data;
  },
});

Service.register("InterpolationService", {
  constructor: AnalysisService,
  evaluate({ result, field, data, formula }) {
    if (!result) {
      return null;
    }
    const { data: fieldValue, interpolatedNum } = result;
    if (!fieldValue || interpolatedNum === undefined || isNaN(interpolatedNum))
      return null;

    const baseNum = Math.floor(interpolatedNum);
    const newValue = fieldValue[baseNum][field];
    let newInterpolatedData = data.filter((d) => d[field] === newValue);
    if (interpolatedNum > baseNum) {
      const nextNum = baseNum + 1;
      const interpolate = interpolatedNum - baseNum;
      newInterpolatedData = newInterpolatedData.map((baseDatum) => {
        const nextDatum = data.find(
          (d) =>
            d[field] === fieldValue[nextNum][field] &&
            !Object.entries(baseDatum).find(
              ([k, v]) => typeof v !== "number" && d[k] !== v
            )
        );
        return Object.fromEntries(
          Object.entries(baseDatum).map(([k, v]) => {
            if (typeof v === "number") {
              return [k, v * (1 - interpolate) + nextDatum[k] * interpolate];
            } else {
              return [k, v];
            }
          })
        );
      });
    }

    return newInterpolatedData.map((d) => {
      if (formula) {
        Object.entries(formula).forEach(([k, v]: [string, Function]) => {
          d[k] = v(d);
        });
      }
      return d;
    });
  },
});

Service.register("AggregateService", {
  constructor: AnalysisService,
  evaluate({ result }) {
    if (!(result instanceof Array)) return 0;
    return result.length;
  },
});
