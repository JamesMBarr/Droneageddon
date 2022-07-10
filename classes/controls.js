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
        case "m":
        case "M":
          openMenu();
          break;
        case "f":
        case "F":
          startSelfDriveDrone();
          break;
      }
    };
  }
}
