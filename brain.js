class Brain {
  constructor() {
    this.numberOfInputs = 3;
    this.numberOfOutputs = 2;
    this.numberOfNodesInHiddenLayers = [4];
    this.numberOfHiddenLayers = this.numberOfNodesInHiddenLayers.length;

    this.weights = [];
    this.bias = [];
    this.nodeValues = [];

    this.mutationRate = 0.1;

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
        layerWeights.push(new Array(numberOfNodesInPreviousLayer).fill(0));
      }

      this.nodeValues.push(new Array(numberOfInCurrentLayer).fill(0));
      this.bias.push(new Array(numberOfInCurrentLayer).fill(0));
      this.weights.push(layerWeights);
    }
  }

  /**
   * Calculates the output of the neural network given the inputs.
   * @param {Array<number>} inputs
   */
  feedForward(inputs) {
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

        this.nodeValues[layer][node] = this.activation(nodeValue);
      }
    }

    return this.nodeValues[this.weights.length - 1];
  }

  activation(z) {
    return Math.tanh(z);
  }

  calculateThrust(inputs) {
    const outputs = this.feedForward(inputs);
    // normalise output between 0-1
    return [(outputs[0] + 1) / 2, (outputs[1] + 1) / 2];
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
