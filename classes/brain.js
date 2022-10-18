class Brain {
  constructor(weights, bias) {
    this.id = generateId();

    if ((weights && !bias) || (bias && !weights))
      throw Error(
        "Weight and bias must be both passed to constructor or neither."
      );

    // CONSTS
    this.NUMBER_OF_INPUTS = 6;
    this.NUMBER_OF_OUTPUTS = 4;
    this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS = [12, 6];
    this.MUTATION_RATE = 0.1;
    this.RANDOM_VALUE_LIMIT = 2;

    // NEURAL NETWORK
    this.weights = weights || [];
    this.bias = bias || [];
    this.nodeValues = [];

    if (weights) this.#initialiseValuesOnly();
    else this.#initialiseWeightsAndBias();
  }

  /**
   * Calculate the applied motor throttle from the neural network. The output
   * is normalized between 0-1.
   * @param {numbers[]} inputs - input from the drone as x-position, y-position,
   * x-velocity, y-velocity, theta and omega.
   * @returns {numbers[]} motor throttle as left then right motor
   * @throws if the input array is not the expected length
   */
  calculateDroneControls(inputs) {
    if (inputs.length !== this.NUMBER_OF_INPUTS) {
      throw Error(`Number of inputs must be ${this.NUMBER_OF_INPUTS}`);
    }

    const outputs = this.#feedForward(inputs);

    return [
      // normalise output between 0-1
      (outputs[0] + 1) / 2,
      (outputs[1] + 1) / 2,
      // normalise output between -0.25Math.PI and +0.25Math.PI
      outputs[2] * Math.PI * 0.25,
      outputs[3] * Math.PI * 0.25,
    ];
  }

  /**
   * Mate two brains and randomly select the weights and bias from one of the
   * parent.
   * @param {Brain} partner - other brain to "mate" with
   * @returns {Brain} offspring of the two parent brains
   */
  mate(partner) {
    const child = new Brain();

    for (let layer = 0; layer < this.#numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.NUMBER_OF_INPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS.length
          ? this.NUMBER_OF_OUTPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        for (
          let inputNode = 0;
          inputNode < numberOfNodesInPreviousLayer;
          inputNode++
        ) {
          if (Math.random() > 0.5) {
            child.weights[layer][node][inputNode] =
              this.weights[layer][node][inputNode];
          } else {
            child.weights[layer][node][inputNode] =
              partner.weights[layer][node][inputNode];
          }
        }

        if (Math.random() > 0.5) {
          child.bias[layer][node] = this.bias[layer][node];
        } else {
          child.bias[layer][node] = partner.bias[layer][node];
        }
      }
    }

    return child;
  }

  /**
   * Adds a random offset to both the bias and weights. The magnitude of the
   * offsets is controlled using this.mutationRate.
   */
  mutate() {
    for (let layer = 0; layer < this.#numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.NUMBER_OF_INPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS.length
          ? this.NUMBER_OF_OUTPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        for (
          let inputNode = 0;
          inputNode < numberOfNodesInPreviousLayer;
          inputNode++
        ) {
          // prettier-ignore
          this.weights[layer][node][inputNode] += ((Math.random() * 2) - 1) * this.MUTATION_RATE
        }

        this.bias[layer][node] += (Math.random() * 2 - 1) * this.MUTATION_RATE;
      }
    }
  }

  /**
   * Activation function of the node.
   * @param {number} z - node value
   * @returns {number} output from the node
   */
  #activation(z) {
    return Math.tanh(z);
  }

  /**
   * Calculates the output of the neural network given the inputs.
   * @param {number[]} inputs - values from the drone
   */
  #feedForward(inputs) {
    // loop over all the layers
    for (let layer = 0; layer < this.#numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.NUMBER_OF_INPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.#numberOfHiddenLayers
          ? this.NUMBER_OF_OUTPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer];

      const previousLayerValues =
        layer == 0 ? inputs : this.nodeValues[layer - 1];
      const layerWeights = this.weights[layer];
      const layerBias = this.bias[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        const nodeWeights = layerWeights[node];
        let nodeValue = layerBias[node];

        for (
          let inputNode = 0;
          inputNode < numberOfNodesInPreviousLayer;
          inputNode++
        ) {
          nodeValue += nodeWeights[inputNode] * previousLayerValues[inputNode];
        }

        this.nodeValues[layer][node] = this.#activation(nodeValue);
      }
    }

    return this.nodeValues[this.weights.length - 1];
  }

  /**
   * Generates an array of given length populated with random numbers between
   * -/+ @see Brain.randomValueLimit.
   * @param {number} length - length of array
   * @returns {number[]} array of random numbers
   */
  #generateRandomWeightAndBias(length) {
    return this.#generateRandomArray(
      length,
      -this.RANDOM_VALUE_LIMIT,
      this.RANDOM_VALUE_LIMIT
    );
  }

  /**
   * Generates an array of given length populated with random numbers between
   * the min and max.
   * @param {number} length - length of array
   * @param {number} min - minimum value of number in array
   * @param {number} max - maximum value of number in array
   * @returns {number[]} array of random numbers
   */
  #generateRandomArray(length, min, max) {
    return Array.from({ length }, () => Math.random() * (max - min) + min);
  }

  /**
   * Initalises the node values only to 0.
   */
  #initialiseValuesOnly() {
    // loop over all the layers
    for (let layer = 0; layer < this.#numberOfHiddenLayers + 1; layer++) {
      const numberOfInCurrentLayer =
        layer === this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS.length
          ? this.NUMBER_OF_OUTPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer];

      // set initial node values to 0
      this.nodeValues.push(new Array(numberOfInCurrentLayer).fill(0));
    }
  }

  /**
   * Initalises the weights and bias to a random values given by
   * @see Brain.#generateRandomWeightAndBias.
   */
  #initialiseWeightsAndBias() {
    // loop over all the layers
    for (let layer = 0; layer < this.#numberOfHiddenLayers + 1; layer++) {
      const layerWeights = [];
      const numberOfNodesInPreviousLayer =
        layer === 0
          ? this.NUMBER_OF_INPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer - 1];

      const numberOfInCurrentLayer =
        layer === this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS.length
          ? this.NUMBER_OF_OUTPUTS
          : this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        layerWeights.push(
          this.#generateRandomWeightAndBias(numberOfNodesInPreviousLayer)
        );
      }

      // set initial node values to 0
      this.nodeValues.push(new Array(numberOfInCurrentLayer).fill(0));
      this.bias.push(this.#generateRandomWeightAndBias(numberOfInCurrentLayer));
      this.weights.push(layerWeights);
    }
  }

  get #numberOfHiddenLayers() {
    return this.NUMBER_OF_NODES_IN_HIDDEN_LAYERS.length;
  }
}
