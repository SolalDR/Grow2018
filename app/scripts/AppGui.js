export default {
  init: function(app){
    var c = app.config;
    var gui = app.gui;



    var colors = gui.addFolder("colors");

    colors.addColor(c.colors, "background").onChange( (value) => {
      app.scene.background = new THREE.Color(value)
      app.scene.fog.color = new THREE.Color(value)
    });

    colors.addColor(c.colors, "lightDirectionnal").onChange( (value) => app.directionalLight.color = new THREE.Color(value));
    colors.addColor(c.colors, "lightPointer").onChange( (value) => app.pointerLight.color = new THREE.Color(value));
    colors.addColor(c.colors, "mapBuilding").onChange((value)=>{
      app.map.tiles.forEach(tile => {
        tile.mesh.material.color = new THREE.Color(value);
      })
    });

    colors.addColor(c.colors, "mapBuildingEmissive").onChange((value)=>{
      app.map.tiles.forEach(tile => {
        tile.mesh.material.emissive = new THREE.Color(value);
      })
    });

    colors.addColor(c.colors, "mapFloor").onChange( (value) => app.map.floor.material.color = new THREE.Color(value));
    colors.addColor(c.colors, "mapFloorEmissive").onChange( (value) => app.map.floor.material.emissive = new THREE.Color(value));

    // colors.addColor(config, "lightPointer").onChange( (value) => app.pointerLight.color = new THREE.Color(value));
    // colors.addColor(config, "lightPointer").onChange( (value) => app.pointerLight.color = new THREE.Color(value));
    // colors.addColor(config, "lightPointer").onChange( (value) => app.pointerLight.color = new THREE.Color(value));



  }
}
