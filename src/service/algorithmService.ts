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
  evaluate({ data, extents }) {
    if (!extents) return data;
    Object.entries(extents).forEach(([field, extent]) => {
      if (extent[0] >= extent[1] || isNaN(extent[0]) || isNaN(extent[1]))
        return;
      data = data.filter((d) => d[field] >= extent[0] && d[field] <= extent[1]);
    });
    return data;
  },
});

Service.register("AggregateService", {
  constructor: AnalysisService,
  evaluate({ selectionResult }) {
    if (!(selectionResult instanceof Array)) return 0;
    return selectionResult.length;
  },
});
