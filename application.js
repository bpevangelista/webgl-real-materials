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


// Application
var gApplication = new efw.application();
gApplication.configs.webGLDebugEnabled = false;


// Available mesh vertex data types
var gMeshVertexTypes = [{
	// Float components: position.xyz, normal.xyz, uv0.xy
	vstride:32,
	vattrib:[
		{type:0x1406/*gl.FLOAT*/,count:3,offset:0,normalized:false},
		{type:0x1406/*gl.FLOAT*/,count:3,offset:12,normalized:false},
		{type:0x1406/*gl.FLOAT*/,count:2,offset:24,normalized:false}
		]
	},
	{
	// uint16_t components: position.xyz, normal.xyz, uv0.xy
	vstride:16,
	vattrib:[
		{type:0x1403/*UNSIGNED_SHORT*/,count:3,offset:0,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:3,offset:6,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:2,offset:12,normalized:true}
		]
	},
	{
	// uint16_t components: position.xyz, compressed_normal.xy, uv0.xy
	vstride:14,
	vattrib:[
		{type:0x1403/*UNSIGNED_SHORT*/,count:3,offset:0,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:2,offset:6,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:2,offset:10,normalized:true}
		]
	},
	
	// Temporary new encoding
	{
	// uint16_t components: position.xyz, compressed_normal.xy, uv0.xy
	vstride:14,
	vattrib:[
		{type:0x1403/*UNSIGNED_SHORT*/,count:3,offset:0,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:2,offset:6,normalized:true},
		{type:0x1403/*UNSIGNED_SHORT*/,count:2,offset:10,normalized:true}
		]
	}
	 ];

var gTextureFormats = {
	kUnknown:0,
	kL8:1,
	kRGB:2,
	kRGBA:3,
	kABGR:4,
	kDXT1:5,
	kDXT3:6,
	kDXT5:7
};

// 
var gUseMeshCompressionType = 3; // 0 = None, 1 = 16b attributes, 2 = Azimuthal normals, 3 = SphereMap normals
var gUseMaterialTextureFormat = 5; // 0 = None, 5 = DXT1
var gUseMipMapOverlay = true;

// Content
var JsonBinaryResource = function() {
	this.description = null;
	this.data = null;
} 

// Buffers
var gUberVertexProgramSource, gUberFragmentProgramSource;
var gPrograms = [];
var gUniformMatW, gUniformMatWIT, gUniformMatWVP;
var gUniformPositionScale, gUniformPositionBias, gUniformUvScaleBias;
var gUniformEyePos;
var gUniformLight0Pos, gUniformLight0Color, gUniformLight1Pos, gUniformLight1Color;
var gUniformSamplerAlbedo;
var gUniformMaterialFresnel0, gUniformMaterialRoughness;
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
//var gLight0Position = new Float32Array([0.0, 1400.0, -100.0]);
//var gLight0Color = new Float32Array([0.7, 0.4, 0.3]);

var gLight0Position = new Float32Array([700.0, 1400.0, 0.0]);
var gLight0Color = new Float32Array([0.6, 0.8, 0.6]);
var gLight1Position = new Float32Array([-700.0, 1400.0, 200.0]);
var gLight1Color = new Float32Array([0.6, 0.6, 0.8]);

var gCameraUpdated = true;
var gCamera = {};
gCamera.eyePos = [-500.0, 700.0, 0.0];
gCamera.lookAtVec = vec3.normalize([-1.0, 0.0, 0.0]);
gCamera.upVec = [0.0, 1.0, 0.0];

// Opt
var gMatWorld, gMatWorldIT;

// Fade
var gFadeItem = null;
var gFadeDirection = 1;
var gFadeAlpha = 1.0;
var gFadeTimer = null;

// General
var gIsFirstDraw = true;


// loadBarrierWait, signalLoadBarrier waitLoadBarrier()
var gRequests = [];
var gRequestsLastEvent = [];
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
	xhr.onprogress = function(e) {
		//console.log(e);
		gRequestsLastEvent[e.currentTarget] = e;
	}
	xhr.onerror = xhr.onabort = function(e) { 
		gAsyncLoading--;
	};

	xhr.send();
	gRequests.push( xhr );
		
	return xhr;
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

gApplication.loadJsonBinaryResourceaSYNC = function(outJsonBinary, jsonFilename, binaryFilename)
{
	loadFileAsync(jsonFilename, 'text', function(data) { outJsonBinary.description = JSON.parse(data); } );
	loadFileAsync(binaryFilename, 'arraybuffer', function(data) { outJsonBinary.data = data; } );
} 

