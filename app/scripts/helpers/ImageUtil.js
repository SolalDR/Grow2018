export default {

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