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

const showById = (id) => {
  const item = document.getElementById(id);
  item.classList.remove("hide");
};

const hideById = (id) => {
  const item = document.getElementById(id);
  item.classList.add("hide");
};

const closeMainMenu = () => {
  hideById("menu");
  showById("menu-button");
};

const openMainMenu = () => {
  showById("menu");
  hideById("menu-button");
  hideById("training-menu");
};

const openTrainingMenu = () => {
  closeMainMenu();

  showById("training-menu");
};

let selfDriveDrone = null;
const startSelfDriveDrone = () => {
  closeMainMenu();

  stop();

  selfDriveDrone = new Drone(undefined, controls);
  selfDriveDrone.startAnimation();
};

let simulation = null;
let gen = 0;
let maxNumberOfTargetsReached = 0;

const setStat = (id, value) => {
  const genValue = document.querySelector(`#${id} .value`);
  genValue.innerHTML = value;
};

const setStats = () => {
  setStat("stat-gen", gen);
  setStat("stat-target", maxNumberOfTargetsReached);
};

const simulationWorker = new Worker("./workers/simulationWorker.js");
simulationWorker.onmessage = function (e) {
  switch (e.data.type) {
    case "STOPPED":
      simulation = Simulation.formWorker(e.data.simulation);
      break;
    case "GENERATION_TRAINED":
      gen = e.data.stats.gen;
      maxNumberOfTargetsReached = e.data.stats.maxNumberOfTargetsReached;
      setStats();
      break;
    default:
      break;
  }
};
simulationWorker.onmessageerror = function (event) {
  console.error("Simulation worker => ", event);
};

const startTraining = () => {
  stop();
  simulationWorker.postMessage("TRAIN");
};

const stopTraining = () => {
  simulationWorker.postMessage("STOP");
};

const stop = () => {
  if (selfDriveDrone !== null) {
    selfDriveDrone.stopAnimation();
  }
  stopTraining();
};