gApplication.updateLoadContentProgress = function()
{
	var count = 0;
	var totalProgress = 0;
	
	for (var i=0; i<gRequests.length; i++)
	{
		var lastEvent = gRequestsLastEvent[gRequests[i]];
		if (lastEvent != null && lastEvent.lengthComputable)
		{
			totalProgress += (lastEvent.loaded/lastEvent.total);			
			count++;
		}
	}

	if (count > 0)
	{
		totalProgress = (Math.floor(totalProgress/count) * 100);
		gCenterHud.innerHTML = 'Loading Awesome WebGL Demo!<br/><br/> Loading ' + totalProgress + '%';
	}
		
	//console.log('count, totalProgress');
	//console.log(count);
	//console.log(totalProgress);
	if (totalProgress != 100)
		setTimeout(updateLoadContentProgress, 1000);
}

gApplication.loadContent = function()
{
	// Compressed types
	if (gUseMeshCompressionType != 0)
	{
		console.log("Using compressed meshes.");
		gMeshesGLVertexType = gMeshVertexTypes[gUseMeshCompressionType];
		loadFileAsync('assets/sponza-compressed' + gUseMeshCompressionType + '-meshes.evb', 'arraybuffer', function(data) { gMeshesRawData = data; } );
		loadFileAsync('assets/sponza-compressed' + gUseMeshCompressionType + '-meshes.evd', 'text', function(data) { gMeshes = JSON.parse(data); } );
	}
	else
	{
		gMeshesGLVertexType = gMeshVertexTypes[0];
		loadFileAsync('assets/sponza-meshes.evb', 'arraybuffer', function(data) { gMeshesRawData = data; } );
		loadFileAsync('assets/sponza-meshes.evd', 'text', function(data) { gMeshes = JSON.parse(data); } );
	}
	
	if (gl.compressedTexImage2D && gUseMaterialTextureFormat == gTextureFormats.kDXT1)
	{
		console.log("Using compressed textures.");
		loadFileAsync('assets/sponza-compressed-materials.evd', 'text', function(data) { gMaterials = JSON.parse(data); } );
		loadFileAsync('assets/sponza-compressed-materials.evb', 'arraybuffer', function(data) { gMaterialsRawData = data; } );
	}
	else
	{
		loadFileAsync('assets/sponza-materials.evd', 'text', function(data) { gMaterials = JSON.parse(data); } );
		loadFileAsync('assets/sponza-materials.evb', 'arraybuffer', function(data) { gMaterialsRawData = data; } );
	}
	
	loadFileAsync('assets/_vs_programs.glsl', 'text', function(data) { gUberVertexProgramSource = data; } );
	loadFileAsync('assets/_fs_programs.glsl', 'text', function(data) { gUberFragmentProgramSource = data; } );
	
	setTimeout(this.updateLoadContentProgress, 1000);
	
	/*
	if (gUseCompressedModel)
	{
		loadJsonBinaryResource(gSponzaModel, 'assets/sponza-compressed-meshes.evd', 'assets/sponza-compressed-meshes.evb');
		gSponzaModel.vertexType = gMeshVertexTypes[1];
	}
	else
	{
		loadJsonBinaryResource(gSponzaModel, 'assets/sponza-meshes.evd', 'assets/sponza-meshes.evb');
		gSponzaModel.vertexType = gMeshVertexTypes[0];
	}
	
	if (gl.compressedTexImage2D)
	{
		loadJsonBinaryResource(gSponzaMaterialLib, 'assets/sponza-compressed-materials.evd', 'assets/sponza-compressed-materials.evb');
	}
	else
	{
		loadJsonBinaryResource(gSponzaMaterialLib, 'assets/sponza-materials.evd', 'assets/sponza-materials.evb');
	}
	*/
}

