precision mediump float;

uniform vec3 gWorldEyePosition;
uniform vec3 gLight0WorldPosition;
uniform vec3 gLight1WorldPosition;
uniform vec3 gLight0Color;
uniform vec3 gLight1Color;

uniform sampler2D gSamplerAlbedo;
uniform vec3 gMaterialFresnel0;
uniform float gMaterialRoughness;

varying vec3 oWorldPosition;
varying vec3 oWorldNormalVec;
varying vec2 oUv0;

#ifdef MIP_OVERLAY
varying vec2 oUvDebug;
#endif


float convertShininessToRoughness(float value)
{
	return sqrt(2.0 / (value + 2.0));
}

// Refractive index is per wavelength (opt pass 3 parameters)
vec3 calculateF0(float n2)
{
	float result = (1.0 - n2) / (1.0 + n2);
	result *= result;
	return vec3(result);
}

vec3 fresnel(vec3 f0, float dotHV)
{
	// where dotHV is the cosine of the half angle between the incoming and outgoing light directions
	return f0 + (vec3(1.0) - f0) * vec3(pow(1.0 - dotHV, 5.0));
}

vec3 gamma(vec3 value)
{
	return pow(value, vec3(1.0/2.2));
}

vec3 degamma(vec3 value)
{
	return pow(value, vec3(2.2));
}

vec3 blinnPhong(vec3 normalVec, vec3 eyeVec, vec3 lightVec, vec3 materialAlbedo, float materialShininess, vec3 lightColor)
{
	vec3 halfVec = normalize(eyeVec + lightVec);
	
	
	float dotNormalLight = max(dot(normalVec, lightVec), 0.0);
	float dotNormalHalf = max(dot(normalVec, halfVec), 0.0);
	float dotEyeHalf = max(dot(eyeVec, halfVec), 0.0);
	
	// Specular
	vec3 specularFresnel = fresnel(gMaterialFresnel0, dotEyeHalf);
	//float specularNdf = ( pow(dotHalfNormal, gRoughness) + 2.0 ) * 0.5; 
	float oneOverPi = 1.0/3.141592;
	float oneOver2Pi = 0.5/3.141592;
	float specularNormalization = materialShininess * oneOver2Pi + oneOverPi;
	//float specularNormalization = (materialShininess + 2.0) / (2.0 * 3.141592);
	vec3 specularNormalizedNdf = vec3( pow(dotNormalHalf, materialShininess) * specularNormalization );
	
	// Diffuse
	//vec3 diffuseFresnel = vec3(1.0) - fresnel(gMaterialFresnel0, dotNormalLight);
	//vec3 diffuseFresnel = specularFresnel;
	
	//vec3 diffuseFresnel = vec3(1.0) - fresnel( vec3(0.45), dotNormalLight);
	
	const float kInvPi = 0.5/3.141592;
	//materialAlbedoColor *= kInvPi;

	return ( materialAlbedo * kInvPi + materialAlbedo * specularFresnel * specularNormalizedNdf ) * lightColor * vec3(dotNormalLight);
	
	//return ( materialAlbedo + 0.7 * specularFresnel * specularNormalizedNdf ) * lightColor * vec3(dotNormalLight);
	//return ( materialAlbedo + materialAlbedo * specularFresnel * specularNormalizedNdf ) * lightColor * vec3(dotNormalLight);
	
	//return specularNormalizedNdf * lightColor * vec3(dotNormalLight);
	//return lightColor * vec3(dotNormalLight);
}


