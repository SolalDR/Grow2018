export default {
  world: {
    timeFactor: 0.00001 
  },
  camera: {
    position: {
      x: 100, 
      y: 100,
      z: 100
    }
  },
  cards: {
    grid: {
      size: 19
    },
    width: 14, 
    height: 9,
    widthSegments: 7,
    heightSegments: 5,

    translation: {
      spread: 1,
      intensity: 40,
      speed: 1
    },
    rotation: {
      spread: 1,
      intensity: 100,
      speed: 0.5
    },
    bending: {
      spread: 1,
      intensity: 20,
      speed: 1000
    }
  }
}

var patterns = {

  // Feels like cards are floating in the air but static in their movements
  cool: {
    translation: {
      spread: 1,
      intensity: 40,
      speed: 1
    },
    rotation: {
      spread: 1,
      intensity: 100,
      speed: 0.5
    }
  },

  // The cards are moving all arround (cool but collision can create bugs)
  chilling: {
    translation: {
      spread: 1,
      intensity: 700,
      speed: 3
    },
    rotation: {
      spread: 1,
      intensity: 100,
      speed: 0.5
    }
  }
}