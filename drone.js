class Drone {
  /**
   * @param {Brain} brain
   * @param {Target} target
   * @param {number[][]} boundaries
   */
  constructor(brain, target, boundaries) {
    // CONSTS
    this.WIDTH = 100; // pixels
    this.HEIGHT = 30; // pixels
    this.MASS = 0.4; // kg
    // prettier-ignore
    // this.i = (2 * (this.mass / 2) * Math.pow(0.3 / 2, 2)); // Moment of Inertia Kgm^2
    // Experimentally found - calculation doesn't feel right
    this.I = 20; // kgm2
    // https://droneomega.com/drone-motor-essentials/
    this.MOTOR_THRUST = 9.81 / 2; // N
    this.BOUNDARIES = boundaries || [
      [-200, 1000],
      [-200, 1000],
    ];

    // DYNAMICS VARS
    this.pos = [0, 0]; // pixels
    this.velocity = [0, 0]; // ms-1
    this.theta = 0; // rad
    this.omega = 0; // rads-1

    // CONTROL(ish)
    this.motorThrottle = [0, 0]; // ratio
    this.active = true;

    // AGGEG METRICS
    this.activeTime = 0; // aggregation of the time spent active
    this.distanceTraveled = 0;
    this.distanceTime = 0; // product of time and distance
    this.numberOfTargetsReached = 0;
    this.timeStepsAtTarget = 0;

    if (brain) {
      this.brain = brain;
    } else {
      this.brain = new Brain();
    }

    /** @type {Control} */
    this.controls = null;
    /** @type {Target} */
    this.target = target || new Target([0, 0]);

    this.reset();
  }

  /**
   * Resets a drones aggregates controls and dynamic variables.
   */
  reset() {
    this.#resetAggregates();
    this.#resetControls();
    this.#resetDynamicVariables();
  }

  /**
   * Updates the drone for the time step dt. Steps include:
   * - Calculating motorThrottle (either from brain or controls)
   * - Resolving the forces on the drone
   * - Moving the drone and applying dynamics
   * - Calculating the aggregated metrics
   * @param {number} dt - time step in milliseconds
   */
  update(dt) {
    if (this.controls) {
      this.motorThrottle = [
        this.controls.left ? 1 : 0,
        this.controls.right ? 1 : 0,
      ];
    } else if (this.brain) {
      this.motorThrottle = this.brain.calculateThrottle([
        (this.target.pos[0] - this.pos[0]) / 1e3,
        (this.target.pos[1] - this.pos[1]) / 1e3,
        this.velocity[0] / 1e3,
        this.velocity[1] / 1e3,
        this.theta,
        this.omega,
      ]);
    }

    this.#move(dt);

    this.#aggregatedMetrics(dt);
  }

  /**
   * Takes two drones and creates a child. This simply uses the `brain.mate`
   * method. No other drone attribute change during "mating".
   * @param {Drone} partner - other drone to "mate" with
   * @returns {Drone} the offspring of the two drones
   */
  mate(partner) {
    const childBrain = this.brain.mate(partner.brain);
    const child = new Drone(childBrain);

    return child;
  }

  /**
   * Update the drone's current target and increments the targets reached
   * counter.
   * TODO: consider moving onto the simulation.
   * @param {Target} target - new target
   */
  setTarget(target) {
    this.target = target;
    this.numberOfTargetsReached += 1;
    this.timeStepsAtTarget = 0;
  }

  /**
   * Basic illustration of a drone. Adds a label if it is defined. Draws "motor"
   * exhaust "flame" (just an orange block). The size of the "flame" depends on
   * the motor motorThrottle.
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {string|undefined} label
   */
  draw(ctx, canvas, label) {
    ctx.save();

    // drone frame triangle
    ctx.beginPath();

    // wrap the x-axis
    const xMod =
      (this.pos[0] % canvas.width) + (this.pos[0] < 0 ? canvas.width : 0);
    // inverse the y axis
    const yMod = canvas.height - this.pos[1];
    ctx.translate(xMod, yMod);
    ctx.rotate(this.theta);

    if (label !== undefined) {
      ctx.font = "24px serif";
      ctx.fillText(label, 0, -4);
      ctx.fillStyle = "black";
      ctx.fill();
    }

    ctx.moveTo(0, 0);
    ctx.lineTo(this.WIDTH / 2, this.HEIGHT);
    ctx.lineTo(-this.WIDTH / 2, this.HEIGHT);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // central circle
    ctx.beginPath();
    ctx.arc(0, 15, 15, Math.PI, -Math.PI, true);
    ctx.fill();
    // central red eye
    ctx.beginPath();
    ctx.arc(0, 15, 5, Math.PI, -Math.PI, true);
    ctx.fillStyle = "red";
    ctx.fill();

    // draw motor
    for (let index = 0; index < 2; index++) {
      // prettier-ignore
      const side = (index + 1) % 2 == 0;
      const x = ((this.WIDTH - 10) * (side ? 1 : -1)) / 2;
      const y = this.HEIGHT / 2 + 4;
      const width = side ? 7 : -7;
      const height = this.HEIGHT / 2;

      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fillStyle = "black";
      ctx.fill();

      // draw throttle indicator
      if (this.motorThrottle[index] !== 0) {
        ctx.beginPath();
        ctx.rect(
          x,
          this.HEIGHT + 4,
          width * this.motorThrottle[index],
          height * this.motorThrottle[index]
        );
        ctx.fillStyle = "orange";
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Calculates the distance to the target.
   */
  get distanceFromTarget() {
    return addSquares(
      this.target.pos[0] - this.pos[0],
      this.target.pos[1] - this.pos[1]
    );
  }

  get fitness() {
    return this.activeTime;
  }

  get speed() {
    return addSquares(this.velocity[0], this.velocity[1]);
  }

  /**
   * Updates the aggregated metrics for the given time step.
   * @param {number} dt - time step in milliseconds
   */
  #aggregatedMetrics(dt) {
    this.activeTime += dt;
    this.distanceTraveled += this.speed * dt;
    this.distanceTime += this.distanceFromTarget * dt;
  }

  #resolveForces() {
    let springForce = [0, 0];

    if (this.spring) {
      springForce = this.spring.calculateForce();
    }

    const force = [
      GRAVITY[0] * this.MASS +
        springForce[0] +
        this.MOTOR_THRUST * this.motorThrottle[0] * Math.sin(this.theta) +
        this.MOTOR_THRUST * this.motorThrottle[1] * Math.sin(this.theta),
      GRAVITY[1] * this.MASS +
        springForce[1] +
        this.MOTOR_THRUST * this.motorThrottle[0] * Math.cos(this.theta) +
        this.MOTOR_THRUST * this.motorThrottle[1] * Math.cos(this.theta),
    ]; // N

    return force;
  }

  #calculateTorque() {
    return (
      (this.WIDTH / 2) * this.MOTOR_THRUST * this.motorThrottle[0] -
      (this.WIDTH / 2) * this.MOTOR_THRUST * this.motorThrottle[1]
    ); // Nm
  }

  #move(dt) {
    // do nothing if dt is NaN
    if (isNaN(dt)) return;

    // convert dt into seconds
    const dt_s = dt / 1000;

    let force = this.#resolveForces();
    for (let dim = 0; dim < 2; dim++) {
      this.velocity[dim] += (force[dim] / this.MASS) * dt_s;
      // multiple by 50 to convert 500 pixels into 10m
      this.pos[dim] = this.pos[dim] + this.velocity[dim] * dt_s * 50;
    }

    this.omega += (this.#calculateTorque() / this.I) * dt_s;
    this.theta += this.omega * dt_s;

    // TODO: basic collision needs improving
    if (
      this.pos[0] < this.BOUNDARIES[0][0] ||
      this.pos[0] > this.BOUNDARIES[0][1] ||
      this.pos[1] < this.BOUNDARIES[1][0] ||
      this.pos[1] > this.BOUNDARIES[0][1]
    ) {
      this.velocity = [0, 0];
      this.motorThrottle = [0, 0];
      this.omega = 0;
      this.active = false;
      this.distanceTime = Infinity;
    }
  }

  #resetAggregates() {
    this.activeTime = 0;
    this.distanceTraveled = 0;
    this.distanceTime = 0;
    this.numberOfTargetsReached = 0;
    this.timeStepsAtTarget = 0;
  }

  #resetControls() {
    this.motorThrottle = [0.21, 0.21];
    this.active = true;
  }

  #resetDynamicVariables() {
    this.pos = [250, 250];
    this.velocity = [0, 0];
    this.theta = 0;
    this.omega = 0;
  }
}
