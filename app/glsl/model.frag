precision lowp float;

uniform sampler2D img_recto;
uniform sampler2D img_verso;

uniform float selected_card_rank;

varying vec2 vCoords;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
	vec4 color;

  if(vCoords.x + (18. - vCoords.y)*19. == selected_card_rank && (vUv.x < 0.05 || vUv.x > 0.95 || vUv.y < 0.05 || vUv.y > 0.95)) {
    color = vec4(1., 0., 0., 1.);
  } else if( vNormal.z < 0. ){
		color = texture2D(img_verso, vec2(
			vUv.x/19. + vCoords.x/19.,
			vUv.y/19. + vCoords.y/19.
		));
	} else {
		color = texture2D(img_recto, vec2(
			vUv.x/19. + vCoords.x/19.,
			vUv.y/19. + vCoords.y/19.
		));
	}

  gl_FragColor = color;
}
