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
// Using namespaces
window.vec3 = efw.vec3;
window.mat4 = efw.mat4;
window.shaderHelper = efw.shaderHelper;

var gApplication = new efw.application();
gApplication.configs.webGLDebugEnabled = false;

// Shaders
//var gVS_Simple = "attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUv0; varying vec4 oColor; void main(void) { gl_Position = vec4(aPosition, 1.0); oColor = vec4(0,0,0,0); }';
//var gFS_Simple = 'precision mediump float; varying vec4 oColor; void main(void) { gl_FragColor = oColor; }';

var gVS_Phong = 
"uniform mat4 gMatW;"
+"uniform mat3 gMatWIT;"
+"uniform mat4 gMatWVP;"
+"attribute vec3 aPosition;"
+"attribute vec3 aNormal;"
+"attribute vec2 aUv0;"
+""
+"varying vec3 oWorldPosition;"
+"varying vec3 oWorldNormalVec;"
+"varying vec2 oUv0;"
+""
+"void main()"
+"{"
+"	vec4 position = vec4(aPosition, 1.0);\n"
+"	oWorldPosition = (position * gMatW).xyz;\n"
+"	oWorldNormalVec = aNormal * gMatWIT;\n"
+"	oUv0 = aUv0;\n"
+"	gl_Position = position * gMatWVP;\n"
+"}"
+"";

var gFS_Phong = 
"precision mediump float;"
+"uniform sampler2D gAlbedo;"
+"uniform vec3 gWorldEyePosition;"
+"uniform vec3 gWorldLight0Position;"
+""
+"varying vec3 oWorldPosition;"
+"varying vec3 oWorldNormalVec;"
+"varying vec2 oUv0;"
+""
+"void main()"
+"{"
+"  vec3 worldPosition = oWorldPosition;\n"
+"	vec3 worldNormalVec = normalize(oWorldNormalVec);\n"
+"	vec3 worldEyeVec = normalize(gWorldEyePosition - worldPosition);\n"
+"	vec3 worldLight0Vec = normalize(gWorldLight0Position - worldPosition);\n"
+"	vec3 halfLightEyeVec = normalize(worldEyeVec + worldLight0Vec);\n"
+""	   
+"	float lightAttnCoeff = max(dot(worldNormalVec, worldLight0Vec), 0.0);\n"
+"	float specularIntensity = max(dot(worldNormalVec, halfLightEyeVec), 0.0);\n"
//+"	vec4 surfaceColor = vec4(1.0, 1.0, 1.0, 1.0);\n"
+"	vec4 surfaceColor = texture2D(gAlbedo, oUv0);"
//+"	float temp = surfaceColor.r; surfaceColor.r = surfaceColor.b; surfaceColor.b = temp;"
+"	vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);\n"
+""
+"		lightAttnCoeff *= (0.7 + 0.7 * pow(specularIntensity, 12.0));"
//+"	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor + lightColor * lightAttnCoeff * specularIntensity;"
//+"	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor;"
//+"	lightAttnCoeff = max(lightAttnCoeff + lightAttnCoeff*pow(specularIntensity, 8.0), 0.05);"
//
+"	gl_FragColor = surfaceColor * vec4(0.05 + lightAttnCoeff, 0.05+lightAttnCoeff, 0.05+lightAttnCoeff, 1);"
//+"	worldNormalVec = worldNormalVec * 0.5 + vec3(0.5);"
+""
//+"	gl_FragColor = vec4(worldNormalVec.x, worldNormalVec.y, worldNormalVec.z, 1);"
//+"	gl_FragColor = vec4(worldEyeVec.x, worldEyeVec.y, worldEyeVec.z, 1);"
+"}"
+"";

// Buffers
var gShaderProgram;
var gUniformMatW, gUniformMatWIT, gUniformMatWVP;
var gUniformEyePos, gUniformLight0Pos;
var gAttr0, gAttr1, gAttr2;

// Content
var gAsyncLoading = 0;
var gMeshes;
var gMeshesRawData;
var gMeshesGL = [];

var gMaterials;
var gMaterialsRawData;
var gMaterialsGL = [];

// Camera and Light
//var gLightPosition = [1000, -10000, 500];
var gLightPosition = [0.0, 1400.0, 0.0];
var gCamera = {};
gCamera.eyePos = [-500.0, 700.0, 0.0];
gCamera.lookAtVec = vec3.normalize([-1.0, 0.0, 0.0]);
gCamera.upVec = [0.0, 1.0, 0.0];

