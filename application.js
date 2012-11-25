
/**
 * @constructor
 * @extends efw.Application
 * @export
 */
var CustomApp = function()
{
	efw.Application.call(this);
	
	// 
	this.centerHud = null;
	this.fpsHud = null;
	this.topMenu = null;

	// Loader and resource manager
	this.loader = new efw.Loader();
	this.resourceManager = new efw.ResourceManager(this.graphicsDevice);

	this.camera = new efw.CameraPerspective();
	this.lights = [];
	this.shaderPrograms = [];
	this.selectedProgram = null;
	
	this._uberShaderVertexSource = null;
	this._uberShaderFragmentSource = null;
	this.shaderIndex = 0;
	this.customFresnel0 = null;
	
	// Global transformation used for all objects
	this.matWorld = null;
	this.matWorldIT = null;
	
	// Fade
	this._fadeItem = null;
	this._fadeDirection = 1;
	this._fadeAlpha = 1.0;
	this._fadeTimer = null;

	// General
	this._isFirstDraw = true;
	this._useMeshCompressionType = 3; // 0 = None, 1 = 16b attributes, 2 = Azimuthal normals, 3 = SphereMap normals
	this._useMaterialTextureFormat = efw.TextureFormats.kDXT1; // 0 = None, 5 = DXT1
	this._useMipMapOverlay = true;
}
CustomApp.prototype = Object.create( efw.Application.prototype );
CustomApp.prototype.constructor = CustomApp;


CustomApp.prototype.setHuds = function(userCenterHud, userFpsHud, topMenu)
{
	this.centerHud = userCenterHud;
	this.fpsHud = userFpsHud;
	this.topMenu = topMenu;
}


// Fade In/Out
// ----------------------------------------------------------------------------------------------------
CustomApp.prototype.fadeUpdate = function()
{
	this._fadeAlpha += (this._fadeDirection>0)? 0.05 : -0.05;
	this._fadeItem.style.opacity = this._fadeAlpha;
	
	if (this._fadeDirection > 0 && this._fadeAlpha >= 1.0 ||
		this._fadeDirection < 0 && this._fadeAlpha <= 0.0)
	{
		clearInterval(this._fadeTimer);

		this._fadeAlpha = (this._fadeDirection > 0)? 1.0 : 0.0;
		this._fadeItem = null;
		this._fadeTimer = null;
	}
}
CustomApp.prototype.startFadeOut = function(item, startOpacity, fadeTime)
{
	if (this._fadeTimer)
		clearInterval(this._fadeTimer);

	item.style.opacity = startOpacity;

	this._fadeItem = item;
	this._fadeDirection = -1;
	this._fadeAlpha = startOpacity;
	this._fadeTimer = setInterval(this.fadeUpdate.bind(this), fadeTime/(20 * this._fadeAlpha));
}
CustomApp.prototype.startFadeIn = function(item, startOpacity, fadeTime)
{
	if (this._fadeTimer)
		clearInterval(this._fadeTimer);
		
	item.style.opacity = startOpacity;

	this._fadeItem = item;
	this._fadeDirection = 1;	
	this._fadeAlpha = startOpacity;
	this._fadeTimer = setInterval(this.fadeUpdate.bind(this), fadeTime/(20.0 - 20.0 * this._fadeAlpha));
}

// Handle UI messages
// ----------------------------------------------------------------------------------------------------
CustomApp.prototype.hideStartMessage = function() {
	this.startFadeOut(this.centerHud, 1.0, 1000);
	
	var self = this;
	setTimeout(function() { self.centerHud.innerHTML = ""; }, 1100);
}
CustomApp.prototype.showStartMessage = function() {
	this.centerHud.innerHTML = 'Drag to look around<br/>Use the mouse buttons and wheel to navigate';
	this.startFadeIn(this.centerHud, 0.0, 600);
	
	setTimeout(this.hideStartMessage.bind(this), 5000);
}