/*
function lightFadeIn()
{

}
function startRandomizeLight()
{
	var nextTime = 100 + Math.random() * 0.5 * 1000;
	
	var intensityDelta = (Math.random() - 0.5) * 0.1;
	var newLight0Color = gLight0Color;
	newLight0Color[0] = (newLight0Color[0] + intensityDelta);
	newLight0Color[1] = (newLight0Color[1] + intensityDelta);
	newLight0Color[2] = (newLight0Color[2] + intensityDelta);
	newLight0Color[0] = Math.max(Math.min(newLight0Color[0], 1.0), 0.0);
	newLight0Color[1] = Math.max(Math.min(newLight0Color[1], 1.0), 0.0);
	newLight0Color[2] = Math.max(Math.min(newLight0Color[2], 1.0), 0.0);
	
	//gLight0Color = newLight0Color;
	setTimeout(function() { gLight0Color = newLight0Color; startRandomizeLight(); }, nextTime);
}
*/

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
		
		var width = albedoTexture.width;
		var height = albedoTexture.height;
		
		for (var j=0; j<albedoTexture.mipCount; ++j)
		{
			//dataIndex = ((dataIndex + 7) & ~7);

			if (albedoTexture.format == gTextureFormats.kDXT1)
			{
				var layerSize = Math.max(1, Math.floor((width+3)/4)) * Math.max(1, Math.floor((height+3)/4)) * 8;
				var mipTextureData = new Uint8Array(gMaterialsRawData, dataIndex, layerSize);

				gl.compressedTexImage2D(gl.TEXTURE_2D, j, gl.COMPRESSED_RGBA_S3TC_DXT1_EXT, Math.max(1, width), Math.max(1, height), 0 /*border*/, mipTextureData);
			}
			else if (albedoTexture.format == gTextureFormats.kRGBA)
			{
				var layerSize = Math.max(1, width) * Math.max(1, height) * 4;
				var mipTextureData = new Uint8Array(gMaterialsRawData, dataIndex, layerSize);

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, j, gl.RGBA, Math.max(1, width), Math.max(1, height), 0 /*border*/, gl.RGBA, gl.UNSIGNED_BYTE, mipTextureData);
			}

			dataIndex += layerSize;
			width >>= 1;
			height >>= 1;
		}
		
		// If the texture is not compressed and has only one mip level we should generate the full mip chain
		if (albedoTexture.format == gTextureFormats.kRGBA && albedoTexture.mipCount == 1)
		{
			gl.generateMipmap(gl.TEXTURE_2D);
		}
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    	gMaterialsGL[i] = {albedoTexture:textureBuffer, fresnel0:new Float32Array(material.fresnel0), roughness:material.roughness};
    	
		if (dataIndex > gMaterialsRawData.byteLength)
		{
			console.log("Materials description file or binary file is corrupted!");
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
		if (gUseMeshCompressionType != 0)
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
	
	/*
	var vsBasic = shaderHelper.compileShader(gVS_Basic, gl.VERTEX_SHADER);
	var vsCompressed = shaderHelper.compileShader(gVS_Compressed, gl.VERTEX_SHADER);
	var vsCompressedAzimuthal = shaderHelper.compileShader(gVS_CompressedAzimuthal, gl.VERTEX_SHADER);
	var vsCompressedSpheremap = shaderHelper.compileShader(gVS_CompressedSphereMap, gl.VERTEX_SHADER);
	var fsPhong = shaderHelper.compileShader(gFS_Phong, gl.FRAGMENT_SHADER);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vsBasic, fsPhong);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vsCompressed, fsPhong);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vsCompressedAzimuthal, fsPhong);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vsCompressedSpheremap, fsPhong);
	*/
	
	
	var vertexShaders = [];
	vertexShaders[vertexShaders.length] = shaderHelper.compileShaderWithDefines(gUberVertexProgramSource, gl.VERTEX_SHADER, '-DVS_SIMPLE');
	vertexShaders[vertexShaders.length] = shaderHelper.compileShaderWithDefines(gUberVertexProgramSource, gl.VERTEX_SHADER, '-DNORMAL_ENCODING_U16 -DVS_COMPRESSED');
	vertexShaders[vertexShaders.length] = shaderHelper.compileShaderWithDefines(gUberVertexProgramSource, gl.VERTEX_SHADER, '-DNORMAL_ENCODING_AZIMUTHAL -DVS_COMPRESSED');
	vertexShaders[vertexShaders.length] = shaderHelper.compileShaderWithDefines(gUberVertexProgramSource, gl.VERTEX_SHADER, '-DNORMAL_ENCODING_SPHEREMAP -DVS_COMPRESSED');

	var fragmentShaders = [];
	fragmentShaders[fragmentShaders.length] = shaderHelper.compileShaderWithDefines(gUberFragmentProgramSource, gl.FRAGMENT_SHADER, '-DFS_SIMPLE');
	
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vertexShaders[0], fragmentShaders[0]);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vertexShaders[1], fragmentShaders[0]);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vertexShaders[2], fragmentShaders[0]);
	gPrograms[gPrograms.length] = shaderHelper.linkShader(vertexShaders[3], fragmentShaders[0]);
	
	var selectedProgram = gPrograms[gUseMeshCompressionType];
	gl.useProgram(selectedProgram);
	
	gUniformMatW = gl.getUniformLocation(selectedProgram, "gMatW");
	gUniformMatWIT = gl.getUniformLocation(selectedProgram, "gMatWIT");
	gUniformMatWVP = gl.getUniformLocation(selectedProgram, "gMatWVP");
	gUniformEyePos = gl.getUniformLocation(selectedProgram, "gWorldEyePosition");
	gUniformLight0Pos = gl.getUniformLocation(selectedProgram, "gLight0WorldPosition");
	gUniformLight0Color = gl.getUniformLocation(selectedProgram, "gLight0Color");
	gUniformLight1Pos = gl.getUniformLocation(selectedProgram, "gLight1WorldPosition");
	gUniformLight1Color = gl.getUniformLocation(selectedProgram, "gLight1Color");

	gUniformSamplerAlbedo = gl.getUniformLocation(selectedProgram, "gSamplerAlbedo");
	gUniformMaterialFresnel0 = gl.getUniformLocation(selectedProgram, "gMaterialFresnel0");
	gUniformMaterialRoughness = gl.getUniformLocation(selectedProgram, "gMaterialRoughness");

	if (gUseMeshCompressionType != 0)
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
	
	// One time updates
	gMatWorld = mat4.mul( mat4.translate(vec3.create(100.0, 0, 0)), mat4.scale(vec3.create(1.5, 1.0, 1.5)) );
	gMatWorldIT = mat4.scale( vec3.create(1/1.5, 1.0, 1/1.5) );
	gl.uniformMatrix4fv(gUniformMatW, false, new Float32Array(gMatWorld));
	gl.uniformMatrix3fv(gUniformMatWIT, false, new Float32Array( mat4.upper3x3(gMatWorldIT) ));

	gl.uniform3fv(gUniformLight0Color, gLight0Color);
	gl.uniform3fv(gUniformLight1Color, gLight1Color);

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
		gCameraUpdated = true;
	}
	if (this.inputs.mouse.wheelDelta != 0)
	{
		var scaleValue = -this.inputs.mouse.wheelDelta * elapsedTimeMillis * 7;
		var scaledLookAtVec = vec3.mulScalar(gCamera.lookAtVec, scaleValue);
		gCamera.eyePos = vec3.add(gCamera.eyePos, scaledLookAtVec);
		
		gCameraUpdated = true;
	}
	
	if (gCameraUpdated)
	{
		//var matWorld = mat4.identity();
		//var matWorld = mat4.mul( mat4.translate(vec3.create(100.0, 0, 0)), mat4.scale(vec3.create(1.5, 1.0, 1.5)) );
		//var matWorldIT = mat4.scale( vec3.create(1/1.5, 1.0, 1/1.5) );
		var matView = mat4.lookAt(gCamera.eyePos, vec3.add(gCamera.eyePos, gCamera.lookAtVec), gCamera.upVec);
		var matPerspective = mat4.perspectiveFovRH(Math.PI*0.35, gl.viewportWidth/gl.viewportHeight, 1.0, 5000.0);
		var matWVP = mat4.mul(gMatWorld, mat4.mul(matView, matPerspective));

		//gl.uniformMatrix4fv(gUniformMatW, false, new Float32Array(matWorld));
		//gl.uniformMatrix3fv(gUniformMatWIT, false, new Float32Array( mat4.upper3x3(matWorldIT) ));
		gl.uniformMatrix4fv(gUniformMatWVP, false, new Float32Array(matWVP));
		gl.uniform3fv(gUniformEyePos, new Float32Array(gCamera.eyePos));

		gCameraUpdated = false;
	}

	var angle = elapsedTimeMillis * 0.5;
	var cosAngle = Math.cos(angle);
	var sinAngle = Math.sin(angle);
	gLight0Position[2] = gLight0Position[2] * cosAngle - gLight0Position[0] * sinAngle;
	gLight0Position[0] = gLight0Position[0] * cosAngle + gLight0Position[2] * sinAngle;
	gLight1Position[2] = gLight1Position[2] * cosAngle - gLight1Position[0] * sinAngle;
	gLight1Position[0] = gLight1Position[0] * cosAngle + gLight1Position[2] * sinAngle;
	
	gl.uniform3fv(gUniformLight0Pos, gLight0Position);
	gl.uniform3fv(gUniformLight1Pos, gLight1Position);
	//gl.uniform3fv(gUniformLight0Color, gLight0Color);
	//gl.uniform3fv(gUniformLight1Color, gLight1Color);
	
	//startRandomizeLight();
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
        	
			gl.uniform3fv(gUniformMaterialFresnel0, material.fresnel0);
			//gl.uniform3fv(gUniformMaterialFresnel0, new Float32Array([0.45, 0.45, 0.45]));
			//gl.uniform1f(gUniformMaterialRoughness, material.roughness);
			
			//gl.uniform1f(gUniformMaterialRoughness, 10);
			gl.uniform1f(gUniformMaterialRoughness, 24);
		}

		if (gUseMeshCompressionType != 0)
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