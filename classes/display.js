class Display {
  constructor(drone) {
    this.drone = drone;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.font = "50px serif";

    const speed = this.drone.statics["speed"].toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    ctx.fillText(`speed:  ${speed} m/s`, 10, 200);

    ctx.restore();
  }
}
