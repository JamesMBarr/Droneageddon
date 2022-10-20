importScripts(
  "../classes/simulation.js",
  "../classes/drone.js",
  "../classes/target.js",
  "../classes/brain.js",
  "../helpers.js"
);

/** @type {Simulation} */
const simulation = new Simulation();

self.onmessage = function (e) {
  console.log(`Worker received message: ${e.data}`);

  if (e.data === "TRAIN") {
    simulation.train(() =>
      self.postMessage({
        type: "GENERATION_TRAINED",
        stats: {
          gen: simulation.gen,
          maxNumberOfTargetsReached:
            simulation.sortedDrones[0].numberOfTargetsReached,
        },
      })
    );
  }

  if (e.data === "STOP") {
    simulation.cancelTraining();
    self.postMessage({ type: "STOPPED", simulation });
  }
};
