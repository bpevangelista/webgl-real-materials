var efw = efw || {};
efw.vec3 = efw.vec3 || {};
efw.vec4 = efw.vec4 || {};
efw.mat4 = efw.mat4 || {};

efw.kEpsilon = 1e-6;
efw.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
efw.assert = function(expression) {
	if ((expression) == false)
	{
		if (window.console)
		{
			if (window.console.error)
				console.error("Assert failed!");
			else if (window.console.log)
				console.log("Assert failed!");
		}
		else
		{
			// TODO
		}
	}	
}

//efw.vec3.isVec3 = function(m){}
efw.vec3.isVec3 = function(v) {
	return (v && v.length == 3 &&
		efw.isNumber(v[0]) &&
		efw.isNumber(v[1]) &&
		efw.isNumber(v[2])
	);
}
efw.vec3.isUnit = function(v) {
	efw.assert( efw.vec3.isVec3(v) );
	return Math.abs(vec3.lengthSquared(v) - 1.0) < efw.kEpsilon;
}
efw.vec3.create = function(x, y, z) {
	return [x, y, z];
}
efw.vec3.add = function(v1, v2) {
	efw.assert( efw.vec3.isVec3(v1) && efw.vec3.isVec3(v2) );
	return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
}
efw.vec3.sub = function(v1, v2) {
	efw.assert( efw.vec3.isVec3(v1) && efw.vec3.isVec3(v2) );
	return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
}
efw.vec3.mul = function(v1, v2) {
	efw.assert( efw.vec3.isVec3(v1) && efw.vec3.isVec3(v2) );
	return [ v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2] ];
}
efw.vec3.mulMat4 = function(v, m) {
	efw.assert( efw.vec3.isVec3(v) && efw.mat4.isMat4(m) );
	return [ 
		v[0]*m[0]+v[1]*m[4]+v[2]*m[8],
		v[0]*m[1]+v[1]*m[5]+v[2]*m[9],
		v[0]*m[2]+v[1]*m[6]+v[2]*m[10] 
		];
}
efw.vec3.mulScalar = function(v, s) {
	efw.assert( efw.vec3.isVec3(v) && efw.isNumber(s) );
	return [ v[0]*s, v[1]*s, v[2]*s ];
}
efw.vec3.length = function(v) {
	efw.assert( efw.vec3.isVec3(v) );
	return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
}
efw.vec3.lengthSquared = function(v) {
	efw.assert( efw.vec3.isVec3(v) );
	return v[0]*v[0]+v[1]*v[1]+v[2]*v[2];
}
efw.vec3.normalize = function(v) {
	efw.assert( efw.vec3.isVec3(v) );
	var lengthInv = 1.0/efw.vec3.length(v);
	return [v[0]*lengthInv, v[1]*lengthInv, v[2]*lengthInv];
}
efw.vec3.dot = function(v1, v2) {
	efw.assert( efw.vec3.isVec3(v1) && efw.vec3.isVec3(v2) );
	return (v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2]); 
}
efw.vec3.cross = function(v1, v2) {
	efw.assert( efw.vec3.isVec3(v1) && efw.vec3.isVec3(v2) );
	return [
		v1[1]*v2[2] - v1[2]*v2[1],
		v1[2]*v2[0] - v1[0]*v2[2],
		v1[0]*v2[1] - v1[1]*v2[0]
	];
}

