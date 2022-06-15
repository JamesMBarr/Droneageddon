const GRAVITY = [0, 9.81];

class Drone {
  constructor() {
    this.pos = [250, 400];
    this.velocity = [0, 0];
    this.theta = 0; // rad
    this.omega = 0; // rads-1
    this.width = 100;
    this.height = 30;
    this.mass = 0.4; //Kg
    // prettier-ignore
    this.i = (2 * (this.mass / 2) * (this.width / 2) ^ 2); // Moment of Inertia Kgm^2
    // https://droneomega.com/drone-motor-essentials/
    this.motorThrust = 9.81; // N
    this.motorThrottle = [0.21, 0.2];
  }

  /** @param {CanvasRenderingContext2D} ctx */
  update(dt) {
    this.#move(dt);

    if (this.spring) {
      this.spring.height = this.pos[1];
    }
  }

  resolveForces() {
    let springForce = [0, 0];

    if (this.spring) {
      springForce = this.spring.calculateForce();
    }

    const force = [
      GRAVITY[0] * this.mass -
        springForce[0] +
        this.motorThrust * this.motorThrottle[0] * Math.sin(this.theta) +
        this.motorThrust * this.motorThrottle[1] * Math.sin(this.theta),
      GRAVITY[1] * this.mass -
        springForce[1] -
        this.motorThrust * this.motorThrottle[0] * Math.cos(this.theta) -
        this.motorThrust * this.motorThrottle[1] * Math.cos(this.theta),
    ];

    return force;
  }

  calculateTorque() {
    return (
      (this.width / 2) * this.motorThrust * this.motorThrottle[1] -
      (this.width / 2) * this.motorThrust * this.motorThrottle[0]
    );
  }

  #move(dt) {
    if (isNaN(dt)) return;

    let force = this.resolveForces();
    for (let dim = 0; dim < 2; dim++) {
      this.velocity[dim] += force[dim] * 0.001 * dt;
      // multiple by 500 to convert 500 pixels into 1m
      this.pos[dim] = this.pos[dim] + this.velocity[dim] * 0.001 * dt * 500;
    }

    this.omega += (this.calculateTorque() / this.i) * 0.001 * dt;
    this.theta += this.omega * 0.001 * dt;

    if (this.pos[1] > 500 - this.height) {
      this.pos[1] = 500 - this.height;
      this.velocity = [0, 0];
      this.motorThrottle = [0, 0];
      this.omega = 0;
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.translate(this.pos[0], this.pos[1]);
    ctx.rotate(this.theta);
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
