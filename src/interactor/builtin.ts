import Interactor from "./interactor";

Interactor.register("MousePositionInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "enter",
      events: ["mouseenter, touchstart"],
      transition: [["start", "running"]],
    },
    {
      action: "hover",
      events: ["mousemove", "touchmove"],
      transition: [["running", "running"]],
    },
    {
      action: "leave",
      events: ["mouseleave", "touchend"],
      transition: [
        ["running", "start"],
        ["start", "start"],
      ],
    },
  ],
});

Interactor.register("MouseTraceInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "dragstart",
      events: ["mousedown", "touchstart"],
      transition: [["start", "drag"]],
    },
    {
      action: "drag",
      events: ["mousemove", "touchmove"],
      transition: [["drag", "drag"]],
    },
    {
      action: "dragend",
      events: ["mouseup", "touchend"],
      transition: [["drag", "start"]],
    },
    {
      action: "dragabort",
      events: ["contextmenu", "touchcancel"],
      transition: [
        ["drag", "start"],
        ["start", "start"],
      ],
    },
  ],
});

Interactor.register("SpeechControlInteractor", {
  constructor: Interactor,
  state: "start",
  actions: [
    {
      action: "enableSpeech",
      events: ["click"],
      transition: [["*", "speech:ready"]],
    },
    {
      action: "disableSpeech",
      events: ["contextmenu"],
      transition: [["*", "start"]],
    },
    {
      action: "speech",
      events: ["*"],
      transition: [["*", "speech:ready"]],
    },
  ],
});
