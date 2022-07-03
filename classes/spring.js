class Spring {
  constructor(drone) {
    this.pos = [250, 0];
    this.baseLength = 200;
    this.height = this.baseLength;
    this.width = 10;
    this.k = 1; // Nm-1
    this.c = 3; //damping

    this.drone = drone;
    this.drone.pos[0] = this.pos[0];
    this.drone.pos[1] = this.baseLength;

    drone.spring = this;
  }

  calculateForce() {
    return [
      0,
      (this.drone.pos[1] - this.baseLength) * this.k +
        this.drone.velocity[1] * this.c,
    ];
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(
      this.pos[0] - this.width / 2,
      this.pos[1],
      this.width,
      this.height
    );
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.restore();
  }
}
