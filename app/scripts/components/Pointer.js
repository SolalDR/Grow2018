const MODE_ACTIVE = 1;
const MODE_STARTING = 2;
const MODE_ENDING = 3;
const MODE_STOPED = 4;

class Pointer {
  constructor(canvas){
    this.ring;
    this.disc;
    this.group;
    this.position;
    this.canvas = canvas;
    this._hover = {intensity: 0};
    this._click = {intensity: 0};
    this._visible = true;
    this.click;
    this.init();
  }

  init(){
    var geometryRing = new THREE.RingGeometry( 6, 7, 32, 32 );
    var geometryDisc = new THREE.CircleGeometry( 5, 32 );

    var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, transparent: true, depthTest: false } );

    this.ring = new THREE.Mesh(geometryRing, material);
    this.disc = new THREE.Mesh(geometryDisc, material);
    this.group = new THREE.Group();
    this.group.name = 'pointer';
    this.group.add(this.ring);
    this.group.add(this.disc);

    this.group.rotation.x = -Math.PI/2;
    this.group.scale.x = 5;
    this.group.scale.z = 5;
    this.group.scale.y = 5;
    this.group.position.y = 50;
    this.position = new THREE.Vector3();
  }


  set hover(value){
    if(this._hover.status != MODE_ACTIVE && value === true ){
      this._hover.status = MODE_ACTIVE;
    } else if( value === false ) {
      this._hover.status = MODE_ENDING;
    }
  }

  set click(value){
    if( value === true ){
      this._click.status = MODE_STARTING;
    } else {
      this._click.status = MODE_ENDING;
    }
  }

  set visible(v) {
    this._visible = v;
    this.hover = v ? this._hover : v;
  }

  get visible() {
    return this._visible;
  }


  set cursor(cursor) {
    this._cursor = cursor;
    this.canvas.style.cursor = cursor;
  }

  get cursor(){
    return this.canvas.style.cursor;
  }


  updateRing(){
    this.ring.scale.x = this._hover.intensity + 1;
    this.ring.scale.y = this._hover.intensity + 1;
  }

  updateDisc(){
    this.disc.position.z = this._click.intensity*5;
  }

  move(point){
    this.position.x = point.x;
    this.position.z = point.z;
  }


  render(time){
    if( this._hover.status === MODE_ACTIVE ){
      this._hover.intensity += (1 - this._hover.intensity) * 0.1
      this.updateRing();
    } else if(this._hover.status === MODE_ENDING) {
      this._hover.intensity += (0 - this._hover.intensity) * 0.1
      this.updateRing();
    }

    // Visibility animation
    if( this._visible === true && this.ring.material.opacity < 1 ){
      this.ring.material.opacity += (1 - this.ring.material.opacity)*0.1;
      if( Math.abs(this.ring.material.opacity - 1) < 0.01 ) {
        this.ring.material.opacity = 1;
      }
      this.ring.material.needsUpdate = true;
    } else if( this._visible === false && this.ring.material.opacity > 0 ) {
      this.ring.material.opacity -= this.ring.material.opacity*0.1;
      if( Math.abs(this.ring.material.opacity) < 0.01 ) {
        this.ring.material.opacity = 0;
      }
      this.ring.material.needsUpdate = true;
    }

    if( this._click.status == MODE_STARTING ){
      this._click.intensity += (1 - this._click.intensity)*0.2;
      if( Math.abs(this._click.intensity) < 0.001 ) this._click.status = MODE_ACTIVE;
      this.updateDisc();
    } else if( this._click.status == MODE_ENDING ) {
      this._click.intensity -= this._click.intensity*0.2;
      if( Math.abs(this._click.intensity) < 0.001 ) this._click.status = MODE_STOPED;
      this.updateDisc();
    }

    this.group.position.x += (this.position.x - this.group.position.x)*0.4;
    this.group.position.z += (this.position.z - this.group.position.z)*0.4;
  }
}

export default Pointer;
