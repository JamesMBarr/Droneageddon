class Simulation {
  constructor() {
    this.numberPerGeneration = 10000;
    this.numberToDraw = 10;
    this.generation = 0;
    this.previousTime = 0;

    // start with random drones
    this.drones = [];
    for (let i = 0; i < this.numberPerGeneration; i++) {
      this.drones.push(new Drone());
    }

    this.activeDrones = this.drones;
  }

  animate(time) {
    droneCtx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

    const dt = time - this.previousTime;
    this.previousTime = time;

    this.activeDrones = this.drones.filter((d) => d.active);

    if (this.activeDrones.length > 10) {
      for (let i = 0; i < this.activeDrones.length; i++) {
        const drone = this.activeDrones[i];
        drone.update(dt);

        // only draw x number of drones
        if (i < this.numberToDraw) {
          drone.draw(droneCtx, droneCanvas);
        }
      }
    } else {
      this.startNextGeneration();
    }
  }

  calculateNextGeneration() {
    const number10Percentage = Math.round(0.1 * this.numberPerGeneration);
    // next generation contains top 10% of the current generation
    const nextGeneration = [...this.sortedDrones].splice(0, number10Percentage);

    // reinitialise drone from the previous generation
    for (const drone of nextGeneration) {
      drone.initialise();
    }

    // // populate 10% of the population from new drones
    // for (let i = 0; i < 0; i++) {
    //   nextGeneration.push(new Drone());
    // }

    // get the top XX% of the population
    const top50Percentage = [...this.sortedDrones].splice(
      0,
      Math.round(0.5 * this.numberPerGeneration)
    );

    // populate the remaining with mates from the top XX%
    // parents are selected random
    // TODO: make the probability of selection depend on the fitness
    for (let i = 0; i < this.numberPerGeneration - nextGeneration.length; i++) {
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

  // start generation of drones
  startNextGeneration() {
    console.log(this.generation, this.sortedDrones[0].fitness);
    const nextGeneration = this.calculateNextGeneration();
    this.drones = nextGeneration;
    this.activeDrones = nextGeneration;
    this.generation++;
  }

  get sortedDrones() {
    return this.drones.sort((a, b) => b.fitness - a.fitness);
  }
}
