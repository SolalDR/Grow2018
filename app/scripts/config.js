export default {
  postprocessing: {
    active: true,
    opacity: 0.7,
    threshold: 1,
    step: 0.007,
    sigma: 1000,
    color: "#ffffff"
  },
  intro: {
    active: true
  },
  heightmap: {
    active: false,
    debug: false,
    ratio: 100
  },
  forest: {
    generative: false
  },
  colors: {
    background: "#EFEFEF",
    lightDirectionnal: "#ffffff",
    lightPointer: "#FFFFFF",
    mapBuilding: "#ffffff",
    mapBuildingEmissive: "#CCCCCC",
    mapFloor: "#FFFFFF",
    mapFloorEmissive: "#CCCCCC"
  },

  camera: {
    position: {
      x: -673 - 1200,
      y: 800,
      z: 3157 - 1200
    },
    phi: -Math.PI/2,
    theta: 0,
    fov: 45 ,
    near: 5,
    far: 2500
  },

  fog: {
    density: 0.0025,
    near: 800,
    far: 2200,
    active: true
  },

  control: {
    FPS: 1, // "firstPerson"
    ORBIT: 2,
    CUSTOM: 3,
    type: 3,
    speed: 100,
    far: true,
    boundaries: {
      minimum: {
        x: -1000,
        y: 300,
        z: -1000
      },
      maximum: {
        x: 1000,
        y: 2000,
        z: 1000
      }
    }
  },

  cards: {
    grid: {
      size: 8
    },
    width: 14/7,
    height: 9/7,
    ratio: 14/9,
    widthSegments: 7,
    heightSegments: 5,

    position: {
      x: -633 - 1200,
      y: 800,
      z: 3157 - 1200
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
    debug: false,
    elevation: 50,
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
    },
    cameraFocusDist: {
      landscape: 45,
      portrait: 55
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


