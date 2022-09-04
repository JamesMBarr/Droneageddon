importScripts("../classes/Simulation.js");
importScripts("../classes/Drone.js");
importScripts("../classes/Target.js");
importScripts("../classes/Brain.js");
importScripts("../helpers.js");

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
