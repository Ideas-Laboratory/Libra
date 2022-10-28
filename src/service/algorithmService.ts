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
