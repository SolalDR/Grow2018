uniform float delta;
varying float vOpacity;
varying vec3 vUv;

void main() {

    //float c = cos(vUv.x * delta);

    // grey
    float color = cos(vUv.x * delta);

    // rgb 
    //float g = 0.5 + sin(delta) * 0.5;
    //float b = 0.0;
    //vec3 rgb = vec3(r, g, b);

	gl_FragColor = vec4(vec3(color), vOpacity * 0.6);
}