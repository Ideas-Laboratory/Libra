import IG from "~/IG";
import { initialize, register } from "../../../IG/query";

const { Tool, SelectionManager, Interactor } = IG;

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");

console.log(trajectoryInteractor);

function registerDragTool() {
  Tool.register("DragTool2", {
    selectionManager: SelectionManager.initialize("PointSelectionManager"),
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
        dragCommand: (e) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        dragCommand: (e) => e.y,
      },
    ],
  });
}

export default registerDragTool;
