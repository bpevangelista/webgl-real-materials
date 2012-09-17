// Global variable for OpenGL
var gl;
var glExtensions = [];

var efw = efw || {};
efw.shaderHelper = efw.shaderHelper || {};

/* http://paulirish.com/2011/requestanimationframe-for-smart-animating/ */
window.requestAnimFrame = ( function() {
	return window.requestAnimationFrame 
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback) { window.setTimeout(callback, 1000.0/60.0); }
})();


function initializeGL(canvas)
{
	try {
		gl = canvas.getContext("webgl")
			|| canvas.getContext("experimental-webgl");
	} 
	catch (e) { 
		alert("Your browser doesn't support WebGL! Please, try the latest version of Firefox, Chrome or Safari.");
	}
	
	if (gl) {
		//gl = WebGLDebugUtils.makeDebugContext(gl);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		
		// Grab available extensions
		glExtensions.push( gl.getExtension("WEBGL_compressed_texture_s3tc") ||
			gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || 
			gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") );
		console.log(glExtensions);
		
		if (gl.compressedTexImage2D != null)
		{
			gl.COMPRESSED_RGBA_S3TC_DXT1_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT1_EXT;
			gl.COMPRESSED_RGBA_S3TC_DXT3_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT3_EXT;
			gl.COMPRESSED_RGBA_S3TC_DXT5_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT5_EXT;
			gl.COMPRESSED_RGB_S3TC_DXT1_EXT = glExtensions[0].COMPRESSED_RGB_S3TC_DXT1_EXT;
		}
		else
		{
			alert("Your browser supports WebGL but doesn't support compressed textures! We will fallback to non-compressed textures but that will be slow...");
		}
	}
}


efw.shaderHelper.compileShader = function(shaderSource, shaderType)
{
	var shader = gl.createShader(shaderType);
	if (!shader) return null;
	
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == false)
	{
		console.log("Shader source:\n" + shaderSource);
		console.error("Error compiling shader:\n" + gl.getShaderInfoLog(shader));
		
		gl.deleteShader(shader);
		shader = null;
	}
		
	return shader;
}


efw.shaderHelper.linkShader = function(vertexShader, fragmentShader)
{
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (gl.getProgramParameter(program, gl.LINK_STATUS) == false)
	{
		console.error("Error linking shader programs: " + vertexShader + " and " + fragmentShader);

		gl.deleteProgram(program);
		program = null;
	}
	
	return program;
}
