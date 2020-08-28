/* * * * * * * * * * * * * * * * * * * * * * * *
radiation.js
creates a canvas object from the generated jpeg image
onhover determines the rgb values of any pixel within the canvas
* * * * * * * * * * * * * * * * * * * * * * * * */

$("#SolarP").addClass("active");
var ctx = canvas.getContext('2d');

// mantain canvas aspect ratio
$('#canvas').css('width', '80%');

//  create an image object
//  this will be the source for our canvas object
var IMAGE_SOURCE = '/static/radmap/'+session['location']+".jpg" //This is for AWS version
// var IMAGE_SOURCE = 'D:/EC2/RADMapSphereMain_AWS/radmap/'+session['location']+".jpg" //This is for local server only
// console.log ('here is the location', IMAGE_SOURCE)
var TOPIMAGE_SOURCE = "/static/radmap/overlayrad.png"

var img1 = loadImage(IMAGE_SOURCE, main);
var img2 = loadImage(TOPIMAGE_SOURCE, main);
var imagesLoaded = 0;
// const fileName = IMAGE_SOURCE.name;
// console.log(fileName)
function main() {
	imagesLoaded += 1;
	if (imagesLoaded == 2) {
		ctx.drawImage(img1,-240,-146);
		console.log(img1.width,img1.height)
		ctx.globalAlpha = 0.9;
		ctx.drawImage(img2, -5, -6, img2.width * 0.95, img2.height * 0.95)}

		// ctx.canvas.toBlob((blob) => {
  //           const file = new File([blob], fileName, {
  //               type: 'image/jpeg',
  //               lastModified: Date.now()
  //           });
  //       }, 'image/jpeg', 1);
}

function loadImage(src, onload) {
    var img = new Image();
    img.onload = onload;
    img.src = src;
    return img;
}


function colorPick(event) {
	var x = event.clientX;
  	var y = event.clientY;
  	var pixel = ctx.getImageData(
		x - canvas.getBoundingClientRect().x,
		y - canvas.getBoundingClientRect().y, 1, 1);
  	var data = pixel.data;
  	rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')';
	rgbaEnergy = (data[0] + data[1]**(1/3) + data[2]**(1/6));
	EnergyCum = ((rgbaEnergy)*maxRad/265) | 0;
	ElecPV = (EnergyCum*0.2) | 0;
	// PVCount = ((hvac * 500)/(ElecPV*1.5)) | 0

};


// tell the rgb value of a pixel on hover
$("canvas").mousemove(colorPick);
$(document).ready(function(){
	//$("canvas").click(function(){
	$("canvas").mousemove(function(){
		// console.log('rgba from canvas',rgba);
		$("#radval").text(EnergyCum);
		// $("#pvcount").text(PVCount);
        	});
	$("canvas").mouseleave(function(){
		$("#radval").text('hover over canvas');
		// $("#pvcount").text('hover over canvas');
		});
});
