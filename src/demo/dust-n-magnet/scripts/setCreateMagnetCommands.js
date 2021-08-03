import { getBackground, getXYfromTransform, isPointerOnLayerBackground } from "./helper";
import IG from "~/IG";
import registerDragTool from "./dragTool";
import setDragCommands from "./setDragCommands";
import * as d3 from "d3";

registerDragTool();

/**
 * 通过setSharedVar暴露出三个对象：
 * @param {} layer
 * @param {*} clickTool
 */
const magnetWidth = 50;
const magnetHeight = 50;
function setCreateMagnetCommands(layer, clickTool) {
  layer.listen({
    tool: clickTool,
    endCommand: function (_, e) {

      const rawXY = d3.pointer(e.rawEvent);
      if(!isPointerOnLayerBackground(this, ...rawXY)) return;

      const dusts = this.getSharedVar("dusts");
      const magnetsProperties = this.getSharedVar("properties");
      const next = this.getSharedVar("next");
      const property = magnetsProperties[next % magnetsProperties.length];
      const data = dusts.data();
      const extent = d3.extent(data, d=>d[property]);

      const magnetLayer = renderMagnet(this.getGraphic(), e.x, e.y, magnetWidth, magnetHeight, {property, min: extent[0], max: extent[1]});

      const dragTool = IG.Tool.initialize("DragTool2");
      dragTool.attach(magnetLayer.getGraphic().node());
      setDragCommands(this, dragTool);
      setMoveMagnetCommands(this, dragTool, magnetLayer);
      setAttractDustsCommands(this, dragTool);

      // const dragTools = this.getSharedVar("dragTools") || [];
      // dragTools.push(dragTool);
      // this.setSharedVar("dragTools", dragTools);

      const magnetLayers = this.getSharedVar("magnetLayers") || [];
      magnetLayers.push(magnetLayer);
      this.setSharedVar("magnetLayers", magnetLayers);

      this.setSharedVar("next", next + 1);
    },
  });
}

function renderMagnet(root, x, y, magnetWidth, magnetHeight, shared){
      const magnetLayer = IG.Layer.initialize(
        "D3Layer",
        magnetWidth,
        magnetHeight,
        root
      );
      const magnetGroup = magnetLayer.getGraphic();

      magnetGroup
        .attr("transform", `translate(${x}, ${y})`);

      getBackground(magnetLayer)
        .attr("x", -magnetWidth / 2)
        .attr("y", -magnetHeight / 2)
        .attr("fill", "orange")
        .attr("opacity", 1);

      magnetGroup
        .append("text")
        .text(shared.property)
        .style("text-anchor", "middle")
        .style("font-size", "12")
        .style("font-weight", "700");
      
      for(const prop in shared){
        magnetLayer.setSharedVar(prop, shared[prop]);
      }

      return magnetLayer;
}


function setMoveMagnetCommands(layer, dragTool, magnetLayer) {
  const magnetG = magnetLayer.getGraphic();
  layer.listen({
    tool: dragTool,
    dragCommand: function(){
      const offset = this.getSharedVar("offset");
      const xy = getXYfromTransform(magnetG);
      magnetG.attr("transform", `translate(${xy[0] + offset[0]}, ${xy[1] + offset[1]})`);
    }
  });
}

function setAttractDustsCommands(layer, dragTool) {
  layer.listen({
    tool: dragTool,
    dragCommand: function(_, e) {
      const dusts = this.getSharedVar("dusts");
      const magnetLayers = this.getSharedVar("magnetLayers");
      const data = dusts.data();

      const time = 1;
      const magnitude = 1;
      console.log(dusts);
      for(const dustElem of dusts) {
        const dust = d3.select(dustElem);
        const dustX = +dust.attr("cx");
        const dustY = +dust.attr("cy");
        let vxAcc = 0;
        let vyAcc = 0;
        for(const magnetLayer of magnetLayers){
          const [x, y] = getXYfromTransform(magnetLayer.getGraphic());
          const property = magnetLayer.getSharedVar("property");
          const min = magnetLayer.getSharedVar("min");
          const max = magnetLayer.getSharedVar("max");
          console.log({x, y, property, min, max});
          const range = max - min;
          if(range === 0) continue;
          const value = dust.datum()[property];
          const velocity = magnitude * (value - min) / range;
          const [velocityX, velocityY] = resolveVelocity(velocity, [x, y], [dustX, dustY]);
          vxAcc += velocityX;
          vyAcc += velocityY;
        }
        console.log(vxAcc, vyAcc, dustX,dustY);
        dust.attr("cx", dustX + vxAcc * time);
        dust.attr("cy", dustY + vyAcc * time);
      }
    }
  });
}

function resolveVelocity(velocity, magnetPos, dustPos) {
  const xDistance = magnetPos[0] - dustPos[0];
  const yDistance = magnetPos[1] - dustPos[1];
  const hypo = Math.sqrt(xDistance ** 2 + yDistance ** 2);
  const xVelocity = xDistance / hypo * velocity;
  const yVelocity = yDistance / hypo * velocity;
  return [xVelocity, yVelocity];
}

export default setCreateMagnetCommands;
