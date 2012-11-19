
/**
 * @constructor 
 */
efw.ResourcePackage = function() {
	this.description = null;
	this.data = null;
}


/**
 * @constructor 
 */
efw.Loader = function(graphicsDevice) {
	this._graphicsDevice = graphicsDevice;
	
	this._asyncLoading = 0;
	
	/**
	 * Queue of requests 
	 */
	this._requests = [];
	
	/**
	 * Maps XMLHttpRequest to the last received progress event
	 */
	this._requestsToEventMap = {};	
}


efw.Loader.prototype.hasFinished = function()
{
	return this._asyncLoading == 0;
}


efw.Loader.prototype.clear = function()
{
	this._asyncLoading = 0;
	this._requests = [];
	this._requestsToEventMap = {};
}


efw.Loader.prototype.getProgress = function()
{
	// If there's no requests we are 100% done
	if (this._requests.length == 0)
	{
		return 100;
	}
	
	var count = 0;
	var totalProgress = 0;
	
	for (var i=0; i<this._requests.length; i++)
	{
		var lastEvent = this._requestsToEventMap[ this._requests[i] ];
		if (lastEvent != null && lastEvent.lengthComputable)
		{
			totalProgress += (lastEvent.loaded/lastEvent.total);			
			count++;
		}
	}

	if (count > 0)
	{
		totalProgress = (Math.floor(totalProgress/count) * 100);
		totalProgress = Math.min( Math.max(totalProgress, 0), 100);
	}
	
	return totalProgress;
}


efw.Loader.prototype.loadFileAsync = function(fullFilePath, fileType, functionPtr)
{
	var self = this;
	
	this._asyncLoading++;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fullFilePath, true);
	xhr.responseType = fileType;
	//xhr.overrideMimeType('text/plain; charset=UTF-8');
	xhr.overrideMimeType("text/plain; charset=x-user-defined");  

	xhr.onload = function(e) {
		//window.console.log(e);
		functionPtr(this.response);
		self._asyncLoading--;
	};
	xhr.onprogress = function(e) {
		//window.console.log(e);
		self._requestsToEventMap[e.currentTarget] = e;
	}
	xhr.onerror = xhr.onabort = function(e) { 
		self._asyncLoading--;
	};

	xhr.send();
	this._requests.push( xhr );
		
	return xhr;
}


efw.Loader.prototype.loadPackageAsync = function(packageFilename, binaryFilename)
{
	var resourcePackage = new efw.ResourcePackage();
	this.loadFileAsync(packageFilename, 'text', function(data) { resourcePackage.description = window.JSON.parse(data); } );
	this.loadFileAsync(binaryFilename, 'arraybuffer', function(data) { resourcePackage.data = data; } );
	
	return resourcePackage;
}


efw.Loader.prototype.hasPendingAsyncCalls = function()
{
	return (this._asyncLoading != 0);
}
