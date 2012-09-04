// Global variable for OpenGL
var gl;

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
		alert("Your browser don't support WebGL!");
	}
	
	if (gl) {
		gl = WebGLDebugUtils.makeDebugContext(gl);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
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