//efw.vec4.isVec4 = function(m){}
efw.vec4.isVec4 = function(v) {
	return (v && v.length == 4 &&
		efw.isNumber(v[0]) &&
		efw.isNumber(v[1]) &&
		efw.isNumber(v[2]) &&
		efw.isNumber(v[3])
	);
}
efw.vec4.isUnit = function(v) {
	efw.assert( efw.vec4.isVec4(v) );
	return Math.abs(vec4.lengthSquared(v) - 1.0) < efw.kEpsilon;
}
efw.vec4.create = function(x, y, z, w) {
	return [x, y, z, w];
}
efw.vec4.add = function(v1, v2) {
	efw.assert( efw.vec4.isVec4(v1) && efw.vec4.isVec4(v2) );
	return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2], v1[3]+v2[3]];
}
efw.vec4.sub = function(v1, v2) {
	efw.assert( efw.vec4.isVec4(v1) && efw.vec4.isVec4(v2) );
	return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2], v1[3]-v2[3]];
}
efw.vec4.mul = function(v1, v2) {
	efw.assert( efw.vec4.isVec4(v1) && efw.vec4.isVec4(v2) );
	return [ v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2], v1[3]*v2[3] ];
}
efw.vec4.mulMat4 = function(v, m) {
	efw.assert( efw.vec4.isVec4(v) && efw.mat4.isMat4(m) );
	return [ 
		v[0]*m[0]+v[1]*m[4]+v[2]*m[8]+v[3]*m[12],
		v[0]*m[1]+v[1]*m[5]+v[2]*m[9]+v[3]*m[13],
		v[0]*m[2]+v[1]*m[6]+v[2]*m[10]+v[3]*m[14],
		v[0]*m[3]+v[1]*m[7]+v[2]*m[11]+v[3]*m[15]
		];
}
efw.vec4.mulScalar = function(v, s) {
	efw.assert( efw.vec4.isVec4(v) && efw.isNumber(s) );
	return [ v[0]*s, v[1]*s, v[2]*s, v[3]*s ];
}
efw.vec4.length = function(v) {
	efw.assert( efw.vec4.isVec4(v) );
	return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]+v[3]*v[3]);
}
efw.vec4.lengthSquared = function(v) {
	efw.assert( efw.vec4.isVec4(v) );
	return v[0]*v[0]+v[1]*v[1]+v[2]*v[2]+v[3]*v[3];
}
efw.vec4.normalize = function(v) {
	efw.assert( efw.vec4.isVec4(v) );
	var lengthInv = 1.0/efw.vec4.length(v);
	return [v[0]*lengthInv, v[1]*lengthInv, v[2]*lengthInv, v[3]*lengthInv];
}
efw.vec4.dot = function(v1, v2) {
	efw.assert( efw.vec4.isVec4(v1) && efw.vec4.isVec4(v2) );
	return (v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2]+v1[3]*v2[3]);
}

