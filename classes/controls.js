class Controls {
  constructor() {
    this.left = false;
    this.right = false;

    this.#addKeyboardListeners();
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
      switch (e.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "a":
        case "A":
          if (!simulation) break;
          if (simulation.intervalId) stopAnimation();
          else startAnimation();
          break;
        case "b":
        case "B":
          startTraining();
          break;
        case "f":
        case "F":
          startSelfDriveDrone();
          break;
        case "m":
        case "M":
          openMainMenu();
          break;
        case "s":
        case "S":
          stopTraining();
        case "t":
        case "T":
          openTrainingMenu();
          break;
      }
    };
  }
}
