class Brain {
  constructor() {
    this.numberOfInputs = 6;
    this.numberOfOutputs = 2;
    this.numberOfNodesInHiddenLayers = [8];
    this.numberOfHiddenLayers = this.numberOfNodesInHiddenLayers.length;

    this.weights = [];
    this.bias = [];
    this.nodeValues = [];

    this.mutationRate = 0.01;

    this.#initialiseWeightsAndBias();
  }

  /**
   * Initalise the weights and bias to zero.
   */
  #initialiseWeightsAndBias() {
    // loop over all the layers
    for (let layer = 0; layer < this.numberOfHiddenLayers + 1; layer++) {
      const layerWeights = [];
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.numberOfInputs
          : this.numberOfNodesInHiddenLayers[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.numberOfNodesInHiddenLayers.length
          ? this.numberOfOutputs
          : this.numberOfNodesInHiddenLayers[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        layerWeights.push(
          this.#generateRandomWeightAndBias(numberOfNodesInPreviousLayer)
        );
      }

      this.nodeValues.push(
        this.#generateRandomWeightAndBias(numberOfInCurrentLayer)
      );
      this.bias.push(this.#generateRandomWeightAndBias(numberOfInCurrentLayer));

      this.weights.push(layerWeights);
    }
  }

  #generateRandomWeightAndBias(length) {
    return this.#generateRandomArray(length, -2, 2);
  }

  #generateRandomArray(length, min, max) {
    return Array.from({ length }, () => Math.random() * (max - min) + min);
  }

  /**
   * Calculates the output of the neural network given the inputs.
   * @param {Array<number>} inputs
   */
  #feedForward(inputs) {
    if (inputs.length !== this.numberOfInputs) {
      throw Error(`Number of inputs must be ${this.numberOfInputs}`);
    }

    // loop over all the layers
    for (let layer = 0; layer < this.numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.numberOfInputs
          : this.numberOfNodesInHiddenLayers[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.numberOfHiddenLayers
          ? this.numberOfOutputs
          : this.numberOfNodesInHiddenLayers[layer];

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

  #activation(z) {
    return Math.tanh(z);
  }

  calculateThrottle(inputs) {
    const outputs = this.#feedForward(inputs);
    // normalise output between 0-1
    return [(outputs[0] + 1) / 2, (outputs[1] + 1) / 2];
  }

  /**
   * Mate two brains and randomly select the weights and bias from either parent.
   * @param {Brain} partner
   */
  mate(partner) {
    const child = new Brain();

    for (let layer = 0; layer < this.numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.numberOfInputs
          : this.numberOfNodesInHiddenLayers[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.numberOfNodesInHiddenLayers.length
          ? this.numberOfOutputs
          : this.numberOfNodesInHiddenLayers[layer];

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
    for (let layer = 0; layer < this.numberOfHiddenLayers + 1; layer++) {
      const numberOfNodesInPreviousLayer =
        layer == 0
          ? this.numberOfInputs
          : this.numberOfNodesInHiddenLayers[layer - 1];

      const numberOfInCurrentLayer =
        layer == this.numberOfNodesInHiddenLayers.length
          ? this.numberOfOutputs
          : this.numberOfNodesInHiddenLayers[layer];

      // loop over all the nodes in the layer
      for (let node = 0; node < numberOfInCurrentLayer; node++) {
        for (
          let inputNode = 0;
          inputNode < numberOfNodesInPreviousLayer;
          inputNode++
        ) {
          // prettier-ignore
          this.weights[layer][node][inputNode] += ((Math.random() * 2) - 1) * this.mutationRate
        }

        this.bias[layer][node] += (Math.random() * 2 - 1) * this.mutationRate;
      }
    }
  }
}
