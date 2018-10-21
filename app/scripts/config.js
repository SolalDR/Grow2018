export default {

  heightmap: {
    active: true,
    debug: false,
    ratio: 100
  },

  colors: {
    background: "#EEEEEE",
    lightDirectionnal: "#ffffff",
    lightPointer: "#ffffff",
    mapBuilding: "#ffffff",
    mapBuildingEmissive: "#CCCCCC",
    mapFloor: "#ffffff",
    mapFloorEmissive: "#CCCCCC"
  },

  camera: {
    position: {
      x: -100,
      y: 800,
      z: 100
    },
    phi: -Math.PI/2,
    theta: 0,
    fov: 45 ,
    near: 10,
    far: 1500
  },

  fog: {
    density: 0.0025,
    near: 800,
    far: 1200,
    active: true
  },

  control: {
    FPS: 1, // "firstPerson"
    ORBIT: 2,
    CUSTOM: 3,
    type: 3,
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
      x: -40,
      y: 800,
      z: 100
    },

    curve: {
      spread: 0.2,
      intensity: 200,
      speed: 2,
      distribution: 2
    },

    translation: {
      spread: 0.5,
      intensity: 15,
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
  },

  markers: {
    elevation: 45,
    refs: {
      topLeft: {
        x: -715 - 1300,
        z: 1175 + 1200
      },
      bottomRight: {
        x: 973 - 1300,
        z: 300 + 1200
      }
    },
    grid: {
      size: 20
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