// Fade
var gFadeItem = null;
var gFadeDirection = 1;
var gFadeAlpha = 1.0;
var gFadeTimer = null;

// General
var gIsFirstDraw = true;

function loadFileAsync(fullFilePath, fileType, functionPtr)
{
	gAsyncLoading++;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fullFilePath, true);
	xhr.responseType = fileType;

	xhr.onload = function(e) {
		gAsyncLoading--;
		functionPtr(this.response);
		//console.log(e);
	};
	
	xhr.onerror = xhr.onabort = function(e) { gAsyncLoading--; }
	xhr.send();
}

function fadeUpdate()
{
	gFadeAlpha += (gFadeDirection>0)? 0.01 : -0.01;
	gFadeItem.style.opacity = gFadeAlpha;
	
	if (gFadeAlpha <= 0)
	{
		clearInterval(gFadeTimer);
		gFadeItem = null;
		gFadeTimer = null;
	}
}
function startFadeOut(item, startOpacity, fadeTime)
{
	if (gFadeTimer) clearInterval(gFadeTimer);

	gFadeItem = item;
	gFadeDirection = -1;
	gFadeAlpha = startOpacity;
	item.style.opacity = startOpacity;

	gFadeTimer = setInterval(fadeUpdate, fadeTime/(100*gFadeAlpha));
}
function startFadeIn(item, startOpacity, fadeTime)
{
	if (gFadeTimer) clearInterval(gFadeTimer);
		
	gFadeItem = item;
	gFadeDirection = 1;	
	gFadeAlpha = startOpacity;
	item.style.opacity = startOpacity;

	gFadeTimer = setInterval(fadeUpdate, fadeTime/(100.0-100.0*gFadeAlpha));
}

function hideStartMessage() {
	startFadeOut(gCenterHud, 1.0, 1000);
}
function showStartMessage() {
	gCenterHud.innerHTML = 'Drag to look around<br/>Use the mouse buttons and wheel to navigate';
	startFadeIn(gCenterHud, 0.0, 500);
	
	setTimeout(hideStartMessage, 5000);
}

