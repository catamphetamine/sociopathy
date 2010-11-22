// browser checker

var unsupported_browser = false

// detects current web browser
var browser_engine_detector = {}

// Web Kit detector (Chromium, Chrome, Safari)
browser_engine_detector.is_web_kit = function()
{
	return RegExp(" AppleWebKit/").test(navigator.userAgent)
}

// Gecko detector (Fire Fox)
browser_engine_detector.is_gecko = function()
{
	return navigator.product == 'Gecko'
}

// Presto detector (Opera)
browser_engine_detector.is_presto = function()
{
	return (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent))
}

// if this browser is not supported - set the flag on
if (!browser_engine_detector.is_web_kit() && !browser_engine_detector.is_gecko())
{
	unsupported_browser = true
}

// check for proper web browser
function check_browser_support()
{
	if (!unsupported_browser)
		return

	$("#unsupported_browser_message").dialog
	({
		modal: true,
		width: 1400,
		closeOnEscape: true,
		draggable: false,
		resizable: false
		/*
		,
		show: {effect: 'fade' , duration: 1000},
		show: "slide",
		hide: "slide"
		*/
	})
}
