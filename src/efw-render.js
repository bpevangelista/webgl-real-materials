/**
 * @constructor 
 */
/*
efw.GL = function(platformGraphicsDevice)
{
	var wrapFunction = function(name) {
		return function() { return platformGraphicsDevice[name] };
	}

    this.DEPTH_BUFFER_BIT               = 0x00000100;
    this.STENCIL_BUFFER_BIT             = 0x00000400;
    this.COLOR_BUFFER_BIT               = 0x00004000;
    this.POINTS                         = 0x0000;
    this.LINES                          = 0x0001;
    this.LINE_LOOP                      = 0x0002;
    this.LINE_STRIP                     = 0x0003;
    this.TRIANGLES                      = 0x0004;
    this.TRIANGLE_STRIP                 = 0x0005;
    this.TRIANGLE_FAN                   = 0x0006;
    this.ZERO                           = 0;
    this.ONE                            = 1;
    this.SRC_COLOR                      = 0x0300;
    this.ONE_MINUS_SRC_COLOR            = 0x0301;
    this.SRC_ALPHA                      = 0x0302;
    this.ONE_MINUS_SRC_ALPHA            = 0x0303;
    this.DST_ALPHA                      = 0x0304;
    this.ONE_MINUS_DST_ALPHA            = 0x0305;
    this.DST_COLOR                      = 0x0306;
    this.ONE_MINUS_DST_COLOR            = 0x0307;
    this.SRC_ALPHA_SATURATE             = 0x0308;
    this.FUNC_ADD                       = 0x8006;
    this.BLEND_EQUATION                 = 0x8009;
    this.BLEND_EQUATION_RGB             = 0x8009;
    this.BLEND_EQUATION_ALPHA           = 0x883D;
    this.FUNC_SUBTRACT                  = 0x800A;
    this.FUNC_REVERSE_SUBTRACT          = 0x800B;
    this.BLEND_DST_RGB                  = 0x80C8;
    this.BLEND_SRC_RGB                  = 0x80C9;
    this.BLEND_DST_ALPHA                = 0x80CA;
    this.BLEND_SRC_ALPHA                = 0x80CB;
    this.CONSTANT_COLOR                 = 0x8001;
    this.ONE_MINUS_CONSTANT_COLOR       = 0x8002;
    this.CONSTANT_ALPHA                 = 0x8003;
    this.ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
    this.BLEND_COLOR                    = 0x8005;
    this.ARRAY_BUFFER                   = 0x8892;
    this.ELEMENT_ARRAY_BUFFER           = 0x8893;
    this.ARRAY_BUFFER_BINDING           = 0x8894;
    this.ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;
    this.STREAM_DRAW                    = 0x88E0;
    this.STATIC_DRAW                    = 0x88E4;
    this.DYNAMIC_DRAW                   = 0x88E8;
    this.BUFFER_SIZE                    = 0x8764;
    this.BUFFER_USAGE                   = 0x8765;
    this.CURRENT_VERTEX_ATTRIB          = 0x8626;
    this.FRONT                          = 0x0404;
    this.BACK                           = 0x0405;
    this.FRONT_AND_BACK                 = 0x0408;
    this.CULL_FACE                      = 0x0B44;
    this.BLEND                          = 0x0BE2;
    this.DITHER                         = 0x0BD0;
    this.STENCIL_TEST                   = 0x0B90;
    this.DEPTH_TEST                     = 0x0B71;
    this.SCISSOR_TEST                   = 0x0C11;
    this.POLYGON_OFFSET_FILL            = 0x8037;
    this.SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
    this.SAMPLE_COVERAGE                = 0x80A0;
    this.NO_ERROR                       = 0;
    this.INVALID_ENUM                   = 0x0500;
    this.INVALID_VALUE                  = 0x0501;
    this.INVALID_OPERATION              = 0x0502;
    this.OUT_OF_MEMORY                  = 0x0505;
    this.CW                             = 0x0900;
    this.CCW                            = 0x0901;
    this.LINE_WIDTH                     = 0x0B21;
    this.ALIASED_POINT_SIZE_RANGE       = 0x846D;
    this.ALIASED_LINE_WIDTH_RANGE       = 0x846E;
    this.CULL_FACE_MODE                 = 0x0B45;
    this.FRONT_FACE                     = 0x0B46;
    this.DEPTH_RANGE                    = 0x0B70;
    this.DEPTH_WRITEMASK                = 0x0B72;
    this.DEPTH_CLEAR_VALUE              = 0x0B73;
    this.DEPTH_FUNC                     = 0x0B74;
    this.STENCIL_CLEAR_VALUE            = 0x0B91;
    this.STENCIL_FUNC                   = 0x0B92;
    this.STENCIL_FAIL                   = 0x0B94;
    this.STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
    this.STENCIL_PASS_DEPTH_PASS        = 0x0B96;
    this.STENCIL_REF                    = 0x0B97;
    this.STENCIL_VALUE_MASK             = 0x0B93;
    this.STENCIL_WRITEMASK              = 0x0B98;
    this.STENCIL_BACK_FUNC              = 0x8800;
    this.STENCIL_BACK_FAIL              = 0x8801;
    this.STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
    this.STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
    this.STENCIL_BACK_REF               = 0x8CA3;
    this.STENCIL_BACK_VALUE_MASK        = 0x8CA4;
    this.STENCIL_BACK_WRITEMASK         = 0x8CA5;
    this.VIEWPORT                       = 0x0BA2;
    this.SCISSOR_BOX                    = 0x0C10;
    this.COLOR_CLEAR_VALUE              = 0x0C22;
    this.COLOR_WRITEMASK                = 0x0C23;
    this.UNPACK_ALIGNMENT               = 0x0CF5;
    this.PACK_ALIGNMENT                 = 0x0D05;
    this.MAX_TEXTURE_SIZE               = 0x0D33;
    this.MAX_VIEWPORT_DIMS              = 0x0D3A;
    this.SUBPIXEL_BITS                  = 0x0D50;
    this.RED_BITS                       = 0x0D52;
    this.GREEN_BITS                     = 0x0D53;
    this.BLUE_BITS                      = 0x0D54;
    this.ALPHA_BITS                     = 0x0D55;
    this.DEPTH_BITS                     = 0x0D56;
    this.STENCIL_BITS                   = 0x0D57;
    this.POLYGON_OFFSET_UNITS           = 0x2A00;
    this.POLYGON_OFFSET_FACTOR          = 0x8038;
    this.TEXTURE_BINDING_2D             = 0x8069;
    this.SAMPLE_BUFFERS                 = 0x80A8;
    this.SAMPLES                        = 0x80A9;
    this.SAMPLE_COVERAGE_VALUE          = 0x80AA;
    this.SAMPLE_COVERAGE_INVERT         = 0x80AB;
    this.COMPRESSED_TEXTURE_FORMATS     = 0x86A3;
    this.DONT_CARE                      = 0x1100;
    this.FASTEST                        = 0x1101;
    this.NICEST                         = 0x1102;
    this.GENERATE_MIPMAP_HINT            = 0x8192;
    this.BYTE                           = 0x1400;
    this.UNSIGNED_BYTE                  = 0x1401;
    this.SHORT                          = 0x1402;
    this.UNSIGNED_SHORT                 = 0x1403;
    this.INT                            = 0x1404;
    this.UNSIGNED_INT                   = 0x1405;
    this.FLOAT                          = 0x1406;
    this.DEPTH_COMPONENT                = 0x1902;
    this.ALPHA                          = 0x1906;
    this.RGB                            = 0x1907;
    this.RGBA                           = 0x1908;
    this.LUMINANCE                      = 0x1909;
    this.LUMINANCE_ALPHA                = 0x190A;
    this.UNSIGNED_SHORT_4_4_4_4         = 0x8033;
    this.UNSIGNED_SHORT_5_5_5_1         = 0x8034;
    this.UNSIGNED_SHORT_5_6_5           = 0x8363;
    this.FRAGMENT_SHADER                  = 0x8B30;
    this.VERTEX_SHADER                    = 0x8B31;
    this.MAX_VERTEX_ATTRIBS               = 0x8869;
    this.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
    this.MAX_VARYING_VECTORS              = 0x8DFC;
    this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
    this.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
    this.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
    this.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
    this.SHADER_TYPE                      = 0x8B4F;
    this.DELETE_STATUS                    = 0x8B80;
    this.LINK_STATUS                      = 0x8B82;
    this.VALIDATE_STATUS                  = 0x8B83;
    this.ATTACHED_SHADERS                 = 0x8B85;
    this.ACTIVE_UNIFORMS                  = 0x8B86;
    this.ACTIVE_ATTRIBUTES                = 0x8B89;
    this.SHADING_LANGUAGE_VERSION         = 0x8B8C;
    this.CURRENT_PROGRAM                  = 0x8B8D;
    this.NEVER                          = 0x0200;
    this.LESS                           = 0x0201;
    this.EQUAL                          = 0x0202;
    this.LEQUAL                         = 0x0203;
    this.GREATER                        = 0x0204;
    this.NOTEQUAL                       = 0x0205;
    this.GEQUAL                         = 0x0206;
    this.ALWAYS                         = 0x0207;
    this.KEEP                           = 0x1E00;
    this.REPLACE                        = 0x1E01;
    this.INCR                           = 0x1E02;
    this.DECR                           = 0x1E03;
    this.INVERT                         = 0x150A;
    this.INCR_WRAP                      = 0x8507;
    this.DECR_WRAP                      = 0x8508;
    this.VENDOR                         = 0x1F00;
    this.RENDERER                       = 0x1F01;
    this.VERSION                        = 0x1F02;
    this.NEAREST                        = 0x2600;
    this.LINEAR                         = 0x2601;
    this.NEAREST_MIPMAP_NEAREST         = 0x2700;
    this.LINEAR_MIPMAP_NEAREST          = 0x2701;
    this.NEAREST_MIPMAP_LINEAR          = 0x2702;
    this.LINEAR_MIPMAP_LINEAR           = 0x2703;
    this.TEXTURE_MAG_FILTER             = 0x2800;
    this.TEXTURE_MIN_FILTER             = 0x2801;
    this.TEXTURE_WRAP_S                 = 0x2802;
    this.TEXTURE_WRAP_T                 = 0x2803;
    this.TEXTURE_2D                     = 0x0DE1;
    this.TEXTURE                        = 0x1702;
    this.TEXTURE_CUBE_MAP               = 0x8513;
    this.TEXTURE_BINDING_CUBE_MAP       = 0x8514;
    this.TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
    this.TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
    this.TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
    this.TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
    this.TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
    this.TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
    this.MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;
    this.TEXTURE0                       = 0x84C0;
    this.TEXTURE1                       = 0x84C1;
    this.TEXTURE2                       = 0x84C2;
    this.TEXTURE3                       = 0x84C3;
    this.TEXTURE4                       = 0x84C4;
    this.TEXTURE5                       = 0x84C5;
    this.TEXTURE6                       = 0x84C6;
    this.TEXTURE7                       = 0x84C7;
    this.TEXTURE8                       = 0x84C8;
    this.TEXTURE9                       = 0x84C9;
    this.TEXTURE10                      = 0x84CA;
    this.TEXTURE11                      = 0x84CB;
    this.TEXTURE12                      = 0x84CC;
    this.TEXTURE13                      = 0x84CD;
    this.TEXTURE14                      = 0x84CE;
    this.TEXTURE15                      = 0x84CF;
    this.TEXTURE16                      = 0x84D0;
    this.TEXTURE17                      = 0x84D1;
    this.TEXTURE18                      = 0x84D2;
    this.TEXTURE19                      = 0x84D3;
    this.TEXTURE20                      = 0x84D4;
    this.TEXTURE21                      = 0x84D5;
    this.TEXTURE22                      = 0x84D6;
    this.TEXTURE23                      = 0x84D7;
    this.TEXTURE24                      = 0x84D8;
    this.TEXTURE25                      = 0x84D9;
    this.TEXTURE26                      = 0x84DA;
    this.TEXTURE27                      = 0x84DB;
    this.TEXTURE28                      = 0x84DC;
    this.TEXTURE29                      = 0x84DD;
    this.TEXTURE30                      = 0x84DE;
    this.TEXTURE31                      = 0x84DF;
    this.ACTIVE_TEXTURE                 = 0x84E0;
    this.REPEAT                         = 0x2901;
    this.CLAMP_TO_EDGE                  = 0x812F;
    this.MIRRORED_REPEAT                = 0x8370;
    this.FLOAT_VEC2                     = 0x8B50;
    this.FLOAT_VEC3                     = 0x8B51;
    this.FLOAT_VEC4                     = 0x8B52;
    this.INT_VEC2                       = 0x8B53;
    this.INT_VEC3                       = 0x8B54;
    this.INT_VEC4                       = 0x8B55;
    this.BOOL                           = 0x8B56;
    this.BOOL_VEC2                      = 0x8B57;
    this.BOOL_VEC3                      = 0x8B58;
    this.BOOL_VEC4                      = 0x8B59;
    this.FLOAT_MAT2                     = 0x8B5A;
    this.FLOAT_MAT3                     = 0x8B5B;
    this.FLOAT_MAT4                     = 0x8B5C;
    this.SAMPLER_2D                     = 0x8B5E;
    this.SAMPLER_CUBE                   = 0x8B60;
    this.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
    this.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
    this.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
    this.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
    this.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
    this.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
    this.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;
    this.COMPILE_STATUS                 = 0x8B81;
    this.LOW_FLOAT                      = 0x8DF0;
    this.MEDIUM_FLOAT                   = 0x8DF1;
    this.HIGH_FLOAT                     = 0x8DF2;
    this.LOW_INT                        = 0x8DF3;
    this.MEDIUM_INT                     = 0x8DF4;
    this.HIGH_INT                       = 0x8DF5;
    this.FRAMEBUFFER                    = 0x8D40;
    this.RENDERBUFFER                   = 0x8D41;
    this.RGBA4                          = 0x8056;
    this.RGB5_A1                        = 0x8057;
    this.RGB565                         = 0x8D62;
    this.DEPTH_COMPONENT16              = 0x81A5;
    this.STENCIL_INDEX                  = 0x1901;
    this.STENCIL_INDEX8                 = 0x8D48;
    this.DEPTH_STENCIL                  = 0x84F9;
    this.RENDERBUFFER_WIDTH             = 0x8D42;
    this.RENDERBUFFER_HEIGHT            = 0x8D43;
    this.RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
    this.RENDERBUFFER_RED_SIZE          = 0x8D50;
    this.RENDERBUFFER_GREEN_SIZE        = 0x8D51;
    this.RENDERBUFFER_BLUE_SIZE         = 0x8D52;
    this.RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
    this.RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
    this.RENDERBUFFER_STENCIL_SIZE      = 0x8D55;
    this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
    this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
    this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
    this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;
    this.COLOR_ATTACHMENT0              = 0x8CE0;
    this.DEPTH_ATTACHMENT               = 0x8D00;
    this.STENCIL_ATTACHMENT             = 0x8D20;
    this.DEPTH_STENCIL_ATTACHMENT       = 0x821A;
    this.NONE                           = 0;
    this.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
    this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
    this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
    this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
    this.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;
    this.FRAMEBUFFER_BINDING            = 0x8CA6;
    this.RENDERBUFFER_BINDING           = 0x8CA7;
    this.MAX_RENDERBUFFER_SIZE          = 0x84E8;
    this.INVALID_FRAMEBUFFER_OPERATION  = 0x0506;
    this.UNPACK_FLIP_Y_WEBGL            = 0x9240;
    this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
    this.CONTEXT_LOST_WEBGL             = 0x9242;
    this.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
    this.BROWSER_DEFAULT_WEBGL          = 0x9244;

	// 
	// ----------
	this.activeTexture = wrapFunction("activeTexture");
	this.attachShader = wrapFunction("attachShader");
	this.bindBuffer = wrapFunction("bindBuffer");
	this.bindTexture = wrapFunction("bindTexture");
	this.bufferData = wrapFunction("bufferData");
	this.clear = wrapFunction("clear");
	
	//wrapFunction(this, "clearColor");
	this.clearColor = wrapFunction("clearColor");
	//wrapFunction("clearColor");
	
	this.clearDepth = wrapFunction("clearDepth"); 
	this.compileShader = wrapFunction("compileShader");
	this.compressedTexImage2D = wrapFunction("compressedTexImage2D");
	this.createProgram = wrapFunction("createProgram");
	this.createBuffer = wrapFunction("createBuffer");
	this.createShader = wrapFunction("createShader");
	this.createTexture = wrapFunction("createTexture");
	this.cullFace = wrapFunction("cullFace");
	this.deleteProgram = wrapFunction("deleteProgram");
	this.deleteShader = wrapFunction("deleteShader");
	this.disableVertexAttribArray = wrapFunction("disableVertexAttribArray");
	this.drawElements = wrapFunction("drawElements");
	this.enable = wrapFunction("enable");
	this.enableVertexAttribArray = wrapFunction("enableVertexAttribArray");
	this.generateMipmap = wrapFunction("generateMipmap");

	this.getActiveAttrib = wrapFunction("getActiveAttrib");
	this.getActiveUniform = wrapFunction("getActiveUniform");
	this.getAttribLocation  = wrapFunction("getAttribLocation");
	this.getUniformLocation = wrapFunction("getUniformLocation");
	this.getProgramParameter = wrapFunction("getProgramParameter");
	this.getShaderInfoLog = wrapFunction("getShaderInfoLog");
	this.getShaderParameter = wrapFunction("getShaderParameter");

	this.linkProgram = wrapFunction("linkProgram");
	this.pixelStorei = wrapFunction("pixelStorei");
	this.shaderSource = wrapFunction("shaderSource");
	this.texImage2D = wrapFunction("texImage2D");
	this.texParameteri = wrapFunction("texParameteri");
	
	this.uniform1f = wrapFunction("uniform1f");
	this.uniform1i = wrapFunction("uniform1i");
	this.uniform3fv = wrapFunction("uniform3fv");
	this.uniform4fv = wrapFunction("uniform4fv");
	this.uniformMatrix3fv = wrapFunction("uniformMatrix3fv");
	this.uniformMatrix4fv = wrapFunction("uniformMatrix4fv");
	this.useProgram = wrapFunction("useProgram");
	this.vertexAttribPointer = wrapFunction("vertexAttribPointer");
	this.viewport = wrapFunction("viewport");
}
*/

