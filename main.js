/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");

droneCanvas.width = window.innerWidth;
droneCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  droneCanvas.width = window.innerWidth;
  droneCanvas.height = window.innerHeight;
});

const droneCtx = droneCanvas.getContext("2d");

const closeMenu = () => {
  const menu = document.getElementById("menu");
  menu.classList.add("hide");

  const menuButton = document.getElementById("menu-button");
  menuButton.classList.remove("hide");
};

const openMenu = () => {
  const menu = document.getElementById("menu");
  menu.classList.remove("hide");

  const menuButton = document.getElementById("menu-button");
  menuButton.classList.add("hide");
};

let selfDriveDrone = null;
const startSelfDriveDrone = () => {
  closeMenu();

  if (selfDriveDrone !== null) {
    selfDriveDrone.stopAnimation();
  }

  const controls = new Controls();
  selfDriveDrone = new Drone(undefined, controls);
  selfDriveDrone.startAnimation();
};


// simulationWorker.postMessage({ message: "train" });
