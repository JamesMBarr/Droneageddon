class Drone {
  /**
   * @param {Brain} brain
   * @param {Target} target
   * @param {number[][]} boundaries
   */
  constructor(brain, controls) {
    this.id = generateId();

    // CONSTS
    this.WIDTH = 100; // pixels
    this.HEIGHT = 30; // pixels
    this.MASS = 0.4; // kg
    // prettier-ignore
    // this.i = (2 * (this.MASS / 2) * Math.pow(0.3 / 2, 2)); // Moment of Inertia Kgm^2
    // Experimentally found - calculation doesn't feel right
    this.I = 10; // kgm^2
    // https://droneomega.com/drone-motor-essentials/
    this.MOTOR_THRUST = 9.81 / 2; // N
    this.BOUNDARIES = [
      [-5000, 5000],
      [-5000, 5000],
    ];
    this.GRAVITY = [0, -9.81];

    // DYNAMICS VARS
    this.pos = [250, 250]; // pixels
    this.velocity = [0, 0]; // ms-1
    this.theta = 0; // rad
    this.omega = 0; // rads-1

    // CONTROL(ish)
    this.motorThrottle = [0, 0]; // ratio
    this.motorAngle = [0, 0];
    this.active = true;

    // AGGEG METRICS
    this.activeTime = 0; // aggregation of the time spent active
    this.totalDistanceTraveled = 0; // total distance traveled by drone
    this.distanceFromTargetTime = 0; // product of time and distance
    this.numberOfTargetsReached = 0;
    this.timeAtTarget = 0;

    // ANIMATIONS
    this.intervalId = null;
    this.TIME_STEP = 16;

    if (brain) {
      /** @type {Brain} */
      this.brain = brain;
    } else {
      this.brain = new Brain();
    }

    /** @type {Control} */
    this.controls = controls;
    /** @type {Target} */
    this.target = new Target([0, 0]);
  }

  /**
   * Reconstructs a drone from the data passed back by a Web Worker running a
   * simulation.
   * @param {any} data - drone data from the worker
   * @returns {Drone} clone of the drone
   */
  static fromWorker(data) {
    const brain = new Brain(data.brain.weights, data.brain.bias);
    brain.id = data.brain.id;
    const drone = new Drone(brain);

    drone.id = data.id;
    drone.active = data.active;
    drone.activeTime = data.activeTime;
    drone.totalDistanceTraveled = data.totalDistanceTraveled;
    drone.distanceFromTargetTime = data.distanceFromTargetTime;
    drone.numberOfTargetsReached = data.numberOfTargetsReached;
    drone.timeAtTarget = data.timeAtTarget;

    return drone;
  }

  /**
   * Resets a drones aggregates controls and dynamic variables.
   */
  reset() {
    this.#resetAggregates();
    this.#resetControls();
    this.#resetDynamicVariables();
  }

  resetControlsAndVariables() {
    this.#resetControls();
    this.#resetDynamicVariables();
  }

  startAnimation() {
    // when animating start from the center of the canvas
    this.pos = [droneCanvas.width / 2, droneCanvas.height / 2];
    this.intervalId = setInterval(() => this.#frame(), this.TIME_STEP);
  }

  stopAnimation() {
    clearInterval(this.intervalId);
  }

  /**
   * Updates the drone for the time step dt. Steps include:
   * - Calculating motorThrottle (either from brain or controls)
   * - Resolving the forces on the drone
   * - Moving the drone and applying dynamics
   * - Calculating the aggregated metrics
   * @param {number} dt - time step in milliseconds
   * @param {boolean} updateMetric - whether to update a drones metrics
   */
  update(dt, updateMetric = true) {
    if (this.controls) {
      this.motorThrottle = [
        this.controls.left ? 1 : 0,
        this.controls.right ? 1 : 0,
      ];
    } else if (this.brain) {
      const output = this.brain.calculateDroneControls([
        (this.target.pos[0] - this.pos[0]) / 1e3,
        (this.target.pos[1] - this.pos[1]) / 1e3,
        this.velocity[0] / 1e3,
        this.velocity[1] / 1e3,
        this.theta,
        this.omega,
      ]);

      this.motorThrottle = [output[0], output[1]];
      this.motorAngle = [output[2], output[3]];
    }

    this.#move(dt, updateMetric);

    if (updateMetric) this.#aggregatedMetrics(dt);
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
    this.timeAtTarget = 0;
  }

  /**
   * Basic illustration of a drone. Adds a label if it is defined. Draws "motor"
   * exhaust "flame" (just an orange block). The size of the "flame" depends on
   * the motor motorThrottle.
   *
   * TODO: fix the coloring issues
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {string|undefined} label
   */
  draw(ctx, canvas, label) {
    ctx.save();

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

    // drone frame triangle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.WIDTH / 2, this.HEIGHT);
    ctx.lineTo(-this.WIDTH / 2, this.HEIGHT);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // central circle
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(0, 15, 15, Math.PI, -Math.PI, true);
    ctx.fill();

    // central red eye
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(0, 15, 5, Math.PI, -Math.PI, true);
    ctx.fill();

    // draw motor
    for (let i = 0; i < 2; i++) {
      ctx.save();
      const side = (i + 1) % 2 == 0 ? 1 : -1;
      ctx.translate((side * this.WIDTH) / 2, this.HEIGHT);
      ctx.rotate(this.motorAngle[i]);
      const width = side * 7;
      const height = this.HEIGHT / 2;

      ctx.fillStyle = "black";
      ctx.fillRect(-width / 2, -height, width, height);

      // draw throttle indicator
      if (this.motorThrottle[i] !== 0) {
        ctx.fillStyle = "orange";
        ctx.fillRect(
          -width / 2,
          0,
          width * this.motorThrottle[i],
          height * this.motorThrottle[i]
        );
      }
      ctx.restore();
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
    this.totalDistanceTraveled += this.speed * dt;
    this.distanceFromTargetTime += this.distanceFromTarget * dt;
  }

  /**
   * Animation frame for a singular drone.
   */
  #frame() {
    droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);
    this.update(this.TIME_STEP);
    this.draw(droneCtx, droneCanvas);

    // if no longer active stop the animation and open menu
    if (!this.active) {
      controls.openMainMenu();
      this.stopAnimation();
    }
  }

  #resolveForces() {
    let springForce = [0, 0];

    if (this.spring) {
      springForce = this.spring.calculateForce();
    }

    const force = [
      this.GRAVITY[0] * this.MASS +
        springForce[0] +
        this.MOTOR_THRUST *
          this.motorThrottle[0] *
          Math.sin(this.theta + this.motorAngle[0]) +
        this.MOTOR_THRUST *
          this.motorThrottle[1] *
          Math.sin(this.theta + this.motorAngle[1]),
      this.GRAVITY[1] * this.MASS +
        springForce[1] +
        this.MOTOR_THRUST *
          this.motorThrottle[0] *
          Math.cos(this.theta + this.motorAngle[0]) +
        this.MOTOR_THRUST *
          this.motorThrottle[1] *
          Math.cos(this.theta + this.motorAngle[1]),
    ]; // N

    return force;
  }

  #calculateTorque() {
    return (
      (this.WIDTH / 2) * this.MOTOR_THRUST * this.motorThrottle[0] -
      (this.WIDTH / 2) * this.MOTOR_THRUST * this.motorThrottle[1]
    ); // Nm
  }

  #move(dt, updateMetric = true) {
    // do nothing if dt is NaN
    if (isNaN(dt)) return;

    // convert dt into seconds
    const dtInSeconds = dt / 1000;

    let force = this.#resolveForces();
    for (let dim = 0; dim < 2; dim++) {
      this.velocity[dim] += (force[dim] / this.MASS) * dtInSeconds;
      // multiple by 50 to convert 500 pixels into 10m
      this.pos[dim] = this.pos[dim] + this.velocity[dim] * dtInSeconds * 50;
    }

    this.omega += (this.#calculateTorque() / this.I) * dtInSeconds;
    this.theta += this.omega * dtInSeconds;

    // TODO: basic collision needs improving
    if (
      this.pos[0] < this.BOUNDARIES[0][0] ||
      this.pos[0] > this.BOUNDARIES[0][1] ||
      this.pos[1] < this.BOUNDARIES[1][0] ||
      this.pos[1] > this.BOUNDARIES[0][1]
    ) {
      this.active = false;

      if (updateMetric) {
        this.velocity = [0, 0];
        this.motorThrottle = [0, 0];
        this.omega = 0;
        this.distanceFromTargetTime = Infinity;
      }
    }
  }

  #resetAggregates() {
    this.activeTime = 0;
    this.totalDistanceTraveled = 0;
    this.distanceFromTargetTime = 0;
    this.numberOfTargetsReached = 0;
    this.timeAtTarget = 0;
  }

  #resetControls() {
    this.motorThrottle = [0.21, 0.21];
    this.motorAngle = [0, 0];
    this.active = true;
  }

  #resetDynamicVariables() {
    this.pos = [250, 250];
    this.velocity = [0, 0];
    this.theta = 0;
    this.omega = 0;
  }
}
