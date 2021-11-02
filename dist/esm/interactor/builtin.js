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
