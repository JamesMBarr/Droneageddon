/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");

droneCanvas.width = window.innerWidth;
droneCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  droneCanvas.width = window.innerWidth;
  droneCanvas.height = window.innerHeight;
});

const droneCtx = droneCanvas.getContext("2d");

let simulation = new Simulation();
let stop = false;

function step(time) {
  if (simulation === null) {
    simulation = new Simulation();
  } else if (simulation && simulation.activeDrones.length > 0) {
    simulation.animate(time);
  }

  if (!stop) {
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
