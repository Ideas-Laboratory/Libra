import Interactor from "./interactor";

Interactor.register("MousePositionInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "hover",
      events: ["mousemove"],
    },
  ],
});

Interactor.register("MouseTraceInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "dragstart",
      events: ["mousedown"],
      transition: [["start", "drag"]],
    },
    {
      action: "drag",
      events: ["mousemove"],
      transition: [["drag", "drag"]],
    },
    {
      action: "dragend",
      events: ["mouseup"],
      transition: [["drag", "start"]],
    },
    {
      action: "dragabort",
      events: ["contextmenu"],
      transition: [
        ["drag", "start"],
        ["start", "start"],
      ],
    },
  ],
});
