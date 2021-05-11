import Layer from "./index";
import * as d3 from "d3";

export default class D3Layer extends Layer {
  _root = d3.create("g");
  _width;
  _height;

  constructor(name = "D3Layer", width, height, svg) {
    super(name);
    this._name = name;
    this._width = width;
    this._height = height;
    let listener;
    if (svg) {
      this._root = svg.append("g");
      listener = svg.node();
    } else {
      listener = this._root.node();
    }
    this._root
      .append("rect")
      .attr("class", "ig-layer-background")
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("opacity", 0);

    listener.addEventListener("mousedown", this._dispatchEvent.bind(this));
    listener.addEventListener("mousemove", this._dispatchEvent.bind(this));
    listener.addEventListener("mouseup", this._dispatchEvent.bind(this));
    listener.addEventListener("wheel", this._dispatchEvent.bind(this));
  }

  _toTemplate() {
    return {
      ...super._toTemplate(),
      extraParams: [this._width, this._height],
    };
  }

  /**
   *
   * @param {MouseEvent} event
   */
  _dispatchEvent(event) {
    event.preventDefault();
    let wrappedEvents = [];
    const bbox = this._root.node().getBoundingClientRect();
    switch (event.type) {
      case "mousedown":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "mousemove":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "mouseup":
        wrappedEvents.push({
          rawEvent: event,
          type: "pointer",
          rawX: event.clientX,
          rawY: event.clientY,
          x: event.clientX - bbox.left,
          y: event.clientY - bbox.top,
        });
        break;
      case "wheel":
        wrappedEvents.push({
          rawEvent: event,
          type: "wheel",
          delta: event.deltaY,
        });
        break;
    }
    for (let wrappedEvent of wrappedEvents) {
      for (let tool of this._pureTools) {
        tool.dispatch(wrappedEvent);
      }
      for (let option of this._preconditionTools) {
        if (option.precondition instanceof Function) {
          if (option.precondition.call(this, wrappedEvent, this)) {
            if (option.tools) {
              for (let tool of option.tools) {
                tool.dispatch(wrappedEvent);
              }
            } else if (option.tool) {
              option.tool.dispatch(wrappedEvent);
            }
          }
        } else if (option.precondition) {
          if (option.tools) {
            for (let tool of option.tools) {
              tool.dispatch(wrappedEvent);
            }
          } else if (option.tool) {
            option.tool.dispatch(wrappedEvent);
          }
        }
      }
    }
  }

  getGraphic() {
    return this._root;
  }

  onObject(event) {
    if (event.type !== "pointer") {
      return false;
    }
    const element = document.elementFromPoint(event.rawX, event.rawY);
    return (
      this._root.node().contains(element) &&
      element.classList.contains("ig-layer-background")
    );
  }

  inside(event) {
    if (event.type !== "pointer") {
      return false;
    }
    const element = document.elementFromPoint(event.rawX, event.rawY);
    return this._root.node().contains(element);
  }

  objects() {
    return this._root.selectChildren(":not(.ig-layer-background)");
  }
}

Layer.D3Layer = D3Layer;
Layer.register("D3Layer", { constructor: D3Layer });
