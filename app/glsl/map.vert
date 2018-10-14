const vec4 lightDiffuse = vec4(0.,0., 0., 1.);
const vec4 lightSpecular = vec4(1., 1., 1., 1.);
const vec4 lightAmbient = vec4(0.,0., 0., 1.);
const vec4 materialDiffuse = vec4(1., 1., 1., 1.);
const vec4 materialSpecular = vec4(1., 1., 1., 1.);
const vec4 materialAmbient = vec4(0.2, 0.2, 0.2, 1.);
const vec4 materialEmission = vec4(.0, .0, .0, 1.);
const float materialShininess = 30.0;

uniform sampler2D u_map;
uniform vec3 u_emissive;
uniform vec3 u_color;


varying vec4 outputColor;
varying vec2 vUv;

void main (void)
{
  vec3 vertex_normal = normalize(normalMatrix * vec3(normal));
  vec3 cameraSpaceVertexPos = vec3(modelViewMatrix * vec4(position, 1.));
  vec3 lightDir = normalize(vec3(0., -1., 0.));
  float intensity = max(dot(vertex_normal, lightDir), 0.0);
  vec4 diffuse, ambient, globalAmbient, specular = vec4(0.0);

  vec3 color = texture2D(u_map, uv).xyz;
  vUv = uv;

  diffuse = lightDiffuse * materialDiffuse;
  if (intensity > 0.0) {
     // Blinn-Phong Shading : getting the half-vector, a vector with a direction half-way between
     // the eye vector and the light vector. OpenGL doesn't compute it for us anymore
     // H = Eye - L so we have to compute the vertex to eye vector
     vec3 eyeVector = -cameraSpaceVertexPos; // in eye space, eye is at (0,0,0)
     vec3 halfVector = normalize(eyeVector - lightDir);
     float NdotHV = max(dot(vertex_normal, halfVector), 0.0);
    // Calculating the Blinn-Phong specular component
     specular = pow(NdotHV, materialShininess) * materialSpecular * lightSpecular;
  }
  ambient = materialAmbient * lightAmbient + vec4(u_emissive, 1.);
  outputColor = intensity * diffuse + ambient + specular;
  outputColor.w = 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
