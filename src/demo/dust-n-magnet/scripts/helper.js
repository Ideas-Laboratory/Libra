// IG最好提供这个功能。在background创建时，就在实例对象中保存一个对它的引用。
function getBackground(layer) {
  return layer.getGraphic().select(".ig-layer-background") ?? null;
}

function getXYfromTransform(node) {
  try {
    const transform = node
      .attr("transform")
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((i) => parseFloat(i));
    return transform;
  } catch (e) {
    return [0, 0];
  }
}

function isPointerOnLayerBackground(layer, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  if (!layer) return false;
  const elemUnderPointer = document.elementFromPoint(x, y);
  const rect = getBackground(layer).node();
  if (elemUnderPointer === rect) {
    return true;
  }
  return false;
}

export {getBackground, getXYfromTransform, isPointerOnLayerBackground};