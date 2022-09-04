/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");

droneCanvas.width = window.innerWidth;
droneCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  droneCanvas.width = window.innerWidth;
  droneCanvas.height = window.innerHeight;
});

const droneCtx = droneCanvas.getContext("2d");
const controls = new Controls();
const droneRepo = new DroneRepository();

let simulation = null;
const simulationWorker = new Worker("./workers/simulationWorker.js");
simulationWorker.onmessage = function (e) {
  console.log(`Worker listener received message: ${e.data.type}`);

  switch (e.data.type) {
    case "STOPPED":
      const simulationData = e.data.simulation;
      simulation = Simulation.formWorker(simulationData);

      if (simulationData.gen > 0) {
        controls.enablePostTrainingButtons();
      }
      break;
    case "GENERATION_TRAINED":
      controls.setGenStats(e.data.stats);
      break;
    default:
      break;
  }
};
simulationWorker.onmessageerror = function (event) {
  console.error("Simulation worker => ", event);
};
