const GRAVITY = [0, 9.81];

class Drone {
  constructor() {
    this.pos = [100, 100];
    this.velocity = [5, -5];
    this.width = 100;
    this.height = 30;
    this.mass = 0.4; //Kg
  }

  /** @param {CanvasRenderingContext2D} ctx */
  update(dt) {
    this.#move(dt);

    if (this.spring) {
      this.spring.height = this.pos[1];
    }
  }

  #move(dt) {
    if (isNaN(dt)) return;

    let springForce = [0, 0];

    if (this.spring) {
      springForce = this.spring.calculateForce();
    }

    for (let dim = 0; dim < 2; dim++) {
      let force = GRAVITY[dim] * this.mass - springForce[dim];

      this.velocity[dim] += force * 0.001 * dt;
      this.pos[dim] = this.pos[dim] + this.velocity[dim];
    }

    if (this.pos[1] > 500 - this.height) {
      this.pos[1] = 500 - this.height;
      this.velocity = [0, 0];
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.translate(this.pos[0], this.pos[1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.lineTo(-this.width / 2, this.height);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 15, 15, Math.PI, -Math.PI, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 15, 5, Math.PI, -Math.PI, true);
    ctx.fillStyle = "red";
    ctx.fill();

    for (let index = 0; index < 2; index++) {
      const side = index % 2 == 0;
      ctx.beginPath();
      ctx.rect(
        ((this.width - 10) * (side ? 1 : -1)) / 2,
        this.height / 2 + 4,
        side ? 7 : -7,
        this.height / 2
      );
      ctx.fillStyle = "black";
      ctx.fill();
    }

    ctx.restore();
  }
}
