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

// Shaders
//var gVS_Simple = "attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUv0; varying vec4 oColor; void main(void) { gl_Position = vec4(aPosition, 1.0); oColor = vec4(0,0,0,0); }';
//var gFS_Simple = 'precision mediump float; varying vec4 oColor; void main(void) { gl_FragColor = oColor; }';

var gVS_Basic = 
"uniform mat4 gMatW;"
+"uniform mat3 gMatWIT;"
+"uniform mat4 gMatWVP;"
+""
+"uniform vec4 gPositionScale;"
+"uniform vec4 gPositionBias;"
+"uniform vec4 gUvScaleBias;"
+""
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
+""
+"	oWorldNormalVec = aNormal * gMatWIT;\n"
+"	oUv0 = aUv0;\n"
+""
+"	gl_Position = position * gMatWVP;\n"
+"}"
+"";

var gVS_Compressed = 
"uniform mat4 gMatW;"
+"uniform mat3 gMatWIT;"
+"uniform mat4 gMatWVP;"
+""
+"uniform vec4 gPositionScale;"
+"uniform vec4 gPositionBias;"
+"uniform vec4 gUvScaleBias;"
+""
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
+"	position = position * gPositionScale + gPositionBias;\n"
+"	oWorldPosition = (position * gMatW).xyz;\n"
+""
+"	vec3 normal = (aNormal - vec3(0.5)) * vec3(2.0);\n" 
+"	oWorldNormalVec = normal * gMatWIT;\n"
+""
+"	oUv0 = aUv0 * gUvScaleBias.xy + gUvScaleBias.zw;\n"
+"	gl_Position = position * gMatWVP;\n"
+"}"
+"";

var gFS_Phong = 
"precision mediump float;"
+"uniform sampler2D gSamplerAlbedo;"
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
+"	vec4 surfaceColor = texture2D(gSamplerAlbedo, oUv0);"
//+"	float temp = surfaceColor.r; surfaceColor.r = surfaceColor.b; surfaceColor.b = temp;"
+"	vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);\n"
+""
+"		lightAttnCoeff *= (0.7 + 0.7 * pow(specularIntensity, 12.0));"
//+"	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor + lightColor * lightAttnCoeff * specularIntensity;"
//+"	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor;"
//+"	lightAttnCoeff = max(lightAttnCoeff + lightAttnCoeff*pow(specularIntensity, 8.0), 0.05);"
//
+"	gl_FragColor = surfaceColor * vec4(0.05 + lightAttnCoeff, 0.05+lightAttnCoeff, 0.05+lightAttnCoeff, 1);"
//+"	gl_FragColor = vec4(0.05 + lightAttnCoeff, 0.05+lightAttnCoeff, 0.05+lightAttnCoeff, 1);"
//+"	worldNormalVec = worldNormalVec * 0.5 + vec3(0.5);"
+""
//+"	gl_FragColor = vec4(worldNormalVec.x, worldNormalVec.y, worldNormalVec.z, 1);"
//+"	gl_FragColor = vec4(worldEyeVec.x, worldEyeVec.y, worldEyeVec.z, 1);"
+"}"
+"";

// Application
var gApplication = new efw.application();
gApplication.configs.webGLDebugEnabled = true;
var gUseCompressedModel = true;

// Available mesh vertex data types
var gMeshVertexTypes;

// Content
var jsonBinaryResource = function() {
	this.description = null;
	this.data = null;
} 

// Buffers
var gProgramBasicPhong, gProgramCompressedPhong;
var gUniformMatW, gUniformMatWIT, gUniformMatWVP;
var gUniformPositionScale, gUniformPositionBias, gUniformUvScaleBias;
var gUniformEyePos, gUniformLight0Pos;
var gUniformSamplerAlbedo;
var gAttr0, gAttr1, gAttr2;

var gAsyncLoading = 0;
var gMeshes;
var gMeshesRawData;
var gMeshesGL = [];
var gMeshesGLVertexType;

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
	//xhr.overrideMimeType('text/plain; charset=UTF-8');
	xhr.overrideMimeType("text/plain; charset=x-user-defined");  

	xhr.onload = function(e) {
		//console.log(e);
		functionPtr(this.response);
		gAsyncLoading--;
	};
	xhr.onerror = xhr.onabort = function(e) { 
		gAsyncLoading--;
	};
	
	xhr.send();
}

