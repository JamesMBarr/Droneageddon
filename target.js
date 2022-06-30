class Target {
  /**
   * Creates a target with a specified location.
   * @param {number[]} pos - position of target
   */
  constructor(pos) {
    this.pos = pos;
  }

  /**
   * Basic illustration of a target. Adds a label if it is defined. Draws
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {string|undefined} label
   */
  draw(ctx, canvas) {
    const yMod = canvas.height - this.pos[1];

    ctx.arc(this.pos[0], yMod, 5, 0, 2 * Math.PI);
  }
}
