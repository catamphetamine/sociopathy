(function()
{
	// set name of hidden property and visibility change event
	var hidden
	var visibilityChange
	
	if (typeof document.hidden !== "undefined")
	{
		hidden = "hidden"
		visibilityChange = "visibilitychange"
	}
	else if (typeof document.mozHidden !== "undefined")
	{
		hidden = "mozHidden"
		visibilityChange = "mozvisibilitychange"
	}
	else if (typeof document.msHidden !== "undefined")
	{
		hidden = "msHidden"
		visibilityChange = "msvisibilitychange"
	}
	else if (typeof document.webkitHidden !== "undefined")
	{
		hidden = "webkitHidden"
		visibilityChange = "webkitvisibilitychange"
	}
	
	// warn if the browser doesn't support addEventListener or the Page Visibility API
	if (typeof document.addEventListener === "undefined" || typeof hidden === "undefined")
		throw "This demo requires a browser such as Google Chrome that supports the Page Visibility API."
	
	document.addEventListener(visibilityChange, function()
	{
		if (document[hidden])
			$(window).trigger('page_is_hidden')
		else
			$(window).trigger('page_is_visible')
	},
	false)
})()