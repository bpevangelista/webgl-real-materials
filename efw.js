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

// Browser compatibility layer
window.requestAnimFrame = ( function() {
	return window.requestAnimationFrame 
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback) { window.setTimeout(callback, 1000.0/60.0); }
})();
window.cancelRequestAnimFrame = ( function() {
	return window.cancelAnimationFrame
    	|| window.webkitCancelRequestAnimationFrame
		|| window.mozCancelRequestAnimationFrame
		|| window.oCancelRequestAnimationFrame
		|| window.msCancelRequestAnimationFrame
        || clearTimeout
} )();


// OpenGL
var gl;
var glExtensions = [];

// Evangelista framework
var efw = efw || {};
efw.application = function() {
var self = this;

// User configurations
// ----------------------------------------------------------------------------------------------------
this.configs = this.configs || {};
this.configs.webGLDebugEnabled = false;
this.configs.fpsCounterEnabled = false;
this.configs.maxUpdateIterations = 3;
this.configs.desiredElapsedTime = 32;

// User attributes
// ----------------------------------------------------------------------------------------------------
this.inputs = this.inputs || {};
this.inputs.mouse = this.inputs.mouse || {};
this.inputs.mouse.isPressed = [false, false, false];
this.inputs.mouse.position = [0, 0];
this.inputs.mouse.positionDelta = [0, 0];
this.inputs.mouse.wheelDelta = 0;
this.fpsStats = { 'updateFps': 0, 'updateTimeMs': 0, 'drawFps': 0, 'drawTimeMs': 0 };

// User defined methods
// ----------------------------------------------------------------------------------------------------
this.loadContent = null;
this.initializeContent = null;
this.update = null;
this.draw = null;

// General
var gIsInitialized = false;

// Canvas
var gCanvas = null;

// Events
var gMouse = {};
var gLastMouse = {};
var gMouseWrite = {};
gMouse.isPressed = [false, false, false];
gMouse.position = [0, 0];
gMouse.wheelDelta = 0;
gLastMouse.isPressed = [false, false, false];
gLastMouse.position = [0, 0];
gLastMouse.wheelDelta = 0;
gMouseWrite.isPressed = [false, false, false];
gMouseWrite.position = [0, 0];
gMouseWrite.wheelDelta = 0;

// FPS Counter
var gUpdateFps = 0;
var gDrawFps = 0;
var gUpdateTimeMs = 0;
var gDrawTimeMs = 0;

// Timer
var gAnimationFrameRequest = null;
var gPreviousTime = 0;
var gElapsedTime = 0;

var initializeWebGL = function()
{
	try {
		gl = gCanvas.getContext("webgl")
			|| gCanvas.getContext("experimental-webgl");
	} 
	catch (e) {
		return false;
	}
	
	if (gl) {
		if (self.configs.webGLDebugEnabled && typeof WebGLDebugUtils != 'undefined')
		{
			console.log("*** WebGLDebugUtils is enabled");
			gl = WebGLDebugUtils.makeDebugContext(gl);
		}
		self.resizeCanvas();
		
		// Grab available extensions
		glExtensions.push( gl.getExtension("WEBGL_compressed_texture_s3tc") ||
			gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || 
			gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") );
		//console.log(glExtensions);
		
		if (gl.compressedTexImage2D != null)
		{
			gl.COMPRESSED_RGBA_S3TC_DXT1_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT1_EXT;
			gl.COMPRESSED_RGBA_S3TC_DXT3_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT3_EXT;
			gl.COMPRESSED_RGBA_S3TC_DXT5_EXT = glExtensions[0].COMPRESSED_RGBA_S3TC_DXT5_EXT;
			gl.COMPRESSED_RGB_S3TC_DXT1_EXT = glExtensions[0].COMPRESSED_RGB_S3TC_DXT1_EXT;
		}
	}
	
	return true;
}

var initialize = function()
{	
	// Add event listeners
	gCanvas.addEventListener('mouseout', onMouseOut, false);
	gCanvas.addEventListener('mousedown', function(e) { gMouseWrite.isPressed[e.button] = true; onMouseMove(e); mouseUpdate(); mouseUpdate(); /*console.log(e)*/ }, false);
	gCanvas.addEventListener('mouseup', function(e) { gMouseWrite.isPressed[e.button] = false; /*console.log(e)*/ }, false);
	gCanvas.addEventListener('mousemove', onMouseMove, false);
	gCanvas.addEventListener('mousewheel', onMouseWheel, false);
	gCanvas.addEventListener('DOMMouseScroll', onMouseWheelFirefox, false);

	self.initializeContent();	
	gIsInitialized = true;
}

var waitForAsyncContent = function(functionPtr)
{
	if (gAsyncLoading == 0)
		functionPtr();
	else
		setTimeout(function() { waitForAsyncContent(functionPtr); }, 2000);
}

var mainLoop = function()
{
	gAnimationFrameRequest = requestAnimFrame(mainLoop);
		
	var currentTime = new Date().getTime();
	gElapsedTime += currentTime - gPreviousTime;
	gPreviousTime = currentTime;
	//console.log(gElapsedTime);
	
	// Calculate required loop count
	var requiredUpdateCount = Math.floor(gElapsedTime / self.configs.desiredElapsedTime);
	var loopCount = Math.min( requiredUpdateCount, self.configs.maxUpdateIterations);
	if (requiredUpdateCount > 0)
		gElapsedTime = 0;

	// Input handling
	updateInput();

	// Update
    var updateStartTime = new Date().getTime();
	for (var i=0; i < loopCount; i++)
    {
		self.update(self.configs.desiredElapsedTime*0.001);
		gUpdateFps++;
    }
	gUpdateTimeMs += new Date().getTime() - updateStartTime;
       
    // Draw
    var drawStartTime = new Date().getTime();
    if (requiredUpdateCount >= 1 && requiredUpdateCount <= 2)
    {
		self.draw(self.configs.desiredElapsedTime*0.001);
		gDrawFps++;
	}
	gDrawTimeMs += new Date().getTime() - drawStartTime;
}

var updateFps = function()
{
	setTimeout(updateFps, 1000);
	if (self.configs.fpsCounterEnabled)
	{
		gUpdateFps = Math.max(gUpdateFps, 1);
		gDrawFps = Math.max(gDrawFps, 1);
		
		self.fpsStats = { 'updateFps': gUpdateFps, 'updateTimeMs': (gUpdateTimeMs/gUpdateFps).toFixed(3),
			'drawFps': gDrawFps, 'drawTimeMs': (gDrawTimeMs/gDrawFps).toFixed(3) };
	
		gUpdateFps = 0;
		gDrawFps = 0;
		gUpdateTimeMs = 0;
		gDrawTimeMs = 0;
	}
}


// Input handling
// ------------------------------------------------------------------------------------------
var updateInput = function() {
	mouseUpdate();
}
var mouseUpdate = function() {
	gLastMouse.isPressed = gMouse.isPressed;
	gLastMouse.position = gMouse.position;
	gLastMouse.wheelDelta = gMouse.wheelDelta;
	
	gMouse.isPressed = gMouseWrite.isPressed;
	gMouse.position = gMouseWrite.position;
	gMouse.wheelDelta = gMouseWrite.wheelDelta;
	
	// Clear write wheel delta
	gMouseWrite.wheelDelta = 0;
	
	// Copy out
	self.inputs.mouse.isPressed = gMouse.isPressed;
	self.inputs.mouse.position = gMouse.position;
	self.inputs.mouse.wheelDelta = gMouse.wheelDelta;

	// Calculate current position delta
	self.inputs.mouse.positionDelta = [ gMouse.position[0] - gLastMouse.position[0],
		gMouse.position[1] - gLastMouse.position[1] ];

}
var onMouseOut = function(e) {
	gMouseWrite.isPressed = [false, false, false];
}
var onMouseMove = function(e) {
	gMouseWrite.position = [e.clientX, e.clientY];
}
var onMouseWheel = function(e) {
	gMouseWrite.wheelDelta = e.wheelDelta;
}
var onMouseWheelFirefox = function(e) {
	gMouseWrite.wheelDelta = e.detail*-40;
}

// Public visible methods
// ------------------------------------------------------------------------------------------
this.resizeCanvas = function()
{
	var desiredWidth = (window.innerWidth+31) & ~31;
	var desiredHeight = (window.innerHeight+31) & ~31;
	gCanvas.width = desiredWidth;
	gCanvas.height = desiredHeight;
	gl.viewportWidth = desiredWidth;
	gl.viewportHeight = desiredHeight;
	//console.log("Canvas [" + canvas.width + "px, " + canvas.height + "px]");
}

this.start = function(canvas)
{
	if (typeof canvas == 'undefined' || canvas == null)
		return false;
	
	if (typeof this.loadContent != 'function'
		|| typeof this.initializeContent != 'function'
		|| typeof this.update != 'function'
		|| typeof this.draw != 'function' )
	{
		console.log('Error! You must implement the following methods:');
		console.log('efw.application.loadContent\n');
		console.log('efw.application.initializeContent\n');
		console.log('efw.application.update\n');
		console.log('efw.application.draw\n');
	}
	
	gCanvas = canvas;
	if (!initializeWebGL())
		return false;

	this.loadContent();	
	waitForAsyncContent(initialize);
	
	return true;
}

this.run = function()
{
	// Wait for the initialization to finish
	if (!gIsInitialized)
	{
		setTimeout(self.run, 2000);
		return;
	}
	
	// Start update fps
	setTimeout(updateFps, 1000);
	
	// Start main loop
	gPreviousTime = new Date().getTime();
	gAnimationFrameRequest = requestAnimFrame(mainLoop);
}

} // application