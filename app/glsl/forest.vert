attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;
attribute vec3 color;

varying vec2 vUV;
varying vec4 vColor;

const int mode = 2;
const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const vec3 diffuseColor = vec3(0.2, 0.2, 0.2);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
  position *= S;
  position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
  position += T;
  return position;
}

void main(){
  vec3 newPosition = position;
  vUV = uv;
  transform( newPosition, translation, rotation, scale );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  // all following gemetric computations are performed in the
  // camera coordinate system (aka eye coordinates)
  // vec3 normal = vec3(normalMat * vec4(normal, 0.0));
  vec4 vertPos4 = modelViewMatrix * vec4(newPosition, 1.0);
  vec3 vertPos = vec3(vertPos4) / vertPos4.w;
  vec3 lightDir = normalize(lightPos - vertPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  vec3 viewDir = normalize(-vertPos);

  float lambertian = max(dot(lightDir, normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {
    float specAngle = max(dot(reflectDir, viewDir), 0.2);
    specular = pow(specAngle, 4.0);

    // the exponent controls the shininess (try mode 2)
    if(mode == 2)  specular = pow(specAngle, 16.0);

    // according to the rendering equation we would need to multiply
    // with the the "lambertian", but this has little visual effect
    if(mode == 3) specular *= lambertian;
    // switch to mode 4 to turn off the specular component
    if(mode == 4) specular *= 0.0;
  }

  vColor = vec4(lambertian*diffuseColor + specular*specColor, 1.0);
}
