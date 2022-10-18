class Target {
  /**
   * Creates a target with a specified location.
   * @param {number[]} pos - position of target in meters
   */
  constructor(pos) {
    this.pos = pos; // m
  }

  /**
   * Create a target positioned between the min and max in both the x and y
   * direction.
   * @param {number} min - minimum x and y position in meters
   * @param {number} max - maximum x and y position in meters
   * @returns randomly positioned target
   */
  static randomBetween(min, max) {
    const x = Math.random() * (min + max) - min;
    const y = Math.random() * (min + max) - min;

    return new Target([x, y]);
  }

  /**
   * Basic illustration of a target. Adds a label if it is defined. Draws
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {string|undefined} label
   */
  draw(ctx, canvas, label) {
    ctx.save();
    const y = this.pos[1] * SCALE_FACTOR;
    const x = this.pos[0] * SCALE_FACTOR;

    const yMod = canvas.height - y;

    if (label !== undefined) {
      ctx.font = "24px serif";
      ctx.fillText(label, x, yMod - 10);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, yMod, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}