CustomApp.prototype.updateLoadContentProgress = function()
{
	var progress = this.loader.getProgress();
	this.centerHud.innerHTML = 'Loading Awesome WebGL Demo!<br/><br/> Loading ' + progress + '%';

	if (progress != 100)
		setTimeout(this.updateLoadContentProgress.bind(this), 100);
}


CustomApp.prototype.userLoadContent = function()
{
	// Model
	var meshFilePath = 'assets/sponza-meshes';
	if (this._useMeshCompressionType != 0)
	{
		window.console.log("Using compressed meshes.");
		meshFilePath = 'assets/sponza-compressed' + this._useMeshCompressionType + '-meshes';
	}
	
	// Material Lib
	var materialFilePath = 'assets/sponza-materials';
	if (this.graphicsDevice.extensions[efw.GraphicsDeviceExtensions.kCompressedTextures] && 
		this._useMaterialTextureFormat == efw.TextureFormats.kDXT1)
	{
		window.console.log("Using compressed textures.");
		materialFilePath = 'assets/sponza-compressed-materials';
	}

	// Load
	var package0 = this.loader.loadPackageAsync(meshFilePath + '.evd', meshFilePath + '.evb');
	var package1 = this.loader.loadPackageAsync(materialFilePath + '.evd', materialFilePath + '.evb');
	this.resourceManager.addPackage(package0);
	this.resourceManager.addPackage(package1);
	
	var self = this;
	this.loader.loadFileAsync('assets/_vs_programs.glsl', 'text', function(data) { self._uberShaderVertexSource = data; } );
	this.loader.loadFileAsync('assets/_fs_programs.glsl', 'text', function(data) { self._uberShaderFragmentSource = data; } );
	
	setTimeout( this.updateLoadContentProgress.bind(this), 200);
}


