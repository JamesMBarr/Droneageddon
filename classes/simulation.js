class Simulation {
  constructor() {
    this.GENERATION_SIZE = 1000;
    this.NUMBER_TO_DRAW = 10;
    this.TIME_STEP = 16; // ms

    // TARGET
    this.NUMBER_OF_GENERATIONS = 50;
    this.MAX_DURATION_GENERATION = 120; // s
    this.MIN_DURATION_AT_TARGET = 0.5; // s

    this.intervalId = 0;

    this.generation = 0; // counter
    this.intervalId = 0;

    /**
     * TODO: generate some random points
     * @type {Target[]}
     */
    this.targetSet = [
      new Target([775, 752]),
      new Target([814, 124]),
      new Target([509, 370]),
      new Target([894, 519]),
      new Target([194, 579]),
      new Target([611, 506]),
      new Target([600, 481]),
      new Target([188, 251]),
    ];

    // start with random drones
    this.drones = [];
    for (let i = 0; i < this.GENERATION_SIZE; i++) {
      const drone = new Drone();
      // manually set the target on the drone to prevent increment targets reached
      drone.target = this.targetSet[0];
      this.drones.push(drone);
    }
    // moving this into a getter causes performance issues
    this.activeDrones = this.drones;
  }

  /**
   * @param {Drone} drone
   * @param {boolean} updateMetric - whether to update a drones metrics
   */
  updateDrone(drone, updateMetric) {
    drone.update(this.TIME_STEP, updateMetric);

    if (drone.distanceFromTarget < 10) {
      drone.timeAtTarget += this.TIME_STEP;

      // consider target reached when drone has been within target radius
      // for 0.5 sec
      if (drone.timeAtTarget > this.MIN_DURATION_AT_TARGET * 1e3) {
        drone.setTarget(
          this.targetSet[
            (drone.numberOfTargetsReached + 1) % this.targetSet.length
          ]
        );
      }
    } else {
      drone.timeAtTarget = 0;
    }
  }

  /**
   * Train the a series of generations of drones until interval is cancelled by
   * cancel training. Using interval to allow for cancelling.
   */
  train() {
    this.trainGeneration();

    this.intervalId = setInterval(() => {
      this.#startNextGeneration();
      this.trainGeneration();
    }, 50);
  }

  /**
   * Cancels training once the last generation has been trained.
   */
  cancelTraining() {
    clearInterval(this.intervalId);
  }

  /**
   * Trains a single generation of drones.
   */
  trainGeneration() {
    let generationDuration = 0;

    while (generationDuration < this.MAX_DURATION_GENERATION * 1e3) {
      for (let i = 0; i < this.activeDrones.length; i++) {
        this.updateDrone(this.activeDrones[i]);
      }
      this.activeDrones = this.activeDrones.filter((d) => d.active);
      generationDuration += this.TIME_STEP;
    }
  }

  /**
   * Starts an animation drawing the top NUMBER_TO_DRAW drones.
   */
  startAnimation() {
    // only want to draw the top NUMBER_TO_DRAW
    this.activeDrones = [];
    for (let i = 0; i < this.NUMBER_TO_DRAW; i++) {
      this.activeDrones.push(this.sortedDrones[i]);
    }

    this.intervalId = setInterval(() => this.#frame(), this.TIME_STEP);
  }

  /**
   * Stops the animation and resets the drones controls and variables.
   */
  stopAnimation() {
    clearInterval(this.intervalId);

    // reset the dynamic variables and controls for the drawn drones
    for (let i = 0; i < this.NUMBER_TO_DRAW; i++) {
      this.sortedDrones[i].resetControlsAndVariables();
    }
  }

  /**
   * Draws the frame. This clears the context and draws the
   * Simulation.numberToDraw drones.
   */
  #frame() {
    droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

    // draw targets
    for (let i = 0; i < this.targetSet.length; i++) {
      const target = this.targetSet[i];
      target.draw(droneCtx, droneCanvas, i);
    }

    for (
      let i = 0;
      i < Math.min(this.NUMBER_TO_DRAW, this.activeDrones.length);
      i++
    ) {
      const drone = this.activeDrones[i];
      this.updateDrone(drone, false);
      drone.draw(droneCtx, droneCanvas, i);
    }

    this.activeDrones = this.activeDrones.filter((d) => d.active);

    if (this.activeDrones.length === 0) {
      this.stopAnimation();
    }
  }

  /**
   * Calculates the next generation of drones using a genetic algorithm. Keeps
   * the top 10% and fills the remainder of the generation with the children
   * from the top 50%.
   * @returns {Drone[]} next generation of drones
   */
  #calculateNextGeneration() {
    // next generation contains top 10% of the current generation
    const nextGeneration = this.#selectTopPercentage(0.1);

    // reset drones from the previous generation
    for (const drone of nextGeneration) {
      drone.reset();
    }

    // // fresh blood!
    // for (let i = 0; i < Math.round(this.GENERATION_SIZE * 0.1); i++) {
    //   nextGeneration.push(new Drone());
    // }

    const startingNextGenerationLength = nextGeneration.length;
    const top50Percentage = this.#selectTopPercentage(0.5);
    // populate the remaining generation from child from the top 50% drones
    // TODO: make the probability of selection depend on the fitness
    for (
      let i = 0;
      i < this.GENERATION_SIZE - startingNextGenerationLength;
      i++
    ) {
      const parent1 =
        top50Percentage[Math.floor(Math.random() * top50Percentage.length)];
      const parent2 =
        top50Percentage[Math.floor(Math.random() * top50Percentage.length)];

      const child = parent1.mate(parent2);
      child.brain.mutate();

      nextGeneration.push(child);
    }

    for (const drone of nextGeneration) {
      drone.target = this.targetSet[0];
    }

    return nextGeneration;
  }

  /**
   * Selects the top X drones from the current generation. X given by ratio.
   * @param {number} ratio - percentage of the population between 0-1
   * @returns
   */
  #selectTopPercentage(ratio) {
    const numberOfDrones = Math.round(ratio * this.GENERATION_SIZE);
    return [...this.sortedDrones].splice(0, numberOfDrones);
  }

  /**
   * Starts the next generation and increments the generation counter.
   */
  #startNextGeneration() {
    console.log(this.generation);
    console.log(
      this.sortedDrones[0].active,
      this.sortedDrones[0].numberOfTargetsReached,
      this.sortedDrones[0].distanceFromTargetTime,
      this.sortedDrones[0].activeTime
    );
    console.log(
      this.sortedDrones[1].active,
      this.sortedDrones[1].numberOfTargetsReached,
      this.sortedDrones[1].distanceFromTargetTime,
      this.sortedDrones[1].activeTime
    );
    console.log(
      this.sortedDrones[this.GENERATION_SIZE - 1].active,
      this.sortedDrones[this.GENERATION_SIZE - 1].numberOfTargetsReached,
      this.sortedDrones[this.GENERATION_SIZE - 1].distanceFromTargetTime,
      this.sortedDrones[this.GENERATION_SIZE - 1].activeTime
    );

    this.drones = this.#calculateNextGeneration();
    this.activeDrones = this.drones;
    this.generation++;
  }

  /**
   * Current generation of drones ordered by the drone fitness.
   */
  get sortedDrones() {
    return this.drones.sort(
      (a, b) =>
        b.numberOfTargetsReached - a.numberOfTargetsReached ||
        a.distanceFromTargetTime - b.distanceFromTargetTime ||
        b.activeTime - a.activeTime
    );
  }
}
