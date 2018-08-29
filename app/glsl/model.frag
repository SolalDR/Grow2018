precision lowp float;

uniform sampler2D img_recto;
uniform sampler2D img_verso;


varying float vFragDepth;
varying vec2 vCoords;
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vNormal;
 

void main() {
  float depth = log2(vFragDepth) * 0.1;

	float step = 1./19.;
	vec4 color;

	color = texture2D(img_recto, vec2(
		vUv.x * step + vCoords.x/19.,
		vUv.y * step + vCoords.y/19.
	));

  // color = vec4(depth, depth, depth, 1.);
	// } else {
	// 	color = texture2D(img_verso, vec2(
	//   		vUv.x * step + vCoords.x/19.,
	//   		vUv.y * step + vCoords.y/19.
	//   	));
	// }


	// if(color.r < 0.1 && color.g < 0.1){
	// 	color.a = 0.;
	// }

  gl_FragColor = color;
}