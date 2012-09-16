// Global variable for OpenGL
var gl;
var glExtensions = [];

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
		alert("Your browser doesn't support WebGL!\nPlease, try the latest version of Firefox, Chrome or Safari.");
	}
	
	if (gl) {
		gl = WebGLDebugUtils.makeDebugContext(gl);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		
		// Grab available extensions
		glExtensions.push( gl.getExtension("WEBGL_compressed_texture_s3tc") ||
			gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") );
		console.log(glExtensions);
		
		if (glExtensions[0] == null)
		{
			alert("Your browser supports WebGL but does NOT support compressed textures!\nPlease, try the latest version of Firefox, Chrome or Safari.");
			gl = null;
		}
	}
}


function compileShader(shaderSource, shaderType)
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


function linkShader(vertexShader, fragmentShader)
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