CustomApp.prototype.setDefaultRenderStates = function()
{
	this.graphicsDevice.setClearColor(122/255.0, 170/255.0, 255/255.0, 1.0);
	this.graphicsDevice.setClearDepth(1.0);
	this.graphicsDevice.enableState(efw.GraphicsDeviceState.kDepthTest);
	this.graphicsDevice.enableState(efw.GraphicsDeviceState.kCullFace);
	
	this.graphicsDevice.gl.cullFace(this.graphicsDevice.gl.FRONT);
	this.graphicsDevice.gl.activeTexture(this.graphicsDevice.gl.TEXTURE0);
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


CustomApp.prototype.userOnresize = function()
{
	this.camera.initPerspective(Math.PI/3.0, this.viewportWidth/this.viewportHeight, 1.0, 5000.0);
}



CustomApp.prototype.setShader = function(shaderIndex)
{
	this.shaderIndex = shaderIndex;
	this.graphicsDevice.setShaderProgram(this.shaderPrograms[ this.shaderIndex ]);

	// One time updates
	this.matWorld = mat4.mul( mat4.translate(vec3.create(100.0, 0, 0)), mat4.scale(vec3.create(1.5, 1.0, 1.5)) );
	this.matWorldIT = mat4.scale( vec3.create(1/1.5, 1.0, 1/1.5) );
	
	this.graphicsDevice.setActiveShaderUniform("gMatW", new Float32Array(this.matWorld), false);
	this.graphicsDevice.setActiveShaderUniform("gMatWIT", new Float32Array( mat4.upper3x3(this.matWorldIT) ), false);

	this.camera.update();
	var matWVP = mat4.mul(this.matWorld, this.camera.viewProjectionMatrix);
	this.graphicsDevice.setActiveShaderUniform("gMatWVP", matWVP, false);
	this.graphicsDevice.setActiveShaderUniform("gWorldEyePosition", this.camera.position, false);


	// Physically based ones
	if (this.shaderIndex >= 4)
	{
		this.lights[0].init( [700.0, 1400.0, 0.0], [0.4, 0.8, 0.5] );
		this.lights[1].init( [-700.0, 1400.0, 200.0], [0.4, 0.4, 0.9] );

		this.graphicsDevice.setActiveShaderUniform("gLight0Color", this.lights[0].color, false);
		this.graphicsDevice.setActiveShaderUniform("gLight1Color", this.lights[1].color, false);
		this.graphicsDevice.setActiveShaderUniform("gLight0WorldPosition", this.lights[0].position, false);
		this.graphicsDevice.setActiveShaderUniform("gLight1WorldPosition", this.lights[1].position, false);

		this.customFresnel0 = new Float32Array([0.1, 0.1, 0.1465]);
		this.graphicsDevice.setActiveShaderUniform("gMaterialFresnel0", this.customFresnel0, false);
		this.graphicsDevice.setActiveShaderUniform("gMaterialRoughness", 18);
	}
	else
	{
		this.lights[0].init( [0.0, 1400.0, 0.0], [1.0, 1.0, 1.0] );
		this.graphicsDevice.setActiveShaderUniform("gLight0Color", this.lights[0].color, false);
		this.graphicsDevice.setActiveShaderUniform("gLight0WorldPosition", this.lights[0].position, false);
		
		this.graphicsDevice.setActiveShaderUniform("gMaterialRoughness", 48);
	}

}


CustomApp.prototype.userInitializeContent = function()
{
	if (this.loader.hasPendingAsyncCalls())
	{
		setTimeout(this.userInitializeContent.bind(this), 2000);
		return;
	}
	
	this.setDefaultRenderStates();
	
	this.resourceManager.initializeAllQueuedPackages();
	
	// Create camera
	this.camera.initPerspective(Math.PI/3.0, this.viewportWidth/this.viewportHeight, 1.0, 5000.0);
	this.camera.initLookAt( [-500.0, 700.0, 0.0], vec3.normalize([-1.0, 0.0, 0.0]), vec3.normalize([0.0, 1.0, 0.0]) );

	// Create lights
	this.lights[0] = new efw.PointLight();
	this.lights[1] = new efw.PointLight();
	
	// Compile all vertex shaders
	var vertexShaders = [];
	vertexShaders[vertexShaders.length] = this.graphicsDevice.compileVS(this._uberShaderVertexSource, '-DVS_SIMPLE');
	vertexShaders[vertexShaders.length] = this.graphicsDevice.compileVS(this._uberShaderVertexSource, '-DNORMAL_ENCODING_U16 -DVS_COMPRESSED');
	vertexShaders[vertexShaders.length] = this.graphicsDevice.compileVS(this._uberShaderVertexSource, '-DNORMAL_ENCODING_AZIMUTHAL -DVS_COMPRESSED');
	vertexShaders[vertexShaders.length] = this.graphicsDevice.compileVS(this._uberShaderVertexSource, '-DNORMAL_ENCODING_SPHEREMAP -DVS_COMPRESSED');

	// Compile all fragment shaders
	var fragmentShaders = [];
	fragmentShaders[fragmentShaders.length] = this.graphicsDevice.compilePS(this._uberShaderFragmentSource, '-DFS_SIMPLE');
	fragmentShaders[fragmentShaders.length] = this.graphicsDevice.compilePS(this._uberShaderFragmentSource, '-DFS_PHYSICALLY_2L');
	
	// Link all programs
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[0], fragmentShaders[0]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[1], fragmentShaders[0]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[2], fragmentShaders[0]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[3], fragmentShaders[0]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[0], fragmentShaders[1]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[1], fragmentShaders[1]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[2], fragmentShaders[1]) );
	this.shaderPrograms.push( this.graphicsDevice.createShaderProgram(vertexShaders[3], fragmentShaders[1]) );

	this.setShader(7);

	// Start
	this.run();
}


