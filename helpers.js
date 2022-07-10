/**
 * @param {number} x
 * @param {number} y
 * @returns sqrt(x^2 + y^2)
 */
const addSquares = (x, y) => Math.sqrt(x ** 2 + y ** 2);

/** Generates a random string as an ID */
const generateId = () => Math.random().toString(16).slice(2);
