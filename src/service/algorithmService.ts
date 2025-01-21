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
  evaluate({ data, extents, result, fields, self }) {
    if (!extents && (!result || !result.length || !fields || !fields.length)) {
      if (!extents) return [];
      return data;
    }
    if (!data) {
      try {
        const layerInstances = self._layerInstances;
        if (layerInstances && layerInstances.length > 0) {
          data = [...layerInstances[0].getGraphic().childNodes]
            .filter((el) => layerInstances[0].getDatum(el))
            .map((el) =>
              Object.assign(
                layerInstances[0].cloneVisualElements(el),
                layerInstances[0].getDatum(el)
              )
            );
        }
      } catch (e) {
        console.error("failed to get data from layerInstances", e);
      }
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
      const layerInstances = self._layerInstances;
      let datum: any = d3.selectAll(result).datum();
      if (layerInstances && layerInstances.length > 0) {
        datum = layerInstances[0].getDatum(result[0]);
      }

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

Service.register("DataJoinService", {
  constructor: AnalysisService,
  evaluate({
    data,
    result,
    offset,
    scaleX,
    scaleY,
    fieldX,
    fieldY,
    replace,
    self,
  }) {
    if (!result || result.length <= 0) return data;
    const layerInstances = self._layerInstances;
    if (layerInstances && layerInstances.length > 0) {
      const datum = layerInstances[0].getDatum(result[0]);
      if (datum) {
        const datumBackup = helpers.deepClone(datum);
        if (offset !== undefined && scaleX && scaleX.invert && fieldX) {
          datum[fieldX] = scaleX.invert(
            scaleX(datum[fieldX]) + parseFloat(offset.x)
          );
        }
        if (
          offset !== undefined &&
          scaleY &&
          scaleY.invert &&
          fieldY &&
          fieldY !== fieldX
        ) {
          datum[fieldY] = scaleY.invert(
            scaleY(datum[fieldY]) + parseFloat(offset.y)
          );
        }
        if (!replace) {
          const newData = helpers.deepClone(data);
          Object.assign(datum, datumBackup);
          return newData;
        } else {
          return data;
        }
      }
    }
    return data;
  },
});

Service.register("AggregateService", {
  constructor: AnalysisService,
  evaluate({ result, operation, fields }) {
    if (!(result instanceof Array)) return 0;
    if (operation === "average") {
      return Object.fromEntries(
        fields.map((field) => [
          field,
          result.reduce((sum, d) => sum + d[field], 0) / result.length,
        ])
      );
    }
    return result.length;
  },
});

Service.register("ReverseSelectionService", {
  constructor: AnalysisService,
  evaluate({ result, self }) {
    // Get all DOM on the layer
    const layerInstances = self._layerInstances;
    if (layerInstances && layerInstances.length > 0) {
      const graphic = layerInstances[0].getGraphic();
      const doms = [...graphic.childNodes].filter((el) =>
        layerInstances[0].getDatum(el)
      );
      const domData = doms.map((el) => layerInstances[0].getDatum(el));
      // As the result is the copied DOM, we need to convert it to data and then filter
      const data = (result || []).map((el) => layerInstances[0].getDatum(el));
      return doms
        .filter((_, i) => !data.includes(domData[i]))
        .map((d) => layerInstances[0].cloneVisualElements(d, true));
    }
    return [];
  },
});

Service.register("RegressionService", {
  constructor: AnalysisService,
  evaluate({ result, xField, yField, self }) {
    if (!result || result.length <= 1 || !(result instanceof Array))
      return null;

    // Need to convert DOM list to data
    const layerInstances = self._layerInstances;
    if (layerInstances && layerInstances.length > 0) {
      const datum = layerInstances[0].getDatum(result[0]);
      if (datum) {
        result = result
          .map((d) => layerInstances[0].getDatum(d))
          .filter((x) => x !== undefined);
      }
    }

    let xValues, yValues;

    if (xField instanceof Function) {
      xValues = result.map((d) => xField(d));
    } else if (xField) {
      xValues = result.map((d) => d[xField]);
    }
    if (yField instanceof Function) {
      yValues = result.map((d) => yField(d));
    } else if (yField) {
      yValues = result.map((d) => d[yField]);
    }
    const xMean = d3.mean(xValues);
    const yMean = d3.mean(yValues);
    // Calculate slope of the regression line
    // Calculate slope using least squares method
    const numerator = d3.sum(
      xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean))
    );
    const denominator = d3.sum(xValues.map((x) => Math.pow(x - xMean, 2)));
    const slope = numerator / denominator;

    // Calculate y-intercept using point-slope form
    const intercept = yMean - slope * xMean;
    return {
      slope,
      intercept,
    };
  },
});