function fadeUpdate()
{
	gFadeAlpha += (gFadeDirection>0)? 0.05 : -0.05;
	gFadeItem.style.opacity = gFadeAlpha;
	
	if (gFadeDirection > 0 && gFadeAlpha >= 1.0 ||
		gFadeDirection < 0 && gFadeAlpha <= 0.0)
	{
		clearInterval(gFadeTimer);

		gFadeAlpha = (gFadeDirection > 0)? 1.0 : 0.0;
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

	gFadeTimer = setInterval(fadeUpdate, fadeTime/(20*gFadeAlpha));
}
function startFadeIn(item, startOpacity, fadeTime)
{
	if (gFadeTimer) clearInterval(gFadeTimer);
		
	gFadeItem = item;
	gFadeDirection = 1;	
	gFadeAlpha = startOpacity;
	item.style.opacity = startOpacity;

	gFadeTimer = setInterval(fadeUpdate, fadeTime/(20.0-20.0*gFadeAlpha));
}

function hideStartMessage() {
	startFadeOut(gCenterHud, 1.0, 1000);
	setTimeout(function() {gCenterHud.innerHTML = ""; }, 1100);
}
function showStartMessage() {
	gCenterHud.innerHTML = 'Drag to look around<br/>Use the mouse buttons and wheel to navigate';
	startFadeIn(gCenterHud, 0.0, 600);
	
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

gApplication.loadJsonBinaryResource = function(outJsonBinary, jsonFilename, binaryFilename)
{
	loadFileAsync(jsonFilename, 'text', function(data) { outJsonBinary.description = JSON.parse(data); } );
	loadFileAsync(binaryFilename, 'arraybuffer', function(data) { outJsonBinary.data = data; } );
} 

gApplication.loadContent = function()
{
	// Mesh types
	gMeshVertexTypes = [{
		vstride:32,
		vattrib:[
			{type:gl.FLOAT,count:3,offset:0,normalized:false},
			{type:gl.FLOAT,count:3,offset:12,normalized:false},
			{type:gl.FLOAT,count:2,offset:24,normalized:false}
			]
		},
		{
		vstride:16,
		vattrib:[
			{type:gl.UNSIGNED_SHORT,count:3,offset:0,normalized:true},
			{type:gl.UNSIGNED_SHORT,count:3,offset:6,normalized:true},
			{type:gl.UNSIGNED_SHORT,count:2,offset:12,normalized:true}
			]
		}];

	if (gUseCompressedModel)
	{
		gMeshesGLVertexType = gMeshVertexTypes[1]; 
		loadFileAsync('assets/sponza-compressed-meshes.evb', 'arraybuffer', function(data) { gMeshesRawData = data; } );
		loadFileAsync('assets/sponza-compressed-meshes.evd', 'text', function(data) { gMeshes = JSON.parse(data); } );
	}
	else
	{
		gMeshesGLVertexType = gMeshVertexTypes[0];
		loadFileAsync('assets/sponza-meshes.evb', 'arraybuffer', function(data) { gMeshesRawData = data; } );
		loadFileAsync('assets/sponza-meshes.evd', 'text', function(data) { gMeshes = JSON.parse(data); } );
	}
	
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
		dataSize = mesh.vcount * gMeshesGLVertexType.vstride;
		dataIndex = ((dataIndex + 3) & ~3); // align input data
		var vertices = new Uint8Array(gMeshesRawData, dataIndex, dataSize);
		dataIndex += dataSize;
		
		dataSize = mesh.icount * 2;
		var indices = new Uint16Array(gMeshesRawData, dataIndex, mesh.icount);
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

		var positionScaleArray = null;
		var positionBiasArray = null;
		var uvScaleBiasArray = null;
		if (gUseCompressedModel)
		{
			positionScaleArray = new Float32Array([mesh.posCustom[0], mesh.posCustom[1], mesh.posCustom[2], 1]);
			positionBiasArray = new Float32Array([mesh.posCustom[3], mesh.posCustom[4], mesh.posCustom[5], 0]);
			uvScaleBiasArray = new Float32Array([mesh.uvCustom[0], mesh.uvCustom[1], mesh.uvCustom[2], mesh.uvCustom[3]]);
		}
		gMeshesGL[i] = { matId:mesh.matId, vertexBuffer:vertexBuffer, indexBuffer:indexBuffer, indexCount:mesh.icount,
			posScale:positionScaleArray, posBias:positionBiasArray, uvScaleBias:uvScaleBiasArray };
	}
	// Release data
	gMeshesRawData = null;
	gMeshes = null;
	//console.log(gMeshesGL);
	
	var vsBasic = shaderHelper.compileShader(gVS_Basic, gl.VERTEX_SHADER);
	var vsCompressed = shaderHelper.compileShader(gVS_Compressed, gl.VERTEX_SHADER);
	var fsPhong = shaderHelper.compileShader(gFS_Phong, gl.FRAGMENT_SHADER);
	gProgramBasicPhong = shaderHelper.linkShader(vsBasic, fsPhong);
	gProgramCompressedPhong = shaderHelper.linkShader(vsCompressed, fsPhong);
	
	var selectedProgram = null;
	if (gUseCompressedModel)
	{
		selectedProgram = gProgramCompressedPhong;
	}
	else
	{
		selectedProgram = gProgramBasicPhong;
	}
	gl.useProgram(selectedProgram);
	
	gUniformMatW = gl.getUniformLocation(selectedProgram, "gMatW");
	gUniformMatWIT = gl.getUniformLocation(selectedProgram, "gMatWIT");
	gUniformMatWVP = gl.getUniformLocation(selectedProgram, "gMatWVP");
	gUniformEyePos = gl.getUniformLocation(selectedProgram, "gWorldEyePosition");
	gUniformLight0Pos = gl.getUniformLocation(selectedProgram, "gWorldLight0Position");
	gUniformSamplerAlbedo = gl.getUniformLocation(selectedProgram, "gSamplerAlbedo");
		
	if (gUseCompressedModel)
	{
		gUniformPositionBias = gl.getUniformLocation(selectedProgram, "gPositionBias");
		gUniformPositionScale = gl.getUniformLocation(selectedProgram, "gPositionScale");
		gUniformUvScaleBias = gl.getUniformLocation(selectedProgram, "gUvScaleBias");
	}
	
	gAttr0 = gl.getAttribLocation(selectedProgram, "aPosition");
	gAttr1 = gl.getAttribLocation(selectedProgram, "aNormal");
	gAttr2 = gl.getAttribLocation(selectedProgram, "aUv0");
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
		var meshGL = gMeshesGL[i];
		var material = gMaterialsGL[meshGL.matId];
		//console.log(meshGL);
		//console.log(material);

		if (material)
		{
        	gl.bindTexture(gl.TEXTURE_2D, material.albedoTexture);
        	gl.uniform1i(gUniformSamplerAlbedo, 0);
		}

		if (gUseCompressedModel)
		{
			gl.uniform4fv(gUniformPositionScale, meshGL.posScale);
			gl.uniform4fv(gUniformPositionBias, meshGL.posBias);
			gl.uniform4fv(gUniformUvScaleBias, meshGL.uvScaleBias);
		}
		
		var vstride = gMeshesGLVertexType.vstride;
		var vattrib = gMeshesGLVertexType.vattrib;
		gl.bindBuffer(gl.ARRAY_BUFFER, meshGL.vertexBuffer);
		gl.vertexAttribPointer(gAttr0, vattrib[0].count, vattrib[0].type, vattrib[0].normalized, vstride, vattrib[0].offset);
		gl.vertexAttribPointer(gAttr1, vattrib[1].count, vattrib[1].type, vattrib[1].normalized, vstride, vattrib[1].offset);
		gl.vertexAttribPointer(gAttr2, vattrib[2].count, vattrib[2].type, vattrib[2].normalized, vstride, vattrib[2].offset);

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