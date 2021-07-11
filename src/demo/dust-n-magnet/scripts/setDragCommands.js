import { getBackground } from "./helper";
import IG from "~/IG";

/**
 * 通过setSharedScale暴露出个对象：offset: [dx, dy]
 * @param {} layer
 * @param {*} dragTool
 */
let _pre = [0, 0];
function setDrawRectXCommands(layer, dragTool) {
  layer.listen({
    tool: dragTool,
    startCommand: function (_, e) {
      _pre = [e.x, e.y];
      this.setSharedScale("offset", [0, 0]);
    },
    dragCommand: function (_, e) {
      const offset = [e.x - pre[0], e.y - pre[1]];
      this.setSharedScale("offset", offset);
    },
  });
}

export default setDrawRectXCommands;