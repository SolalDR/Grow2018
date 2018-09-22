attribute float vertexDisplacement;
uniform float delta;
uniform float time;
uniform float startTime;
uniform float duration;
varying float vOpacity;
varying vec3 vUv;

float quarticOut(float t) {
  return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}

void main() 
{
    vUv = position;

    vec3 p = position;

    // anim vars
    float startValue = - vertexDisplacement * 0.13 + cos(delta);
    float endValue = cos(vertexDisplacement * 5.0) * cos(delta) * 0.2;

    // progress
    float progress = clamp(time - startTime, 0.0, duration) / duration;
    float easeProgress = quarticOut(progress);

    // opacity
    vOpacity = easeProgress + cos(vertexDisplacement) * 0.1;

    // anim vertices positions
    p.z += mix(startValue, endValue, easeProgress); // vertexDisplacement * cos(delta); 
    p.y += cos(delta);
    //p.z =  vertexDisplacement;
   

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
}