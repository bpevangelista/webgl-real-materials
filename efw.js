/**
 * Copyright (C) 2012 Bruno P. Evangelista. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
// Global variable for OpenGL
var gl;
var glExtensions = [];

var efw = efw || {};
efw.shaderHelper = efw.shaderHelper || {};


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
	var loadingHud = document.getElementById("loading-hud");
	var messageHud = document.getElementById("message-hud");

	try {
		gl = canvas.getContext("webgl")
			|| canvas.getContext("experimental-webgl");
	} 
	catch (e) {
		loadingHud.style.color = "#CC0000";
		loadingHud.innerHTML = "Your browser does not support WebGL!<br/>Please, try the latest version of Firefox, Chrome or Safari.";
	}
	
	if (gl) {
		gl = WebGLDebugUtils.makeDebugContext(gl);
		var desiredWidth = (window.innerWidth+31) & ~31;
		var desiredHeight = (window.innerHeight+31) & ~31;
		canvas.width = desiredWidth;
		canvas.height = desiredHeight;
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		//console.log("Canvas [" + canvas.width + "px, " + canvas.height + "px]");
		
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
			messageHud.style.color = "yellow";
			messageHud.innerHTML = "Your browser supports WebGL but doesn't support compressed textures!<br/>We will fallback to non-compressed textures but that will be slow...";
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
