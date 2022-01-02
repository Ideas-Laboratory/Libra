import Interactor from "./interactor";
Interactor.register("MousePositionInteractor", {
    constructor: Interactor,
    state: "start",
    actions: [
        {
            action: "enter",
            events: ["mouseenter"],
            transition: [["start", "running"]],
        },
        {
            action: "hover",
            events: ["mousemove"],
            transition: [["running", "running"]],
        },
        {
            action: "leave",
            events: ["mouseleave"],
            transition: [
                ["running", "start"],
                ["start", "start"],
            ],
        },
    ],
});
Interactor.register("TouchPositionInteractor", {
    constructor: Interactor,
    state: "start",
    actions: [
        {
            action: "enter",
            events: ["touchstart"],
            transition: [["start", "running"]],
        },
        {
            action: "hover",
            events: ["touchmove"],
            transition: [["running", "running"]],
        },
        {
            action: "leave",
            events: ["touchend"],
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
Interactor.register("TouchTraceInteractor", {
    constructor: Interactor,
    state: "start",
    actions: [
        {
            action: "dragstart",
            events: ["touchstart"],
            transition: [["start", "drag"]],
        },
        {
            action: "drag",
            events: ["touchmove"],
            transition: [["drag", "drag"]],
        },
        {
            action: "dragend",
            events: ["touchend"],
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
Interactor.register("KeyboardPositionInteractor", {
    constructor: Interactor,
    state: "start",
    actions: [
        {
            action: "begin",
            events: ["keydown[event.key===' ']"],
            transition: [["start", "running"]],
        },
        {
            action: "up",
            events: [
                "keypress[event.key==='w' || event.key==='W']",
                "keydown[event.key==='ArrowUp']{100}",
            ],
            transition: [["running", "running"]],
        },
        {
            action: "left",
            events: [
                "keypress[event.key==='a' || event.key==='A']",
                "keydown[event.key==='ArrowLeft']{100}",
            ],
            transition: [["running", "running"]],
        },
        {
            action: "down",
            events: [
                "keypress[event.key==='s' || event.key==='S']",
                "keydown[event.key==='ArrowDown']{100}",
            ],
            transition: [["running", "running"]],
        },
        {
            action: "right",
            events: [
                "keypress[event.key==='d' || event.key==='D']",
                "keydown[event.key==='ArrowRight']{100}",
            ],
            transition: [["running", "running"]],
        },
        // {
        //   action: "end",
        //   events: ["keydown[event.key===' ']"] ,
        //   transition: [
        //     ["running", "start"],
        //     ["start", "start"],
        //   ],
        // },
    ],
});
Interactor.register("MouseWheelInteractor", {
    constructor: Interactor,
    state: "start",
    actions: [
        {
            action: "enter",
            events: ["mouseenter"],
            transition: [["start", "running"]],
        },
        {
            action: "wheel",
            events: ["wheel", "mousewheel"],
            transition: [["running", "running"]],
        },
        {
            action: "leave",
            events: ["mouseleave"],
            transition: [
                ["running", "start"],
                ["start", "start"],
            ],
        },
        {
            action: "abort",
            events: ["contextmenu"],
            transition: [
                ["running", "running"],
                ["start", "start"],
            ],
        },
    ],
});
