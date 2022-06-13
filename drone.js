const GRAVITY = [0, 9.81];

class Drone {
  constructor() {
    this.pos = [100, 100];
    this.velocity = [0, 20];
    this.width = 30;
    this.height = 30;
    this.mass = 0.4; //Kg
  }

  /** @param {CanvasRenderingContext2D} ctx */
  update() {
    this.#move();
    this.spring.height = this.pos[1];
  }

  #move() {
    const springForce = this.spring.calculateForce();

    for (let dim = 0; dim < 2; dim++) {
      const force = GRAVITY[dim] * this.mass - springForce[dim];
      this.velocity[dim] += force * 0.01;
      this.pos[dim] = this.pos[dim] + this.velocity[dim];
    }

    if (this.pos[1] > 500 - this.height / 2) {
      this.pos[1] = 500 - this.height / 2;
      this.velocity = [0, 0];
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(
      this.pos[0] - this.width / 2,
      this.pos[1] - this.height / 2,
      this.width,
      this.height
    );
    ctx.fill();

    ctx.restore();
  }
}