/**
 * @constructor 
 */
efw.GraphicsDevice = function()
{
	// 
	// --------------------------------------------------------------------------------------------------------------
	this.canvas = document.createElement('canvas');
	this.gl = null;
	this.glRelease = null; // OpenGL release
	this.glExtensions = [];
	
	this.activeShaderProgram = null;

	// 
	// --------------------------------------------------------------------------------------------------------------
	try {
		this.gl = this.canvas.getContext("webgl")
			|| this.canvas.getContext("experimental-webgl");
		this.glRelease = this.gl;
	} 
	catch (e) {
		window.console.log("*** Failed to create GraphicsDevice");
		return false;
	}
	
	if (this.gl) {
		// TODO Move to graphics device
		// Grab available extensions
		this.glExtensions.push( this.gl.getExtension("WEBGL_compressed_texture_s3tc") ||
			this.gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || 
			this.gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") );
		//window.console.log(glExtensions);
		
		if (this.gl.compressedTexImage2D != null)
		{
			this.gl.COMPRESSED_RGBA_S3TC_DXT1_EXT = this.glExtensions[0].COMPRESSED_RGBA_S3TC_DXT1_EXT;
			this.gl.COMPRESSED_RGBA_S3TC_DXT3_EXT = this.glExtensions[0].COMPRESSED_RGBA_S3TC_DXT3_EXT;
			this.gl.COMPRESSED_RGBA_S3TC_DXT5_EXT = this.glExtensions[0].COMPRESSED_RGBA_S3TC_DXT5_EXT;
			this.gl.COMPRESSED_RGB_S3TC_DXT1_EXT = this.glExtensions[0].COMPRESSED_RGB_S3TC_DXT1_EXT;
		}
	}



	this.generateTextureMipmaps = function(textureBuffer)
	{
		this.gl.bindTexture(this.gl.TEXTURE_2D, textureBuffer);
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
	}
	
	
	this.compileVS = function(shaderSource, optDefines)
	{
		return this._compileShaderWithDefines(shaderSource, this.gl.VERTEX_SHADER, optDefines);
	}
	
	
	this.compilePS = function(shaderSource, optDefines)
	{
		return this._compileShaderWithDefines(shaderSource, this.gl.FRAGMENT_SHADER, optDefines);
	}
	

	this.createBuffer = function()
	{
		return this.gl.createBuffer();
	}
	
	
	this.createShaderProgram = function(vertexShader, fragmentShader)
	{
		var program = this.gl.createProgram();
		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);
		
		if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS) == false)
		{
			window.console.error("Error linking shader programs: " + vertexShader + " and " + fragmentShader);
	
			this.gl.deleteProgram(program);
			program = null;
		}
		
		if (program != null)
		{
			var result = new efw.ShaderProgram();
			result.init(program, 
				this._getShaderProgramUniformTable(program), 
				this._getShaderProgramAttribTable(program));
	
			return result;
		}
		
		return program;
	}


	this.createTexture = function()
	{
		return this.gl.createTexture();
	}
	
	
	this.drawIndexed = function(indexCount)
	{
		this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, 0);
	}
	
	
	this.setActiveShaderUniform = function(uniformName, data, transposeMatrix)
	{
		return this.setShaderUniform(this.activeShaderProgram, uniformName, data, transposeMatrix);
	}


	this.setDebugEnable = function(enabled)
	{
		this.gl = this.glRelease;
		
		var debugInstance = null;
		if (typeof WebGLDebugUtils != 'undefined')
			debugInstance = WebGLDebugUtils;
		
		if (enabled && debugInstance != null)
		{
			window.console.log("*** Graphics device debug is enabled");
			this.gl = WebGLDebugUtils.makeDebugContext(this.gl);
		}
	}


	this.setIndexBuffer = function(indexBuffer)
	{
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	}


	this.setShaderProgram = function(shaderProgram)
	{
		for (var i=0; i<16; i++)
			this.gl.disableVertexAttribArray(i);

		this.gl.useProgram(shaderProgram.program);
		this.activeShaderProgram = shaderProgram;
		
		for (var key in this.activeShaderProgram.attribs)
		{
			this.gl.enableVertexAttribArray( this.activeShaderProgram.attribs[key].location );
		}		
	}
	
	
	this.setShaderUniform = function(shaderProgram, uniformName, data, transposeMatrix)
	{
		transposeMatrix = transposeMatrix || false;
		var uniform = shaderProgram.uniforms[uniformName];
		
		switch (uniform.type)
		{
			case this.gl.FLOAT:
				this.gl.uniform1f(uniform.location, data);
				break;
				
			case this.gl.FLOAT_VEC2:
				this.gl.uniform2fv(uniform.location, data);
				break; 
			
			case this.gl.FLOAT_VEC3:
			this.gl.uniform3fv(uniform.location, data);
				break;
				
			case this.gl.FLOAT_VEC4:
				this.gl.uniform4fv(uniform.location, data);
				break;
				
			case this.gl.INT:
				this.gl.uniform1i(uniform.location, data);
				break;
				
			case this.gl.INT_VEC2:
				this.gl.uniform2iv(uniform.location, data);
				break;
				
			case this.gl.INT_VEC3:
				this.gl.uniform3iv(uniform.location, data);
				break;
				
			case this.gl.INT_VEC4:
				this.gl.uniform4iv(uniform.location, data);
				break;
				
			/*
			case this.gl.BOOL:
				break;
				
			case this.gl.BOOL_VEC2:
				break;
				
			case this.gl.BOOL_VEC3:
				break;
				
			case this.gl.BOOL_VEC4:
				break;
			*/
			
			case this.gl.FLOAT_MAT2:
				this.gl.uniformMatrix2fv(uniform.location, transposeMatrix, data);
				break;
				
			case this.gl.FLOAT_MAT3:
				this.gl.uniformMatrix3fv(uniform.location, transposeMatrix, data);
				break;
				
			case this.gl.FLOAT_MAT4:
				this.gl.uniformMatrix4fv(uniform.location, transposeMatrix, data);
				break;

			// TODO Same as int?
			case this.gl.SAMPLER_2D:
			case this.gl.SAMPLER_CUBE:
				this.gl.uniform1i(uniform.location, data);
				break;
		}
	}
	
	
	this.setTexture = function(textureBuffer)
	{
		this.gl.bindTexture(this.gl.TEXTURE_2D, textureBuffer);
	}
	
	
	this.setTextureFiltering = function(textureBuffer, magFilter, minFilter)
	{
		var internalMin = this.gl.NEAREST;
		var internalMag = this.gl.LINEAR;
		
		switch(magFilter)
		{
			case efw.TextureFilters.kMagPoint:
				internalMag = this.gl.NEAREST;
				break;
			
			case efw.TextureFilters.kMagLinear:
				internalMag = this.gl.LINEAR;
				break;
		}
		
		switch(minFilter)
		{
			case efw.TextureFilters.kMinPointNoMip:
				internalMin = this.gl.NEAREST;
				break;
				
			case efw.TextureFilters.kMinLinearNoMip:
				internalMin = this.gl.LINEAR;
				break;
				
			case efw.TextureFilters.kMinLinearMipNear:
				internalMin = this.gl.LINEAR_MIPMAP_NEAREST;
				break;
				
			case efw.TextureFilters.kMinLinearMipLinear:
				internalMin = this.gl.LINEAR_MIPMAP_LINEAR;
				break;
		}
	
		this.gl.bindTexture(this.gl.TEXTURE_2D, textureBuffer);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, internalMag);
    	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, internalMin);
	}
	
	
	this.setVertexBuffer = function(vertexBuffer)
	{
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
	}
	
	
	this.setVertexFormat = function(vertexFormat)
	{
		var vstride = vertexFormat.stride;
		var vattribs = vertexFormat.attribs;
		
		//this.gl.bindBuffer(graphicsDevice.ARRAY_BUFFER, mesh.vertexBuffer);
		for (var key in this.activeShaderProgram.attribs)
		{
			var attribute = this.activeShaderProgram.attribs[key];
			this.gl.vertexAttribPointer(attribute.location, vattribs[key].count, vattribs[key].type, vattribs[key].normalized, vstride, vattribs[key].offset);
			
			//window.console.log(attribute);
			//window.console.log(vattribs[key]);
		}
	}
	

	this.uploadIndexBufferData = function(buffer, indexData)
	{
   		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indexData, this.gl.STATIC_DRAW);
	}
	
	
	this.uploadTextureData = function(textureBuffer, mipLevel, textureFormat, mipWidth, mipHeight, mipBorderColor, mipData)
	{
		this.gl.bindTexture(this.gl.TEXTURE_2D, textureBuffer);
		
		var isCompressed = false;
		var internalFormat = this.gl.RGBA;
		switch(textureFormat)
		{
			case efw.TextureFormats.kL8:
				internalFormat = this.gl.LUMINANCE;
				break;
			case efw.TextureFormats.kRGB:
				internalFormat = this.gl.RGB;
				break;
			case efw.TextureFormats.kRGBA:
				internalFormat = this.gl.RGBA;
				break;
			case efw.TextureFormats.kDXT1:
				internalFormat = this.gl.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				isCompressed = true;
				break;
			case efw.TextureFormats.kDXT3:
				internalFormat = this.gl.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				isCompressed = true;
				break;
			case efw.TextureFormats.kDXT5:
				internalFormat = this.gl.COMPRESSED_RGBA_S3TC_DXT5_EXT;
				isCompressed = true;
				break;
		}
		
		if (isCompressed)
			this.gl.compressedTexImage2D(this.gl.TEXTURE_2D, mipLevel, internalFormat, mipWidth, mipHeight, mipBorderColor, mipData);
		else
		{
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
			this.gl.texImage2D(this.gl.TEXTURE_2D, mipLevel, internalFormat, mipWidth, mipHeight, mipBorderColor, internalFormat, this.gl.UNSIGNED_BYTE, mipData);
		}
	}
	
	
	this.uploadVertexBufferData = function(buffer, vertexData)
	{
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);
	}
	
	
	this._compileShaderWithDefines = function(shaderSource, shaderType, defines)
	{
		var newShaderSource = shaderSource;
		if (defines != null)
			newShaderSource = _parseShaderDefines(defines) + shaderSource;
		
		var shader = this.gl.createShader(shaderType);
		if (!shader)
			return null;
		
		this.gl.shaderSource(shader, newShaderSource);
		this.gl.compileShader(shader);
		
		if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) == false)
		{
			var lines = shaderSource.split(/[\r][\n]/);
			for (var i=0; i<lines.length; i++)
				lines[i] = '' + (i+1) + ': ' + lines[i];
				
			window.console.log("Shader source:\n" + lines.join('\r\n'));
			window.console.error("Error compiling shader:\n" + this.gl.getShaderInfoLog(shader));
			
			this.gl.deleteShader(shader);
			shader = null;
		}
			
		return shader;
	}
	
	
	this._getShaderProgramUniformTable = function(shaderProgram)
	{
		var uniformTable = {};
	
		var uniformCount = this.gl.getProgramParameter(shaderProgram, this.gl.ACTIVE_UNIFORMS);
		for (var i=0; i<uniformCount; i++)
		{
			var uniform = this.gl.getActiveUniform(shaderProgram, i);
			if (uniform != null)
			{
				var uniformLocation = this.gl.getUniformLocation(shaderProgram, uniform.name);
				//window.console.log(uniform);
				//window.console.log(uniformLocation);
	
				var newEntry = new efw.ShaderUniformEntry();
				newEntry.init(uniformLocation, uniform.type);
				uniformTable[uniform.name] = newEntry;
			}
		}
		
		return uniformTable;
	}
	
	
	this._getShaderProgramAttribTable = function(shaderProgram)
	{
		var attribTable = {};
		
		var attribCount = this.gl.getProgramParameter(shaderProgram, this.gl.ACTIVE_ATTRIBUTES);
		for (var i=0; i<attribCount; i++)
		{
			var attrib = this.gl.getActiveAttrib(shaderProgram, i);
			if (attrib != null)
			{
				var attribLocation = this.gl.getAttribLocation(shaderProgram, attrib.name);
				//window.console.log(attrib);
				//window.console.log(attribLocation);
	
				var newEntry = new efw.ShaderAttribEntry();
				newEntry.init(attribLocation, attrib.type);
				attribTable[attrib.name] = newEntry;
			}
		}
		
		return attribTable;
	}


	var _parseShaderDefines = function(defines)
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
					window.console.log("Error parsing shader defines!");
				}
			}
		}
		result += '\r\n';
		
		//window.console.log(result);
		return result;
	}

}

