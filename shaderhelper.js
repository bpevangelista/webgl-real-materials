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
var efw = efw || {};
efw.shaderHelper = efw.shaderHelper || {};

efw.shaderHelper.parseDefines = function(defines)
{
	// Defines are split with spaces
	var listDefines = defines.split(' ');
	var result = '';
	
	for (var i=0; i<listDefines.length; i++)
	{
		if (listDefines[i].length > 2 && listDefines[i].substring(0, 2) == '-D')
		{
			var keyAndValue = listDefines[i].split('=');
						 
			if (keyAndValue.length == 1)
			{
				result += '#define ' + keyAndValue[0].substring(2) + '\r\n';
			}
			else if (keyAndValue.length == 2)
			{
				result += '#define ' + keyAndValue[0].substring(2) + ' ' + keyAndValue[1] + '\r\n';
			}
			else
			{
				// Invalid
				console.log("Invalid parsing!");
			}
		}
	}
	result += '\r\n';
	
	//console.log(result);
	return result;
}

efw.shaderHelper.compileShaderWithDefines = function(shaderSource, shaderType, defines)
{
	var shaderSourceCopy = this.parseDefines(defines) + shaderSource;
	return this.compileShader(shaderSourceCopy, shaderType);
}


efw.shaderHelper.compileShader = function(shaderSource, shaderType)
{
	var shader = gl.createShader(shaderType);
	if (!shader) return null;
	
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == false)
	{
		var lines = shaderSource.split(/[\r][\n]/);
		for (var i=0; i<lines.length; i++)
			lines[i] = '' + (i+1) + ': ' + lines[i];
			
		console.log("Shader source:\n" + lines.join('\r\n'));
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
