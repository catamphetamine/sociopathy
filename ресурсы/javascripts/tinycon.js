/*!
 * Tinycon - A small library for manipulating the Favicon
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2012 Tom Moor
 * MIT Licensed
 * @version 0.2.6
*/

(function(){
	
	var Tinycon = {};
	var currentFavicon = null;
	var originalFavicon = null;
	var originalTitle = document.title;
	var faviconImage = null;
	var canvas = null;
	
	//var sizes = {};
	
	var Max_width = 16;
	var Max_height = 16;
	
	var options = {};
	var defaults = {
		width: 7,
		height: 9,
		font: '10px arial',
		colour: '#ffffff',
		background: '#F03D25',
		fallback: true
	};
	
	var ua = (function () {
		var agent = navigator.userAgent.toLowerCase();
		// New function has access to 'agent' via closure
		return function (browser) {
			return agent.indexOf(browser) !== -1;
		};
	}());

	var browser = {
		ie: ua('msie'),
		chrome: ua('chrome'),
		webkit: ua('chrome') || ua('safari'),
		safari: ua('safari') && !ua('chrome'),
		mozilla: ua('mozilla') && !ua('chrome') && !ua('safari')
	};
	
	// private methods
	var getFaviconTag = function(){
		
		var links = document.getElementsByTagName('link');
		
		for(var i=0, len=links.length; i < len; i++) {
			if ((links[i].getAttribute('rel') || '').match(/\bicon\b/)) {
				return links[i];
			}
		}
		
		return false;
	};
	
	var removeFaviconTag = function(){
	
		var links = document.getElementsByTagName('link');
		var head = document.getElementsByTagName('head')[0];
		
		for(var i=0, len=links.length; i < len; i++) {
			var exists = (typeof(links[i]) !== 'undefined');
			if (exists && links[i].getAttribute('rel') === 'icon') {
				head.removeChild(links[i]);
			}
		}
	};
	
	var getCurrentFavicon = function(){
		
		if (!originalFavicon || !currentFavicon) {
			var tag = getFaviconTag();
			originalFavicon = currentFavicon = tag ? tag.getAttribute('href') : '/favicon.ico';
		}

		return currentFavicon;
	};
	
	var getCanvas = function (){
		
		if (!canvas) {
			canvas = document.createElement("canvas");
			canvas.width = Max_width;
			canvas.height = Max_height;
		}
		
		return canvas;
	};
	
	var setFaviconTag = function(url){
		removeFaviconTag();
		
		var link = document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'icon';
		link.href = url;
		document.getElementsByTagName('head')[0].appendChild(link);
	};
	
	var log = function(message){
		if (window.console) window.console.log(message);
	};
	
	var drawFavicon = function(string, colour) {

		// fallback to updating the browser title if unsupported
		if (!getCanvas().getContext || browser.ie || browser.safari || options.fallback === 'force') {
			return updateTitle(string);
		}
		
		var context = getCanvas().getContext("2d");
		
		var draw_options
			
		// if 'colour' is 'options', then just rename
		if (typeof colour === 'object')
		{
			draw_options = colour
		}
		// else, if 'colour' is 'colour' - set the colour
		else
		{
			draw_options = { colour: colour }
		}
		
		//draw_options.colour = draw_options.colour || '#000000'
		
		var string = string;
		var src = getCurrentFavicon();
		
		faviconImage = new Image();
		faviconImage.onload = function() {
			
			// clear canvas  
			context.clearRect(0, 0, 16, 16);

			// draw original favicon
			context.drawImage(faviconImage, 0, 0, faviconImage.width, faviconImage.height, 0, 0, 16, 16);
			
			// draw bubble over the top
			if (string) drawBubble(context, string, draw_options);
			
			// refresh tag in page
			refreshFavicon();
		};
		
		// allow cross origin resource requests if the image is not a data:uri
		// as detailed here: https://github.com/mrdoob/three.js/issues/1305
		if (!src.match(/^data/)) {
			faviconImage.crossOrigin = 'anonymous';
		}
		
		faviconImage.src = src;
	};
	
	var updateTitle = function(num) {
		
		if (options.fallback) {
			if (num > 0) {
				document.title = '('+num+') ' + originalTitle;
			} else {
				document.title = originalTitle;
			}
		}
	};
	
	var drawBubble = function(context, string, draw_options) {
		
		// bubble needs to be larger for double digits
		var len = string.length - 1;
		var width = options.width + (6*len);
		var height = options.height;
		
		if (draw_options.size)
		{
			width = draw_options.size.width
			height = draw_options.size.height
		}
		
		var bg_start_x = Max_width - width;
		var bg_start_y = Max_height - height;

		// webkit seems to render fonts lighter than firefox
		context.font = (browser.webkit ? 'bold ' : '') + options.font;
		context.fillStyle = options.background;
		context.strokeStyle = options.background;
		context.lineWidth = 1;
		
		if (options.background !== 'transparent')
		{
			// bubble
			context.fillRect(bg_start_x, bg_start_y, width - 1, height)
			
			// rounded left
			context.beginPath();
			context.moveTo(bg_start_x - 0.5, bg_start_y + 1);
			context.lineTo(bg_start_x - 0.5, Max_height - 0.5);
			context.stroke();
			
			// rounded right
			context.beginPath();
			context.moveTo(Max_width - 0.5, bg_start_y + 1);
			context.lineTo(Max_width - 0.5, Max_height - 1);
			context.stroke();
			
			// bottom shadow
			context.beginPath();
			context.strokeStyle = "rgba(0,0,0,0.3)";
			context.moveTo(bg_start_x, Max_height);
			context.lineTo(Max_width - 1, Max_height);
			context.stroke();
		}
		
		// number
		context.fillStyle = draw_options.color || options.colour;
		
		var x = 15
		var y = 6
			
		if (draw_options.position && draw_options.position.center)
		{
			context.textAlign = "center";
			context.textBaseline = "middle";
							
			if (typeof draw_options.position.x !== 'undefined')
				x = draw_options.position.x
			else if (browser.mozilla && draw_options.position.gecko && typeof draw_options.position.gecko.x !== 'undefined')
				x = draw_options.position.gecko.x
			else if (browser.webkit && draw_options.position.webkit && typeof draw_options.position.webkit.x !== 'undefined')
				x = draw_options.position.webkit.x
			else
				x = Max_width / 2.0
			
			if (typeof draw_options.position.y !== 'undefined')
				y = draw_options.position.y
			else if (browser.mozilla && draw_options.position.gecko && typeof draw_options.position.gecko.y !== 'undefined')
				y = draw_options.position.gecko.y
			else if (browser.webkit && draw_options.position.webkit && typeof draw_options.position.webkit.y !== 'undefined')
				y = draw_options.position.webkit.y
			else
				y = Max_height / 2.0
		}
		else
		{
			context.textAlign = "right";
			context.textBaseline = "top";
			
			if (draw_options.position && typeof draw_options.position.y !== 'undefined')
			{
				y = draw_options.position.y
			}
		}
		
		// webkit/mozilla are a pixel different in text positioning
		y = browser.mozilla ? y + 1 : y
		
		context.fillText(string, x, y)
	};
	
	var refreshFavicon = function(){
		// check support
		if (!getCanvas().getContext) return;
		
		setFaviconTag(getCanvas().toDataURL());
	};
	
	// public methods
	Tinycon.setOptions = function(custom){
		options = {};
		
		for(var key in defaults){
			options[key] = custom.hasOwnProperty(key) ? custom[key] : defaults[key];
		}
		return this;
	};
	
	Tinycon.setImage = function(url){
		currentFavicon = url;
		refreshFavicon();
		return this;
	};
	
	Tinycon.validate_number = function(value)
	{
		if (typeof value === 'undefined')
			return false
	
		if (isNaN(parseFloat(value)) || !isFinite(value))
			return false
			
		return true
	};
	
	Tinycon.setSize = function(string, size)
	{
		/*
		if (!Tinycon.validate_number(size.width) || size.width > Max_width)
			throw 'Invalid width'
			
		if (!Tinycon.validate_number(size.height) || size.height > Max_width)
			throw 'Invalid height'
		*/
			
		sizes[string] = size
	};
	
	/*
	http://snipplr.com/view.php?codeview&id=19601
	
	Use case : interpolateColor("00EEDD","3ADECE",2,1) :
	interpolate the color level 1 between #00EEDD et #3ADECE on a 3 level scales (from 0 to 2).
	*/
	Tinycon.interpolate_colour = function(minColor,maxColor,maxDepth,depth)
	{
		function d2h(d) { return d.toString(16) }
		function h2d(h) { return parseInt(h,16) }
	   
		if(depth == 0)
			return minColor
		
		if(depth == maxDepth)
			return maxColor
		
		var color = "#"
	   
		for(var i=1; i <= 6; i+=2)
		{
			var minVal = new Number(h2d(minColor.substr(i,2)))
			var maxVal = new Number(h2d(maxColor.substr(i,2)))
			
			var nVal = minVal + (maxVal-minVal) * (depth/maxDepth)
			var val = d2h(Math.floor(nVal))
			
			while (val.length < 2)
			{
				val = "0" + val
			}
			
			color += val
		}
		
		return color
	}
	
	var animating = false
	var stop_animation = false
	var on_animation_stopped
	
	Tinycon.stop_animation_and_do = function(action)
	{
		if (!animating)
		{
			action()
			return false
		}
			
		stop_animation = true
		on_animation_stopped = action
		return true
	}
	
	Tinycon.setBubble = function(string, colour)
	{
		// validate
		if (isNaN(parseFloat(num)) || !isFinite(num))
			return log('Bubble must be a number');
		
		Tinycon.stop_animation_and_do(function()
		{
			drawFavicon(string, options)
		})
		
		return this
	};
	
	Tinycon.text = function(string, options)
	{
		options = options || {}
	
		var action = function()
		{
			if (options.animate)
			{
				animating = true
				
				var interval = options.animate.duration / (options.animate.frames - 1)
				
				var reverse = false
				var frame = 0
				
				function draw()
				{
					if (stop_animation)
					{
						animating = false
						stop_animation = false
						
						if (on_animation_stopped)
							on_animation_stopped()
					
						on_animation_stopped = null
						
						return
					}
				
					if (frame === options.animate.frames - 1)
						reverse = true
						
					if (frame === 0)
						reverse = false
					
					options.color = Tinycon.interpolate_colour(options.animate.color.from, options.animate.color.to, options.animate.frames - 1, frame)
					drawFavicon(string, options)
					
					if (!reverse)
						frame++
					else
						frame--
						
					setTimeout(draw, interval)
				}
		
				draw()
				return
			}
			
			drawFavicon(string, options)
		}
		
		Tinycon.stop_animation_and_do(function()
		{
			action()
			
			if (options.callback)
				options.callback()
		})
		
		return this
	};
	
	Tinycon.reset = function(){
		Tinycon.setImage(originalFavicon);
	};
	
	Tinycon.setOptions(defaults);
	window.Tinycon = Tinycon;
})();