#ifdef FS_SIMPLE
void main()
{
	vec3 worldPosition = oWorldPosition;
	vec3 worldNormalVec = normalize(oWorldNormalVec);
	vec3 worldEyeVec = normalize(gWorldEyePosition - worldPosition);

	vec3 worldLight0Vec = gLight0WorldPosition - worldPosition;
	vec3 worldLight1Vec = gLight1WorldPosition - worldPosition;
	float light0Dist = length(worldLight0Vec);
	float light1Dist = length(worldLight1Vec);
	worldLight0Vec *= 1.0 / light0Dist; 
	worldLight1Vec *= 1.0 / light1Dist;
	
	//const float innerRange = 200.0;
	const float outerRange = 2000.0;
	//float light0Attn = 1.0 - clamp((light0Dist - innerRange) / outerRange, 0.0, 1.0); 
	//float light1Attn = 1.0 - clamp((light1Dist - innerRange) / outerRange, 0.0, 1.0);
	float light0Attn = 1.0 - clamp(light0Dist / outerRange, 0.0, 1.0);
	float light1Attn = 1.0 - clamp(light1Dist / outerRange, 0.0, 1.0);
	light0Attn *= light0Attn;
	light1Attn *= light1Attn;
	
	// Material	
	vec3 materialAlbedoColor = degamma( texture2D(gSamplerAlbedo, oUv0).xyz );
	
	// Lights
	vec3 result0 = blinnPhong(worldNormalVec, worldEyeVec, worldLight0Vec, materialAlbedoColor, gMaterialRoughness, gLight0Color * light0Attn);
	vec3 result1 = blinnPhong(worldNormalVec, worldEyeVec, worldLight1Vec, materialAlbedoColor, gMaterialRoughness, gLight1Color * light1Attn);
	gl_FragColor = vec4( gamma(result0 + result1), 1.0 );
	
	//gl_FragColor.xyz = gamma(result0);
	//gl_FragColor.xyz = gamma( vec3( max(0.0, dot(worldNormalVec, worldLight0Vec)) ) );
	//gl_FragColor.xyz = result0;
	//gl_FragColor.w = 1.0;
	/*
	
	vec3 halfLight0EyeVec = normalize(worldEyeVec + worldLight0Vec);
	vec3 halfLight1EyeVec = normalize(worldEyeVec + worldLight0Vec);
	   
	//float light0SurfAttnCoeff = max(dot(worldNormalVec, worldLight0Vec), 0.0);
	//float light1SurfAttnCoeff = max(dot(worldNormalVec, worldLight0Vec), 0.0);
	
	//float gMaterialFresnel0 = (1 - n2)/(1 + n2);
	//gMaterialFresnel0 *= gMaterialFresnel0;

	float light0Fresnel = fresnel(gMaterialFresnel0, max(dot(worldEyeVec, halfLight0EyeVec), 0.0));
	float light1Fresnel = fresnel(gMaterialFresnel0, max(dot(worldEyeVec, halfLight1EyeVec), 0.0));

	float diffuseNormalization = 1.0 / kPi;
	float specularNormalization = (gMaterialSpecularPower+2) * 0.5;

	//float light0Diffuse = gMaterialDiffuseIntensity * diffuseNormalization;
	//float light1Diffuse = gMaterialDiffuseIntensity * diffuseNormalization;
	
	float light0Specular = max(dot(worldNormalVec, halfLight0EyeVec), 0.0);
	light0Specular = pow(light0Specular, gMaterialSpecularPower) * specularNormalization;
	
	float light1Specular = max(dot(worldNormalVec, halfLight1EyeVec), 0.0);
	light1Specular = pow(light1Specular, gMaterialSpecularPower) * specularNormalization;
	
	vec3 materialAlbedoColor = texture2D(gSamplerAlbedo, oUv0).xyz;
	
	//vec3 result0 = light0Fresnel * (vec3(light0Diffuse) * gLight0Color + vec3(light0Specular));
	vec3 result0 = vec3( (1.0 - light0Fresnel) ) * materialColor + vec3( light0Fresnel * light0Specular );
	vec3 result1 = vec3( (1.0 - light1Fresnel) ) * materialColor + vec3( light1Fresnel * light1Specular );
	result0 *= gLight0Color;
	result1 *= gLight1Color;
	
	gl_FragColor = result0 + result1;
	
//	vec4 surfaceColor = vec4(1.0, 1.0, 1.0, 1.0);
	
//	float temp = surfaceColor.r; surfaceColor.r = surfaceColor.b; surfaceColor.b = temp;

//		lightAttnCoeff *= (0.7 + 0.7 * pow(specularIntensity, 12.0));
//	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor + lightColor * lightAttnCoeff * specularIntensity;
//	gl_FragColor = lightAttnCoeff * lightColor * surfaceColor;
//	lightAttnCoeff = max(lightAttnCoeff + lightAttnCoeff*pow(specularIntensity, 8.0), 0.05);
//
	//gl_FragColor = surfaceColor * vec4(gLight0Color * vec3(lightAttnCoeff) + vec3(0.05), 1);
//	gl_FragColor = vec4(0.05 + lightAttnCoeff, 0.05+lightAttnCoeff, 0.05+lightAttnCoeff, 1);
//	gl_FragColor = vec4(worldNormalVec.x, worldNormalVec.y, worldNormalVec.z, 1);
//	worldNormalVec = worldNormalVec * 0.5 + vec3(0.5);

//	gl_FragColor = vec4(worldNormalVec.x, worldNormalVec.y, worldNormalVec.z, 1);
//	gl_FragColor = vec4(worldEyeVec.x, worldEyeVec.y, worldEyeVec.z, 1);
	*/
}
#endif