function setDefaultRenderStates()
{
	gl.clearColor(122/255.0, 170/255.0, 255/255.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	gl.activeTexture(gl.TEXTURE0);
}

gApplication.loadContent = function()
{	
	// Load meshes and shaders
	loadFileAsync('assets/sponza-meshes.evd', 'text', function(data) { gMeshes = JSON.parse(data); } );
	loadFileAsync('assets/sponza-meshes.evb', 'arraybuffer', function(data) { gMeshesRawData = data; } );
	if (gl.compressedTexImage2D)
	{
		loadFileAsync('assets/sponza-compressed_materials.evd', 'text', function(data) { gMaterials = JSON.parse(data); } );
		loadFileAsync('assets/sponza-compressed_materials.evb', 'arraybuffer', function(data) { gMaterialsRawData = data; } );
	}
	else
	{
		loadFileAsync('assets/sponza-materials.evd', 'text', function(data) { gMaterials = JSON.parse(data); } );
		loadFileAsync('assets/sponza-materials.evb', 'arraybuffer', function(data) { gMaterialsRawData = data; } );
	}
}

gApplication.initializeContent = function()
{
	setDefaultRenderStates();
	
	// ------------------------------------------------------------
	//console.log(gMaterials);
	//console.log(gMaterialsRawData);
	gMaterialsGL = new Array(gMaterials.length);
	
	var dataIndex = 0;
	for (i=0; i<gMaterials.length; i++)
	{
		var material = gMaterials[i];

		var albedoTexture = material.albedoTexture;
		if (albedoTexture == null)
		{
			console.log("Material has no albedo texture.")
			console.log(material);
			continue;
		}
		
		var textureSize = albedoTexture.size;
		var textureBuffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
		
		if (gl.compressedTexImage2D != null)
		{
			var width = albedoTexture.width;
			var height = albedoTexture.height;
			var totalLayerSize = 0;
			
			for (var j=0; j<albedoTexture.mipCount; ++j)
			{
				var layerSize = Math.max(1, Math.floor((width+3)/4)) * Math.max(1, Math.floor((height+3)/4)) * 8;
				totalLayerSize += layerSize;
				
				//dataIndex = ((dataIndex + 7) & ~7);
				var mipTextureData = new Uint8Array(gMaterialsRawData, dataIndex, layerSize);
				dataIndex += layerSize;
			
				gl.compressedTexImage2D(gl.TEXTURE_2D, j, gl.COMPRESSED_RGBA_S3TC_DXT1_EXT, Math.max(1, width), Math.max(1, height), 0, mipTextureData);
				width >>= 1;
				height >>= 1;
			}
		}
		else
		{
			//dataIndex = ((dataIndex + 3) & ~3);
			var textureData = new Uint8Array(gMaterialsRawData, dataIndex, textureSize);
			dataIndex += textureSize;
			
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, albedoTexture.width, albedoTexture.height, 0, gl.RGBA, 
				gl.UNSIGNED_BYTE, textureData);
			gl.generateMipmap(gl.TEXTURE_2D);
		}
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    	gMaterialsGL[i] = {albedoTexture:textureBuffer};
    	
		if (dataIndex > gMaterialsRawData.byteLength)
		{
			console.log("Materials description file or binary file are corrupted!");
		}

   	}
	gMaterials = null;
	gMaterialsRawData = null;
	//console.log(gMaterialsGL);
	
	// ------------------------------------------------------------
	//console.log(gMeshes);
	//console.log(gMeshesRawData);
	gMeshesGL = new Array(gMeshes.length);
	
	var dataIndex = 0;
	for (i=0; i<gMeshes.length; i++)
	{
		var mesh = gMeshes[i];
		//console.log(mesh);
		
		var dataSize;
		dataSize = mesh.vertexCount * (3+3+2) * 4;
		dataIndex = ((dataIndex + 3) & ~3);
		var vertices = new Float32Array(gMeshesRawData, dataIndex, (3+3+2)*mesh.vertexCount);
		dataIndex += dataSize;
		
		dataSize = mesh.indexCount * 2;
		var indices = new Uint16Array(gMeshesRawData, dataIndex, mesh.indexCount);
		dataIndex += dataSize;

		// Debug
		//console.log(vertices);
		//console.log(indices);
		
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		var indexBuffer = gl.createBuffer();
   		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		gMeshesGL[i] = { materialId:mesh.materialId, vertexBuffer:vertexBuffer, indexBuffer:indexBuffer, indexCount:mesh.indexCount };
	}
	// Release data
	gMeshesRawData = null;
	gMeshes = null;
	//console.log(gMeshesGL);
	
	var vertexShader = shaderHelper.compileShader(gVS_Phong, gl.VERTEX_SHADER);
	var fragmentShader = shaderHelper.compileShader(gFS_Phong, gl.FRAGMENT_SHADER);
	gShaderProgram = shaderHelper.linkShader(vertexShader, fragmentShader);
	gl.useProgram(gShaderProgram);
	
	gUniformMatW = gl.getUniformLocation(gShaderProgram, "gMatW");
	gUniformMatWIT = gl.getUniformLocation(gShaderProgram, "gMatWIT");
	gUniformMatWVP = gl.getUniformLocation(gShaderProgram, "gMatWVP");
	gUniformEyePos = gl.getUniformLocation(gShaderProgram, "gWorldEyePosition");
	gUniformLight0Pos = gl.getUniformLocation(gShaderProgram, "gWorldLight0Position");
	gUniformSamplerAlbedo = gl.getUniformLocation(gShaderProgram, "gAlbedo");
	
	gAttr0 = gl.getAttribLocation(gShaderProgram, "aPosition");
	gAttr1 = gl.getAttribLocation(gShaderProgram, "aNormal");
	gAttr2 = gl.getAttribLocation(gShaderProgram, "aUv0");
	gl.enableVertexAttribArray(gAttr0);
	gl.enableVertexAttribArray(gAttr1);
	gl.enableVertexAttribArray(gAttr2);

	// Debug
	//console.log("Max GL Attribs: " + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
	//console.log( matWorld );
	//console.log( matWorldI );
	//console.log( matView );
	//console.log( matPerspective );
	//console.log( matWVP );
	//console.log( gUniformSamplerAlbedo );
	
	gApplication.configs.fpsCounterEnabled = true;
}