// Matrices work (and shoulb be used) as row-major matrices
// Internally they are stored as column-major (required by OpenGL), 
// so if you directly access its data its in column-major order 
//
// Matrix stored as: [m00, m04, m08, m12, m01, m05 ..., m07, m11, m15]
//
// Representation:
// m00 m01 m02 m03
// m04 m05 m06 m07
// m08 m09 m10 m11
// m12 m13 m14 m15
// 
efw.mat4.log = function(m) {
	console.log("[ %f, %f, %f, %f ]\n[ %f, %f, %f, %f ]\n[ %f, %f, %f, %f ]\n[ %f, %f, %f, %f ]\n", 
		m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]);
}
//efw.mat4.isMat4 = function(m) {}
efw.mat4.isMat4 = function(m) {
	return (m && m.length == 16 &&
		efw.isNumber(m[0]) && efw.isNumber(m[1]) && efw.isNumber(m[2]) && efw.isNumber(m[3]) &&
		efw.isNumber(m[4]) && efw.isNumber(m[5]) && efw.isNumber(m[6]) && efw.isNumber(m[7]) &&
		efw.isNumber(m[8]) && efw.isNumber(m[9]) && efw.isNumber(m[10]) && efw.isNumber(m[11]) &&
		efw.isNumber(m[12]) && efw.isNumber(m[13]) && efw.isNumber(m[14]) && efw.isNumber(m[15])
	);
}
efw.mat4.create = function(m00,m10,m20,m30,m01,m11,m21,m31,m02,m12,m22,m32,m03,m13,m23,m33) {
	return [
		m00,m10,m20,m30,
		m01,m11,m21,m31,
		m02,m12,m22,m32,
		m03,m13,m23,m33
	];
}
efw.mat4.createFromMat3 = function(m33) {
	return [
		m33[0],m33[1],m33[2],0,
		m33[3],m33[4],m33[5],0,
		m33[6],m33[7],m33[8],0,
		0,0,0,1
	];
}
efw.mat4.createFromVec3 = function(axisX, axisY, axisZ) {
	return [
		axisX[0],axisY[0],axisZ[0],0,
		axisX[1],axisY[1],axisZ[1],0,
		axisX[2],axisY[2],axisZ[2],0,
		0,0,0,1
	];
}
efw.mat4.identity = function() {
	return [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
}
efw.mat4.transpose = function(m) {
	efw.assert( efw.mat4.isMat4(m) );
	return [
		m[0], m[4], m[8], m[12],  
		m[1], m[5], m[9], m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
	];
}
efw.mat4.mul = function(m1, m2) {
	efw.assert( efw.mat4.isMat4(m1) && efw.mat4.isMat4(m2) );
	return [
		m2[0] * m1[0] + m2[1] * m1[4] + m2[2] * m1[8] + m2[3] * m1[12],  
		m2[0] * m1[1] + m2[1] * m1[5] + m2[2] * m1[9] + m2[3] * m1[13],
		m2[0] * m1[2] + m2[1] * m1[6] + m2[2] * m1[10] + m2[3] * m1[14],
		m2[0] * m1[3] + m2[1] * m1[7] + m2[2] * m1[11] + m2[3] * m1[15],
		
		m2[4] * m1[0] + m2[5] * m1[4] + m2[6] * m1[8] + m2[7] * m1[12],  
		m2[4] * m1[1] + m2[5] * m1[5] + m2[6] * m1[9] + m2[7] * m1[13],
		m2[4] * m1[2] + m2[5] * m1[6] + m2[6] * m1[10] + m2[7] * m1[14],
		m2[4] * m1[3] + m2[5] * m1[7] + m2[6] * m1[11] + m2[7] * m1[15],
		
		m2[8] * m1[0] + m2[9] * m1[4] + m2[10] * m1[8] + m2[11] * m1[12],  
		m2[8] * m1[1] + m2[9] * m1[5] + m2[10] * m1[9] + m2[11] * m1[13],
		m2[8] * m1[2] + m2[9] * m1[6] + m2[10] * m1[10] + m2[11] * m1[14],
		m2[8] * m1[3] + m2[9] * m1[7] + m2[10] * m1[11] + m2[11] * m1[15],
		
		m2[12] * m1[0] + m2[13] * m1[4] + m2[14] * m1[8] + m2[15] * m1[12],  
		m2[12] * m1[1] + m2[13] * m1[5] + m2[14] * m1[9] + m2[15] * m1[13],
		m2[12] * m1[2] + m2[13] * m1[6] + m2[14] * m1[10] + m2[15] * m1[14],
		m2[12] * m1[3] + m2[13] * m1[7] + m2[14] * m1[11] + m2[15] * m1[15]
	];
}
efw.mat4.upper3x3 = function(m) {
	efw.assert( efw.mat4.isMat4(m) );
	return [ 
		m[0], m[1], m[2],
		m[4], m[5], m[6],
		m[8], m[9], m[10] 
	];
}
efw.mat4.lookAtRH = function(eyePos, lookAtPos, upVec) {
	efw.assert( efw.vec3.isVec3(eyePos) && efw.vec3.isVec3(lookAtPos) && efw.vec3.isVec3(upVec) );
	var axisZ = efw.vec3.normalize( efw.vec3.sub(lookAtPos, eyePos) );
	var axisX = efw.vec3.normalize( efw.vec3.cross(upVec, axisZ) );
	var axisY = efw.vec3.cross(axisZ, axisX);

	return [
		axisX[0], axisX[1], axisX[2], efw.vec3.dot(axisX, eyePos),
		axisY[0], axisY[1], axisY[2], efw.vec3.dot(axisY, eyePos),
		axisZ[0], axisZ[1], axisZ[2], efw.vec3.dot(axisZ, eyePos),
		0, 0, 0, 1
	];
}
efw.mat4.perspectiveFovRH = function(fovY, aspectRatio, nearZ, farZ) {
	efw.assert( efw.isNumber(fovY) && efw.isNumber(aspectRatio) && efw.isNumber(nearZ) && efw.isNumber(farZ) ); 
	var scaleY = 1.0/Math.tan(fovY*0.5);
	var scaleX = scaleY / aspectRatio;
	var rangeZInv = 1.0/(farZ-nearZ);
	return [
		scaleX, 0, 0, 0,
		0, scaleY, 0, 0,
		0, 0, -farZ*rangeZInv, -nearZ*farZ*rangeZInv,
		0, 0, -1, 0
	];
}
efw.mat4.rotateX = function(ang) {
	efw.assert( efw.isNumber(ang) );
	var sinAng = Math.sin(ang);
	var cosAng = Math.cos(ang);
	return [
		1, 0, 0, 0,
		0, cosAng, -sinAng, 0,
		0, sinAng, cosAng, 0,
		0, 0, 0, 1
	];
}
efw.mat4.rotateY = function(ang) {
	efw.assert( efw.isNumber(ang) );
	var sinAng = Math.sin(ang);
	var cosAng = Math.cos(ang);
	return [
		cosAng, 0, sinAng, 0,
		0, 1, 0, 0,
		-sinAng, 0, cosAng, 0,
		0, 0, 0, 1
	];
}
efw.mat4.rotateZ = function(ang) {
	efw.assert( efw.isNumber(ang) );
	var sinAng = Math.sin(ang);
	var cosAng = Math.cos(ang);
	return [
		cosAng, -sinAng, 0, 0,
		sinAng, cosAng, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];	
}
efw.mat4.scale = function(s) {
	efw.assert( efw.vec3.isVec3(s) );
	return [
		s[0], 0, 0, 0,
		0, s[1], 0, 0,
		0, 0, s[2], 0,
		0, 0, 0, 1
	];
}
efw.mat4.translate = function(t) {
	efw.assert( efw.vec3.isVec3(t) );
	return [
		1, 0, 0, t[0],
		0, 1, 0, t[1],
		0, 0, 1, t[2],
		0, 0, 0, 1
	];
}
