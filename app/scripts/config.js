export default {
  scene: {
    background: 0xEEEEEE
  },

  camera: {
    position: {
      x: 123.8665535136857,
      y: 674.1277619982702,
      z: 52.578232537239
    },
    near: 1,
    far: 1000
  },

  fog: {
    density: 0.01,
    near: 1,
    far: 10,
    active: false
  },

  control: {
    FPS: 1, // "firstPerson"
    ORBIT: 2,
    type: 2,
    speed: 100
  },

  cards: {
    grid: {
      size: 19
    },
    width: 14/20,
    height: 9/20,
    widthSegments: 7,
    heightSegments: 5,

    position: {
      x: 0,
      y: 500,
      z: 0
    },

    translation: {
      spread: 1,
      intensity: 40,
      speed: 1,
      bounding: 20
    },

    rotation: {
      spread: 1,
      intensity: 100,
      speed: 0.5
    },

    bending: {
      spread: 1,
      intensity: 0.1,
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
