class Simulation {
  constructor() {
    this.GENERATION_SIZE = 1000;
    this.NUMBER_TO_DRAW = 10;
    this.TIME_STEP = 16; // ms

    // TARGET
    this.NUMBER_OF_GENERATIONS = 10;
    this.TARGET_FITNESS = 1 * 60 * 1e3;
    this.NUMBER_OF_DRONES_AT_TARGET = 10;

    this.generation = 0; // counter
    this.intervalId = 0;

    // start with random drones
    this.drones = [];
    for (let i = 0; i < this.GENERATION_SIZE; i++) {
      this.drones.push(new Drone());
    }
    // moving this into a getter causes performance issues
    this.activeDrones = this.drones;
  }

  /**
   * Train the a series of generations of drones until the target fitness is
   * reached.
   */
  train() {
    // while (this.activeDrones[0].fitness < this.TARGET_FITNESS) {
    while (this.generation < this.NUMBER_OF_GENERATIONS) {
      if (this.activeDrones.length > this.NUMBER_OF_DRONES_AT_TARGET) {
        for (let i = 0; i < this.activeDrones.length; i++) {
          const drone = this.activeDrones[i];
          drone.update(this.TIME_STEP);
        }
        this.activeDrones = this.activeDrones.filter((d) => d.active);
      } else {
        this.#startNextGeneration();
      }
    }
  }

  /**
   * Starts an animation drawing the top NUMBER_TO_DRAW drones.
   */
  startAnimation() {
    // only want to draw the top NUMBER_TO_DRAW
    this.activeDrones = this.activeDrones.splice(0, this.NUMBER_TO_DRAW);
    this.intervalId = setInterval(() => this.#frame(), this.TIME_STEP);
  }

  stopAnimation() {
    clearInterval(this.intervalId);
  }

  /**
   * Draws the frame. This clears the context and draws the
   * Simulation.numberToDraw drones.
   */
  #frame() {
    console.log(this.activeDrones.length);
    droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

    for (
      let i = 0;
      i < Math.min(this.NUMBER_TO_DRAW, this.activeDrones.length);
      i++
    ) {
      const drone = this.activeDrones[i];
      drone.update(this.TIME_STEP);
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

    const top50Percentage = this.#selectTopPercentage(0.5);
    // populate the remaining generation from child from the top 50% drones
    // TODO: make the probability of selection depend on the fitness
    for (let i = 0; i < this.GENERATION_SIZE - nextGeneration.length; i++) {
      const parent1 =
        top50Percentage[Math.floor(Math.random() * top50Percentage.length)];
      const parent2 =
        top50Percentage[Math.floor(Math.random() * top50Percentage.length)];

      const child = parent1.mate(parent2);
      child.brain.mutate();

      nextGeneration.push(parent1.mate(parent2));
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
    console.log(this.generation, this.sortedDrones[0].fitness);
    const nextGeneration = this.#calculateNextGeneration();
    this.drones = nextGeneration;
    this.activeDrones = this.drones;
    this.generation++;
  }

  /**
   * Current generation of drones ordered by the drone fitness.
   */
  get sortedDrones() {
    return this.drones.sort((a, b) => b.fitness - a.fitness);
  }
}
