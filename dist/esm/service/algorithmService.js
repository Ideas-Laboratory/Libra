import Service from "./service";
import * as d3 from "d3";
export default class AnalysisService extends Service {
    constructor(baseName, options) {
        super(baseName, {
            ...options,
            resultAlias: options.resultAlias ?? "result",
        });
    }
    isInstanceOf(name) {
        return ("AnalysisService" === name ||
            this._baseName === name ||
            this._name === name);
    }
}
Service.AnalysisService = AnalysisService;
Service.register("AnalysisService", {
    constructor: AnalysisService,
});
Service.register("FilterService", {
    constructor: AnalysisService,
    evaluate({ data, extents, selectionResult, fields }) {
        if (!extents &&
            (!selectionResult || !selectionResult.length || !fields || !fields.length))
            return data;
        if (extents) {
            Object.entries(extents).forEach(([field, extent]) => {
                if (extent[0] >= extent[1] || isNaN(extent[0]) || isNaN(extent[1]))
                    return;
                data = data.filter((d) => d[field] >= extent[0] && d[field] <= extent[1]);
            });
        }
        else {
            const datum = d3.selectAll(selectionResult).datum();
            if (datum)
                fields.forEach((field) => {
                    data = data.filter((d) => d[field] == datum[field]);
                });
            console.log(data);
        }
        return data;
    },
});
Service.register("AggregateService", {
    constructor: AnalysisService,
    evaluate({ selectionResult }) {
        if (!(selectionResult instanceof Array))
            return 0;
        return selectionResult.length;
    },
});
