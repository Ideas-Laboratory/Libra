  
import { getBackground } from "./helper";
import IG from "~/IG";
import * as d3 from "d3";

/**
 * 通过setSharedVar暴露出个对象：offset: [dx, dy]
 * @param {} layer
 * @param {*} dragTool
 */
let _pre = null;
function setDragCommands(layer, dragTool) {
  layer.listen({
    tool: dragTool,
    startCommand: function (_, e) {
      console.log("start command executed");
      _pre = null;
      // _pre = [e.x, e.y];
      // this.setSharedVar("offset", [0, 0]);
      // console.log("dragTool start");
    },
    dragCommand: function (_, e) {
      let offset;
      const pos = d3.pointer(e.rawEvent, document);
      if(_pre){
        offset = [pos[0] - _pre[0], pos[1] - _pre[1]];
      } else {
        offset = [0, 0];
      }
      _pre = [pos[0], pos[1]];
      this.setSharedVar("offset", offset);
    },
  });
}

export default setDragCommands;