gApplication.update = function(elapsedTimeMillis)
{
	// Update camera
	if (this.inputs.mouse.isPressed[0])
	{
		var deltaX = this.inputs.mouse.positionDelta[0] * elapsedTimeMillis * 0.05;
		var sinAngX = Math.sin(deltaX);
		var cosAngX = Math.cos(deltaX);
		
		// Rotate lookAtPosition around up vector
		var lookAtVec = gCamera.lookAtVec; 
		gCamera.lookAtVec[0] = vec3.dot(lookAtVec, vec3.create(cosAngX, 0, sinAngX));
		gCamera.lookAtVec[2] = vec3.dot(lookAtVec, vec3.create(-sinAngX, 0, cosAngX));
		gCamera.lookAtVec = vec3.normalize(gCamera.lookAtVec);
		
		// Rotate lookAtPosition around right vector
		var deltaY = -this.inputs.mouse.positionDelta[1] * elapsedTimeMillis * 0.07;
		var sinAngY = Math.sin(deltaY);
		var cosAngY = Math.cos(deltaY);
		
		// Optimize using 3x3 matrices
		var rightVec = vec3.normalize( vec3.cross(gCamera.upVec, gCamera.lookAtVec) );
		var upVec = vec3.cross(gCamera.lookAtVec, rightVec);
		//efw.assert( vec3.isUnit(rightVec) );
		//efw.assert( vec3.isUnit(upVec) );
		//efw.assert( vec3.isUnit(gCamera.lookAtVec) );
		 
		var cameraMat = mat4.createFromVec3(rightVec, upVec, gCamera.lookAtVec);
		var invCameraMat = mat4.transpose(cameraMat);
		var rotateXMat = mat4.rotateX(deltaY);
		var rotateOverRight = mat4.mul(mat4.mul(invCameraMat, rotateXMat), cameraMat);
		
		//
		//gCamera.upVec = vec3.normalize( vec3.mulMat4(gCamera.upVec, rotateOverRight) );
		gCamera.lookAtVec = vec3.normalize( vec3.mulMat4(gCamera.lookAtVec, rotateOverRight) );
		
		//cancelRequestAnimFrame(gAnimationFrameRequest);
		//while(true) {}
	}
	if (this.inputs.mouse.wheelDelta != 0)
	{
		var scaleValue = -this.inputs.mouse.wheelDelta * elapsedTimeMillis * 7;
		var scaledLookAtVec = vec3.mulScalar(gCamera.lookAtVec, scaleValue);
		gCamera.eyePos = vec3.add(gCamera.eyePos, scaledLookAtVec);
	}
	
	//var matWorld = mat4.identity();
	var matWorld = mat4.scale( vec3.create(1.5, 1.0, 1.5) );
	var matWorldIT = mat4.scale( vec3.create(1/1.5, 1.0, 1/1.5) );
	var matView = mat4.lookAt(gCamera.eyePos, vec3.add(gCamera.eyePos, gCamera.lookAtVec), gCamera.upVec);
	var matPerspective = mat4.perspectiveFovRH(Math.PI*0.35, gl.viewportWidth/gl.viewportHeight, 1.0, 5000.0);
	var matWVP = mat4.mul(matWorld, mat4.mul(matView, matPerspective));

	gl.uniformMatrix4fv(gUniformMatW, false, new Float32Array(matWorld));
	gl.uniformMatrix3fv(gUniformMatWIT, false, new Float32Array( mat4.upper3x3(matWorldIT) ));
	gl.uniformMatrix4fv(gUniformMatWVP, false, new Float32Array(matWVP));
	gl.uniform3fv(gUniformEyePos, new Float32Array(gCamera.eyePos) );
	gl.uniform3fv(gUniformLight0Pos, new Float32Array(gLightPosition) );
}


gApplication.draw = function(elapsedTimeMillis)
{
	gFpsHud.innerHTML = 'Update Fps/Ms: ' + this.fpsStats.updateFps + '/' + this.fpsStats.updateTimeMs + 
	'<br/>Draw Fps/Ms: ' + this.fpsStats.drawFps + '/' + this.fpsStats.drawTimeMs;
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for (var i=0; i<gMeshesGL.length; i++)
	{
		// Remove rendering of flag
		if (i == 3)
			continue;
			
		var meshGL = gMeshesGL[i];
		var material = gMaterialsGL[meshGL.materialId];
		//console.log(meshGL);
		//console.log(material);

		if (material)
		{
        	gl.bindTexture(gl.TEXTURE_2D, material.albedoTexture);
        	gl.uniform1i(gUniformSamplerAlbedo, 0);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, meshGL.vertexBuffer);
		gl.vertexAttribPointer(gAttr0, 3, gl.FLOAT, false, 32, 0);
		gl.vertexAttribPointer(gAttr1, 3, gl.FLOAT, false, 32, 12);
		gl.vertexAttribPointer(gAttr2, 2, gl.FLOAT, false, 32, 24);
	
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshGL.indexBuffer);
		gl.drawElements(gl.TRIANGLES, meshGL.indexCount, gl.UNSIGNED_SHORT, 0);
	}
	
	if (gIsFirstDraw)
	{
		gIsFirstDraw = false;
		showStartMessage();
	}
	// Enable to have a better idea of the rendering cost
	//gl.finish();
}