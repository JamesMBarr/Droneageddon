/** @type {HTMLCanvasElement} */
const droneCanvas = document.getElementById("droneCanvas");
droneCanvas.width = 500;
droneCanvas.height = 500;

const droneCtx = droneCanvas.getContext("2d");

const drone = new Drone();
const spring = new Spring(drone);

animate();

function animate(time) {
  droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

  drone.update();
  drone.draw(droneCtx);
  spring.draw(droneCtx);
  requestAnimationFrame(animate);
}
