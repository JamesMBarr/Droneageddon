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
  draw(ctx, canvas, label) {
    ctx.save();
    const yMod = canvas.height - this.pos[1];

    if (label !== undefined) {
      ctx.font = "24px serif";
      ctx.fillText(label, this.pos[0], yMod - 10);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.pos[0], yMod, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}
