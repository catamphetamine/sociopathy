// browser checker

// the popup
var unsupported_browser_message

// construct the popup window
$(document).ready(function() 
{
	unsupported_browser_message = $("#unsupported_browser_message").dialog_window
	({
		width: 1400,
		'close on escape': true
	})
})

// detects current web browser
var browser_engine_detector = new (function()
{
	// Web Kit detector (Chromium, Chrome, Safari)
	this.is_web_kit = function()
	{
		if (!navigator)
			return false
			
		return RegExp(" AppleWebKit/").test(navigator.userAgent)
	}

	// Gecko detector (Fire Fox)
	this.is_gecko = function()
	{
		if (!navigator)
			return false
			
		return navigator.product == 'Gecko'
	}

	// Presto detector (Opera)
	this.is_presto = function()
	{
		if (!navigator)
			return false
			
		return (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent))
	}
})()

// if this browser is not supported - set the flag on
function is_browser_supported()
{
	return browser_engine_detector.is_web_kit() || browser_engine_detector.is_gecko()
}

// check for proper web browser
function check_browser_support()
{
	if (!is_browser_supported())
		unsupported_browser_message.open()
}
