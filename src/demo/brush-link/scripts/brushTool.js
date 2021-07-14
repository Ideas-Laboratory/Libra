import IG from "~/IG";
const { Tool, SelectionManager, Interactor } = IG;

Interactor.register("TrajectoryInteractor2", {
  startActions: "mousedown",
  runningActions: "mousemove",
  //stopActions: ["mouseup", "mouseout"],
  // outsideActions: "mouseup",
  // backInsideActions: "mousedown",
  stopActions: "mouseup",
  rename: {
    active: "start",
    frame: "drag",
    terminate: "end",
  },
});

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor2");

console.log(trajectoryInteractor);

function registerBrushTool() {
  Tool.register("BrushTool2", {
    selectionManager: SelectionManager.initialize("RectSelectionManager"),
    relations: [
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        startCommand: (e) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        startCommand: (e) => e.y,
      },
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        dragCommand: (e, query) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        dragCommand: (e, query) => e.y,
      },
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        endCommand: (e) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        endCommand: (e) => e.y,
      },
    ],
  });
}

export default registerBrushTool;