CustomApp.prototype.userUpdate = function(elapsedTimeMillis)
{
	// Update camera
	if (this.inputs.mouse.isPressed[0])
	{
		var deltaX = this.inputs.mouse.positionDelta[0] * elapsedTimeMillis * 0.05;
		var deltaY = -this.inputs.mouse.positionDelta[1] * elapsedTimeMillis * 0.07;
		this.camera.rotateLookAt(deltaX, deltaY);
	}

	if (this.inputs.mouse.wheelDelta != 0)
	{
		var walkTime = -this.inputs.mouse.wheelDelta * elapsedTimeMillis * 7;
		this.camera.walk(walkTime);
	}
	
	// Update camera
	this.camera.update(elapsedTimeMillis);
	if (this.camera.hasChanged)
	{
		var matWVP = mat4.mul(this.matWorld, this.camera.viewProjectionMatrix);

		//this.graphicsDevice.setActiveShaderUniform("gMatWVP", new Float32Array(matWVP), false);
		//this.graphicsDevice.setActiveShaderUniform("gWorldEyePosition", new Float32Array(this.camera.position), false);
		this.graphicsDevice.setActiveShaderUniform("gMatWVP", matWVP, false);
		this.graphicsDevice.setActiveShaderUniform("gWorldEyePosition", this.camera.position, false);
	}
	
	if (this.shaderIndex >= 4)
	{
		// Rotate lights around
		var angle = elapsedTimeMillis * 0.5;
		var cosAngle = Math.cos(angle);
		var sinAngle = Math.sin(angle);
		this.lights[0].position[2] = this.lights[0].position[2] * cosAngle - this.lights[0].position[0] * sinAngle;
		this.lights[0].position[0] = this.lights[0].position[0] * cosAngle + this.lights[0].position[2] * sinAngle;
		this.lights[1].position[2] = this.lights[1].position[2] * cosAngle - this.lights[1].position[0] * sinAngle;
		this.lights[1].position[0] = this.lights[1].position[0] * cosAngle + this.lights[1].position[2] * sinAngle;
	
		// Update light position	
		this.graphicsDevice.setActiveShaderUniform("gLight0WorldPosition", this.lights[0].position, false);
		this.graphicsDevice.setActiveShaderUniform("gLight1WorldPosition", this.lights[1].position, false);
	}
	
	//startRandomizeLight();
}


CustomApp.prototype.userDraw = function(elapsedTimeMillis)
{
	this.fpsHud.innerHTML = 'Update Fps/Ms: ' + this.fpsStats.updateFps + '/' + this.fpsStats.updateTimeMs + 
	'<br/>Draw Fps/Ms: ' + this.fpsStats.drawFps + '/' + this.fpsStats.drawTimeMs;
	
	this.graphicsDevice.setViewport(0, 0, this.viewportWidth, this.viewportHeight);
	this.graphicsDevice.clear(true, true, false);
	
	for (var key in this.resourceManager.resourceTable.meshes)
	{
		var mesh = this.resourceManager.resourceTable.meshes[key];
		var material = this.resourceManager.resourceTable.materials[mesh.materialGuid];
		//console.log(mesh);
		//console.log(material);
		
		if (material)
		{
        	this.graphicsDevice.setTexture(0, material.albedoTexture);
		}

		if (this._useMeshCompressionType != 0)
		{
			this.graphicsDevice.setActiveShaderUniform("gPositionScale", mesh.optPositionScale, false);
			this.graphicsDevice.setActiveShaderUniform("gPositionBias", mesh.optPositionBias, false);
			this.graphicsDevice.setActiveShaderUniform("gUvScaleBias", mesh.optUv0ScaleBias, false);
		}
		
		this.graphicsDevice.setIndexBuffer(mesh.indexBuffer);
		this.graphicsDevice.setVertexBuffer(mesh.vertexBuffer);
		this.graphicsDevice.setVertexFormat(mesh.vertexFormat);
		this.graphicsDevice.drawIndexed(mesh.indexCount);
	}

	if (this._isFirstDraw)
	{
		this._isFirstDraw = false;
		this.showStartMessage();
		this.topMenu.style.display = 'inherit';
	}
}
