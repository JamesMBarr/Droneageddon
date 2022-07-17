let gen = 0;
let maxNumberOfTargetsReached = 0;
let status = "Not started yet!";
let selfDriveDrone = null;

/**
 * Closes the main menu, stops all other processes and begins the controllable
 * drone animation.
 */
const startSelfDriveDrone = () => {
  closeMainMenu();
  stopAll();

  selfDriveDrone = new Drone(undefined, controls);
  selfDriveDrone.startAnimation();
};

const openMainMenu = () => {
  showBySelector("#menu");
  hideBySelector(".top-controls");
  hideBySelector("#training-menu");
};

const closeMainMenu = () => {
  hideBySelector("#menu");
  showBySelector(".top-controls");
};

const openTrainingMenu = () => {
  closeMainMenu();
  showBySelector("#training-menu");
};

/** Updates the training generation statistics from global variables. */
const setGenStats = () => {
  setInnerHTML(".stats #stat-gen .value", gen);
  setInnerHTML(".stats #stat-target .value", maxNumberOfTargetsReached);
};

/** Sets the training status */
const setTrainingStatus = (html) => {
  setInnerHTML("#status .value", html);
};

const stopAll = () => {
  if (selfDriveDrone !== null) {
    selfDriveDrone.stopAnimation();
  }

  stopTraining();
};

const startTraining = () => {
  disableButton("#animation-button");
  simulationWorker.postMessage("TRAIN");
  setTrainingStatus("Training...");
};

const stopTraining = () => {
  simulationWorker.postMessage("STOP");
  setTrainingStatus("Paused");
};

const startAnimation = () => {
  if (!simulation) return;

  simulation.startAnimation();
  hideBySelector("#training-menu");
  showBySelector(".top-controls .stop");
};

const stopAnimation = () => {
  if (!simulation) return;

  showBySelector("#training-menu");
  hideBySelector(".top-controls .stop");
  simulation.stopAnimation();
};

const enableButton = (selector) => {
  const animationButton = document.querySelector(selector);
  animationButton.removeAttribute("disabled");
};

const disableButton = (selector) => {
  const animationButton = document.querySelector(selector);
  animationButton.setAttribute("disabled", "true");
};

/**
 * Gets element using the CCS selector and sets the inner HTML.
 * @param {string} selector - CSS selector
 * @param {string} html - value to be set to the inner HTML
 */
const setInnerHTML = (selector, html) => {
  const element = document.querySelector(selector);
  element.innerHTML = html;
};

/**
 * Shows HTML element by removing the "hide" class.
 * @param {string} selector - CCS selector
 */
const showBySelector = (selector) => {
  const item = document.querySelector(selector);
  item.classList.remove("hide");
};

/**
 * Hides HTML element by adding the "hide" class.
 * @param {string} selector - CCS selector
 */
const hideBySelector = (selector) => {
  const item = document.querySelector(selector);
  item.classList.add("hide");
};
