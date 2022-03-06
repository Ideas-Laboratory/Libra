import InteractionService from "./service";

export default class LayoutService extends InteractionService {
  _oldResult: any = null;
  _result: any = null;
  _nextTick: number = 0;

  constructor(baseName: string, options: any) {
    super(baseName, options);
    Object.entries(options.params || {}).forEach((entry) => {
      this.setSharedVar(entry[0], entry[1]);
    });
  }

  async setSharedVar(sharedName: string, value: any, options?: any) {
    this.preUpdate();
    this._sharedVar[sharedName] = value;
    if (this._userOptions.layout) {
      if (this._nextTick) {
        return;
      }
      this._nextTick = requestAnimationFrame(async () => {
        this._oldResult = this._result;
        try {
          this._result = await this._userOptions.layout({
            ...(this._userOptions.params ?? {}),
            ...this._sharedVar,
          });
        } catch (e) {
          console.error(e);
          this._result = undefined;
        }

        this._nextTick = 0;

        this.postUpdate();
      });
    } else {
      this.postUpdate();
    }
  }

  isInstanceOf(name: string): boolean {
    return (
      "LayoutService" === name ||
      this._baseName === name ||
      this._name === name
    );
  }

  get results() {
    if (this._nextTick) {
      return new Promise((res) => {
        window.requestAnimationFrame(() => {
          res(this._result);
        });
      });
    }
    return this._result;
  }

  get oldResults() {
    if (this._nextTick) {
      return new Promise((res) => {
        window.requestAnimationFrame(() => {
          res(this._oldResult);
        });
      });
    }
    return this._oldResult;
  }
}

(InteractionService as any).LayoutService = LayoutService;

InteractionService.register("LayoutService", {
  constructor: LayoutService,
});
