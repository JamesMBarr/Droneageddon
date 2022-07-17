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

let simulation = null;
const simulationWorker = new Worker("./workers/simulationWorker.js");
simulationWorker.onmessage = function (e) {
  switch (e.data.type) {
    case "STOPPED":
      simulation = Simulation.formWorker(e.data.simulation);
      enableButton("#animation-button");
      break;
    case "GENERATION_TRAINED":
      gen = e.data.stats.gen;
      maxNumberOfTargetsReached = e.data.stats.maxNumberOfTargetsReached;
      setGenStats();
      break;
    default:
      break;
  }
};
simulationWorker.onmessageerror = function (event) {
  console.error("Simulation worker => ", event);
};
