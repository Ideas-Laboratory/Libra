import Service from "./service";

export default class LayoutService extends Service {
  constructor(baseName: string, options: any) {
    super(baseName, {
      ...options,
      resultAlias: options.resultAlias ?? "result",
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

Service.register("ScaleService", {
  constructor: LayoutService,
  evaluate({ offsetx, width, offsety, height, scaleX, scaleY, layer, self }) {
    let layerInstance = layer;
    if (
      !layerInstance &&
      self._layerInstances &&
      self._layerInstances.length == 1
    ) {
      layerInstance = self._layerInstances[0];
    }

    if (scaleX && scaleX.invert && !scaleY) {
      if (width <= 0 || isNaN(width)) return scaleX;
      const scaleXCopy = scaleX.copy();

      const startX = scaleXCopy.invert(
        offsetx - (layerInstance?._offset?.x ?? 0)
      );
      const endX = scaleXCopy.invert(
        offsetx + width - (layerInstance?._offset?.x ?? 0)
      );
      scaleXCopy.domain([startX, endX]);
      scaleXCopy.clamp(true);
      return scaleXCopy;
    }
    if (!scaleX && scaleY && scaleY.invert) {
      if (height <= 0 || isNaN(height)) return scaleY;
      const scaleYCopy = scaleY.copy();

      const startY = scaleYCopy.invert(
        offsety - (layerInstance?._offset?.y ?? 0)
      );
      const endY = scaleYCopy.invert(
        offsety + height - (layerInstance?._offset?.y ?? 0)
      );
      scaleYCopy.domain([startY, endY]);
      scaleYCopy.clamp(true);
      return scaleYCopy;
    }
    if (scaleX && scaleY && scaleX.invert && scaleY.invert) {
      if (width <= 0 || isNaN(width) || height <= 0 || isNaN(height))
        return { scaleX, scaleY };
      const scaleXCopy = scaleX.copy();
      const scaleYCopy = scaleY.copy();

      const startX = scaleXCopy.invert(
        offsetx - (layerInstance?._offset?.x ?? 0)
      );
      const endX = scaleXCopy.invert(
        offsetx + width - (layerInstance?._offset?.x ?? 0)
      );
      const startY = scaleYCopy.invert(
        offsety - (layerInstance?._offset?.y ?? 0)
      );
      const endY = scaleYCopy.invert(
        offsety + height - (layerInstance?._offset?.y ?? 0)
      );
      scaleXCopy.domain([startX, endX]);
      scaleYCopy.domain([startY, endY]);
      scaleXCopy.clamp(true);
      scaleYCopy.clamp(true);
      return { scaleX: scaleXCopy, scaleY: scaleYCopy };
    }

    return { scaleX, scaleY };
  },
});
