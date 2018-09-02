precision lowp float;

uniform sampler2D img_recto;
uniform sampler2D img_verso;


varying vec2 vCoords;
varying vec2 vUv;
varying vec3 vNormal;
 

void main() {
	float step = 1./19.;
	vec4 color;

	if( vNormal.z < 0. ){
		color = texture2D(img_verso, vec2(
			vUv.x * step + vCoords.x/19.,
			vUv.y * step + vCoords.y/19.
		));
	} else {
		color = texture2D(img_recto, vec2(
			vUv.x * step + vCoords.x/19.,
			vUv.y * step + vCoords.y/19.
		));
	}

  gl_FragColor = color;
}