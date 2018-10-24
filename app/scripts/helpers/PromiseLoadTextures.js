/**
 * THREE.TextureLoader promise for multiple textures
 * @param {Array} imgUrls - textures images urls
 * @param {Function} callback - callback when all textures loaded
 */
export default function (imgUrls, callback) {

  const loader = new THREE.TextureLoader();

  let imgPr = [];
  let textures = [];

  // Load textures
  for (var i = 0; i < imgUrls.length; i++) {
    const url = imgUrls[i];
    imgPr.push(new Promise((resolve, reject) => {
      //var loader = new THREE.TextureLoader();
      loader.setCrossOrigin( 'Anonymous');
      let key = i;
      const texture = loader.load( url, () => {
        textures[key] = texture;
        resolve();
      });
    }));
  }

  // Resolve textures loaded
  Promise.all(imgPr).then(() => {
    callback(textures);
  }).catch(function(errtextures) {
    console.error(errtextures)
  });
};
