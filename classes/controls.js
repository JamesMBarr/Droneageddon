class Controls {
  constructor() {
    this.left = false;
    this.right = false;
    this.mouseListener = null;

    this.drone = null;

    this.currentMenu = "#menu";
    this.handleMouseMoveFunc = (e) => this.#handleMouseMove(e);

    this.#addKeyboardListeners();
  }

  openCurrentMenu() {
    this.#showBySelector(this.currentMenu);
  }

  closeAllMenus() {
    this.closeMainMenu();
    this.closeTrainingMenu();
    this.closeLoadMenu();
  }

  openMainMenu() {
    this.#openMenu("#menu");
    this.#hideBySelector(".top-controls");
  }

  closeMainMenu() {
    this.#hideBySelector("#menu");
    this.#showBySelector(".top-controls");
  }

  openTrainingMenu() {
    this.#openMenu("#training-menu");
  }

  closeTrainingMenu() {
    this.#hideBySelector("#training-menu");
  }

  openLoadMenu() {
    droneRepo.loadTable();
    this.#openMenu("#load-menu");
  }

  closeLoadMenu() {
    this.#hideBySelector("#load-menu");
  }

  enablePostTrainingButtons() {
    this.#enableButton("#animation-button");
    this.#enableButton("#save-button");
  }

  /**
   * Messages the worker to start training and updates button status.
   */
  handleStartTraining() {
    this.#disableButton("#animation-button");
    this.#disableButton("#save-button");
    simulationWorker.postMessage("TRAIN");
    this.setTrainingStatus("Training...");
  }

  /**
   * Messages the worker to stop training
   */
  handlePauseTraining() {
    simulationWorker.postMessage("STOP");
    this.setTrainingStatus("Paused");
  }

  /**
   * Starts the animation of the simulation and closes the training menu.
   */
  handleStartAnimation() {
    if (!simulation) return;

    simulation.startAnimation();
    this.closeTrainingMenu();
  }

  /**
   * Stops the animation of the simulation and opens the training menu.
   */
  handleStopAnimation() {
    if (!simulation) return;

    simulation.stopAnimation();
    this.openTrainingMenu();
  }

  /**
   * Saves the highest scoring drone from the simulation to repository.
   */
  handleSave() {
    const drone = simulation.sortedDrones[0];
    droneRepo.save(drone);

    this.setTrainingStatus("Saved");
  }

  /**
   * Loads a drone from the repository using the drone ID, adds a mouse move event
   * listener and updates the drone target to the mouse position.
   * @param {string} droneId - identifier of drone
   */
  handleLoad(droneId) {
    this.drone = droneRepo.load(droneId);

    if (!this.drone) return;

    this.drone.resetControlsAndVariables();
    this.#addMouseListener(this);
    this.drone.startAnimation();
    this.#hideBySelector("#load-menu");
  }

  /**
   * Deletes drone from the repository and updates the load table.
   * @param {string} droneId - identifier of drone
   */
  handleDelete(droneId) {
    droneRepo.delete(droneId);
    droneRepo.loadTable();
  }

  /**
   * Updates the training generation statistics from global variables.
   * @param {object} stats - stats object from the simulation
   */
  setGenStats(stats) {
    this.#setInnerHTML(".stats #stat-gen .value", stats.gen);
    this.#setInnerHTML(
      ".stats #stat-target .value",
      stats.maxNumberOfTargetsReached
    );
  }

  /** Sets the training status */
  setTrainingStatus(html) {
    this.#setInnerHTML("#status .value", html);
  }

  /**
   * Starts a self drive drone using the keyboards mappings in
   * #addKeyboardListeners.
   */
  startSelfDriveDrone() {
    this.closeMainMenu();

    this.drone = new Drone(undefined, controls);
    this.drone.startAnimation();
  }

  /**
   * Stops the self drive drone, loaded drone and the simulation training.
   */
  stopAll() {
    if (this.drone !== null) {
      this.drone.stopAnimation();
      this.drone = null;
    }

    if (simulation !== null) {
      simulation.stopAnimation();
    }

    if (this.mouseListener !== null) {
      this.#removeMouseListener();
    }

    this.handlePauseTraining();
  }

  #addMouseListener() {
    this.mouseListener = document.addEventListener(
      "mousemove",
      this.handleMouseMoveFunc
    );
  }

  #removeMouseListener() {
    document.removeEventListener("mousemove", this.handleMouseMoveFunc);
    this.mouseListener = null;
  }

  /**
   * Handle a mouse move event.
   * @param {MouseEvent} e - mouse event
   */
  #handleMouseMove(e) {
    if (!this.drone) {
      console.warn("No drone defined");
      this.#removeMouseListener();
      return;
    }

    const x = e.clientX / SCALE_FACTOR;
    const y = (droneCanvas.height - e.clientY) / SCALE_FACTOR;

    this.drone.target = new Target([x, y]);
  }

  #addKeyboardListeners() {
    document.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
      }
    };
    document.onkeyup = (e) => {
      switch (e.key.toUpperCase()) {
        case "ARROWLEFT":
          this.left = false;
          break;
        case "ARROWRIGHT":
          this.right = false;
          break;
        case "A":
          if (!simulation) break;
          if (simulation.intervalId) this.handleStopAnimation();
          else this.handleStartAnimation();
          break;
        case "B":
          this.handleStartTraining();
          break;
        case "F":
          this.startSelfDriveDrone();
          break;
        case "L":
          this.openLoadMenu();
          break;
        case "M":
          this.openMainMenu();
          break;
        case "P":
          this.handlePauseTraining();
          break;
        case "S":
          this.handleSave();
        case "T":
          this.openTrainingMenu();
          break;
      }
    };
  }

  #openMenu(selector) {
    this.closeAllMenus();
    this.currentMenu = selector;
    this.stopAll();
    this.#showBySelector(selector);
  }

  #enableButton(selector) {
    const animationButton = document.querySelector(selector);
    animationButton.removeAttribute("disabled");
  }

  #disableButton(selector) {
    const animationButton = document.querySelector(selector);
    animationButton.setAttribute("disabled", "true");
  }

  /**
   * Gets element using the CCS selector and sets the inner HTML.
   * @param {string} selector - CSS selector
   * @param {string} html - value to be set to the inner HTML
   */
  #setInnerHTML(selector, html) {
    const element = document.querySelector(selector);
    element.innerHTML = html;
  }

  /**
   * Shows HTML element by removing the "hide" class.
   * @param {string} selector - CCS selector
   */
  #showBySelector(selector) {
    const item = document.querySelector(selector);
    item.classList.remove("hide");
  }

  /**
   * Hides HTML element by adding the "hide" class.
   * @param {string} selector - CCS selector
   */
  #hideBySelector(selector) {
    const item = document.querySelector(selector);
    item.classList.add("hide");
  }
}
