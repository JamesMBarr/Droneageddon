/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");
droneCanvas.width = 1500;
droneCanvas.height = 500;

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
  drone.draw(droneCtx);

  if (spring) {
    spring.draw(droneCtx);
  }

  requestAnimationFrame(animate);
}
