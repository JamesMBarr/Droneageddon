importScripts("../classes/Simulation.js");
importScripts("../classes/Drone.js");
importScripts("../classes/Target.js");
importScripts("../classes/Brain.js");
importScripts("../helpers.js");

/** @type {Simulation} */
const sim = new Simulation();

self.onmessage = function (e) {
  console.log(e);
  if (e.data === "TRAIN") {
    sim.train();
  }

  if (e.data === "STOP") {
    sim.cancelTraining();
    self.postMessage(sim);
  }
};
