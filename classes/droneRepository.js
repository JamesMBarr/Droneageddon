class DroneRepository {
  constructor() {
    this.preloadedDrone = Drone.fromWorker(JSON.parse(preloadedDroneData));
    this.storagePrefix = "drone-"
  }

  loadPreloadedTable() {
    let html = `<tr>
      <th>Name</th>
      <th>Targets Reached</th>
      <th>Actions</th>
    </tr>`;

    html += `<tr>
      <td>Flicky</td>
      <td>${this.preloadedDrone.numberOfTargetsReached}</td>
      <td><button onclick="controls.handleLoad('${this.preloadedDrone.id}')">Load</button></td>
    </tr>`;

    document.querySelector("#preload-table").innerHTML = html;
  }

  /**
   * Creates and populates the table of previously saved drones.
   * Fetches the saves from local storage.
   */
  loadTable() {
    let html = `<tr>
      <th>Save Date</th>
      <th>Targets Reached</th>
      <th>Actions</th>
    </tr>`;

    const saves = [];

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      // exclude local storage items not starting with expected key
      if (!key.startsWith(this.storagePrefix)) {
        continue
      }

      const droneData = JSON.parse(localStorage.getItem(key));
      saves.push(droneData);
    }

    for (const droneData of saves.sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt)
    )) {
      html += `<tr>
        <td>${droneData.savedAt}</td>
        <td>${droneData.numberOfTargetsReached}</td>
        <td><button onclick="controls.handleLoad('${droneData.id}')">Load</button><button onclick="controls.handleDelete('${droneData.id}')">Delete</button></td>
      </tr>`;
    }

    document.querySelector("#load-table").innerHTML = html;
  }

  /**
   * Saves the drone to the repository.
   * @param {Drone} drone - drone to be saved
   */
  save(drone) {
    const now = new Date(Date.now());

    localStorage.setItem(
      this.storagePrefix + drone.id,
      JSON.stringify({ ...drone, savedAt: now.toISOString() })
    );

    console.log(`Drone saved: ${drone.id}`);
  }

  /**
   * Loads drones from repository.
   * @param {string} id - identifier of the drone to be loaded
   * @returns drone if one has matching identifier, otherwise returns null
   */
  load(id) {
    if (this.preloadedDrone.id === id) {
      return this.preloadedDrone;
    }

    const contents = localStorage.getItem(this.storagePrefix + id);

    if (contents === null) {
      console.warn(`No drone found with the matching identifier: ${id}`);
      return null;
    }

    const drone = Drone.fromWorker(JSON.parse(contents));
    console.log("Successfully loaded drone", drone);

    return drone;
  }

  /**
   * Deletes drone from repository.
   * @param {string} id - identifier of drone to be delete from repository
   */
  delete(id) {
    localStorage.removeItem(id);
  }
}
