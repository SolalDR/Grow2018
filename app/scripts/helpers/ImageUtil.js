/**
 * @static
 */
export default {

  /**
   * Return the pixel information in a canvas context from a couple of coords
   * @param  {Context} ctx The canvas context
   * @param  {float} x
   * @param  {float} y
   * @return {Object} Return the datas's image in RGBA format
   */
	getColorAt(ctx, x, y){

		var imgd = ctx.getImageData(x, y, 1, 1);
		return {
			r: imgd.data[0],
			g: imgd.data[1],
			b: imgd.data[2],
			a: imgd.data[3]
		};
	}

}
