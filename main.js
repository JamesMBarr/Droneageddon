/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");

droneCanvas.width = window.innerWidth;
droneCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  droneCanvas.width = window.innerWidth;
  droneCanvas.height = window.innerHeight;
});

const droneCtx = droneCanvas.getContext("2d");

const drone = new Drone();
// const spring = new Spring(drone);
const spring = null;

let perviousTime = 0;

animate();

function animate(time) {
  const dt = time - perviousTime;
  perviousTime = time;
  droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

  drone.update(dt);
  drone.draw(droneCtx, droneCanvas);

  if (spring) {
    spring.draw(droneCtx);
  }

  requestAnimationFrame(animate);
}
