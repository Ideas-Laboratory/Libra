import Service from "./service";

export default class LayoutService extends Service {
  _oldResult: any = null;
  _result: any = null;
  _nextTick: number = 0;
  _computing: Promise<any> = null;

  constructor(baseName: string, options: any) {
    super(baseName, {
      ...options,
      resultAlias: options.resultAlias ?? "layoutResult",
    });
  }

  isInstanceOf(name: string): boolean {
    return (
      "LayoutService" === name || this._baseName === name || this._name === name
    );
  }
}

(Service as any).LayoutService = LayoutService;

Service.register("LayoutService", {
  constructor: LayoutService,
});
