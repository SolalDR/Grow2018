import * as THREE from "three";
import vertexShader from "./../../glsl/cloud.vert";
import fragmentShader from "./../../glsl/cloud.frag";

class CloudMaterial {

  constructor({
    circular = true,
    color = 0xFFFFFF,
    zoom = new THREE.Vector3(1, 5, 10),
    speed = new THREE.Vector3(1, 1, 1),
    morphSpeed = new THREE.Vector3(1, 1, 1),
    intensity = new THREE.Vector3(1, 1, 1),
    baseAlpha = 0.1,
    phase = 0
  } = {}){

    var mat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        u_circular: { type: "bool", value: true },
        u_time: { type: "f", value: 0 },
        u_color: { type: "vec3", value: new THREE.Color(color) },
        u_zoom: { type: "v3", value: zoom },
        u_speed: { type: "v3", value: speed },
        u_morphspeed: { type: "v3", value: morphSpeed },
        u_intensity: { type: "v3", value: intensity },
        u_basealpha: { type: "f", value: baseAlpha },
        u_phase: { type: "f", value: phase }
      }
    });

    mat.type = "CloudMaterial"

    return mat;
  }

  static generateGui(name, gui, mesh){
    var folder = gui.addFolder(name);
    var config = {color: "#000", visible: true};

    folder.add(mesh.material.uniforms.u_circular, "value").name("circular");
    folder.add(config, "visible").onChange((value)=>{
      mesh.visible = value
    })
    folder.addColor(config, 'color').onChange((value)=>{
      var c = new THREE.Color(value);
      mesh.material.uniforms.u_color.value.x = c.r;
      mesh.material.uniforms.u_color.value.y = c.g;
      mesh.material.uniforms.u_color.value.z = c.b;
    });

    var zoom = folder.addFolder("zoom")
    var speed = folder.addFolder("lateral speed")
    var morphSpeed = folder.addFolder("morph speed")
    var intensity = folder.addFolder("intensity")
    var baseAlpha = folder.add(mesh.material.uniforms.u_basealpha, "value", 0, 1).name("Base Alpha");
    var phase = folder.add(mesh.material.uniforms.u_phase, "value", 0, 1).name("Phase");

    // folder.add(mesh.material.uniforms.speed, 'speed');
    // folder.add(text, 'noiseStrength');

  }
}

export default CloudMaterial;
