# Droneageddon

Droneageddon is a simple drone simulator which uses reinforcement learning to
train drones to track targets!

Try it yourself at: https://droneageddon-381bc.web.app/

## Getting Started

Start development server by:

```bash
npm run dev
```

To deploy:

```bash
npm run login # to login into the firebase CLI
npm run deploy # to deploy local files
```

## Improvements
 - Define a proper fitness/cost function which penalise motor flickering
 - Experiment using multiple web workers for training
 - Store and plot generation stats
 - Refactor the drone repository to handle multiple pre-trained
 - Add tests 😂
 - Do some reading on ML 🤣

## Known Bugs
 - Red eye missing from the simulation animation in all but the last drone
 - Local storage contains other keys which cannot be parsed when loading the
   pre-saved drones
