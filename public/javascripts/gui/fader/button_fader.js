/**
 * Button Fader
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * Can be used both with solely image buttons and text buttons.
 * 
 * Usage:
 * 
 * see Text Button Fader, Image Button Fader, Image Chooser, etc
 * 
 * Requires jQuery. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var button_fader = new (function()
{
	this.fading_time = 200
		
	// any button fading activation
	this.activate_fading = function(_, __)
	{
		activate_mouse_enter(_, __)
		activate_mouse_leave(_, __)
		activate_push(_, __)
	}
	
	function activate_mouse_enter(_, __)
	{
		// prepare roll over animation
		var on_mouse_enter = get_on_mouse_enter(__)
		
		// roll over animation
		activate_fading
		({
			"element": _["button"],
			"faded element": _["ready frame"],
			trigger: "mouseenter",
			"triggered functions":
			[
				function() { on_mouse_enter(_) }
			]
		})
	}
	
	function activate_mouse_leave(_, __)
	{
		// prepare roll out animation
		var on_mouse_leave = get_on_mouse_leave(__)
		
		// roll out animation
		activate_fading
		({
			"element": _["button"],
			"faded element": _["ready frame"],
			trigger: "mouseleave",
			"triggered functions":
			[
				function() { on_mouse_leave(_) }
			]
		})
	}
	
	function activate_push(_, __)
	{
		// prepare push animation
		var on_push = get_on_push(__)
		
		// push animation
		activate_fading
		({
			"element": _["button"],
			"faded element": _["pushed frame"],
			trigger: "click",
			"triggered functions":
			[
				function() 
				{						
					// animate push
					on_push(_)
							
					// if no additional options - exit
					if (!__)
						return;
						
					// if this button has an action - do it
					execute_action(_["button"], __);
				}
			]
		});
	}
	
	// get on mouse over function
	function get_on_mouse_enter(_)
	{
		if (_)
			if (_['on mouse over'])
				return _['on mouse over']
				
		return on_mouse_enter_default
	}
	
	// get on mouse out function
	function get_on_mouse_leave(_)
	{
		if (_)
			if (_['on mouse out'])
				return _['on mouse out']
				
		return on_mouse_leave_default
	}
	
	// get on push function
	function get_on_push(_)
	{
		if (_)
			if (_['on push'])
				return _['on push']
				
		return on_push_default
	}
	
	// for generic button - show the activation frame
	function on_mouse_enter_default(_)
	{
		button_fader.fade_in(_['ready frame'])
	}
	
	// for generic button - hide the activation frame
	function on_mouse_leave_default(_)
	{
		button_fader.fade_out(_['ready frame'])
	}
	
	// for a generic button - animate smooth pushing
	function on_push_default(_)
	{	
		button_fader.fade_in(_['pushed frame'])
		button_fader.fade_out(_['pushed frame'])
	}
	
	function get_button_type(_)
	{
		if (_)
			if (_["type"])
				return _["type"]
			
		return "generic"
	}
	
	function execute_action(button, _)
	{
		if (!_["action"])
			return
		
		var action = _["action"]
		var delay = _["delay"]
		
		// if no delay - execute action and exit
		if (!delay)
		{
			action(button)
			return
		}
			
		// if delay is in units (1 unit = 1 fading_time)
		if (delay.ends_with("x"))
			// convert units to milliseconds
			delay = button_fader.fading_time * parseInt(delay)
		
		// execute action after delay
		setTimeout(function() { action(button) }, delay)
	}
	
	// core fading activation
	function activate_fading(_)
	{
//		var element = _["element"]
//		var faded_element = _["faded element"]
		
		// triggered functions (supplied upon button creation)
//		var triggered_functions = _["triggered functions"]
		
		// prepare triggered functions to be executed 'on fade'
		/*
		for (var index in _["triggered functions"])
		{
			var triggered_function = _["triggered functions"][index];
			
			(function(triggered_function) 
			{
				triggered_functions.push(
					function()
					{
						
						//$.bind(faded_element, triggered_function)()
						triggered_function()
					}
				)
			})(triggered_function)
		}
		*/
		
		// set triggered functions to be executed 'on fade'
		_["element"][_["trigger"]].apply(_["element"], _["triggered functions"])
	}
	
	// animation helpers
	
	// will be bound to a jquery element
	/*
	this.is_being_animated = function() 
	{
		return this.is(":animated")
	}
	
	// will be bound to a jquery element
	this.stop_animation = function()
	{
		this.stop() // clearQueue, jumpToEnd
	}
	*/
	
	var opaque = 1
	var transparent = 0
	
	// slowly show
	this.fade_in = function(element, _)
	{
		// check options
		if (!_)
			_ = {}
			
		// if has timing - delay animation
		if (_.timing)
			element.delay(_.timing)
			
		// animate
console.log("show " + element.attr("id"))
console.log(element)
		element.fadeTo(this.fading_time, opaque)
//		element.fadeIn(this.fading_time, _.callback)
//		element.animate({opacity: opaque}, this.fading_time, _.callback)
	}
	
	// slowly hide
	this.fade_out = function(element, _)
	{
		// check options
		if (!_)
			_ = {}
						
		// if has timing - delay animation
		if (_.timing)
			element.delay(_.timing)

		// animate
//		element.fadeTo(this.fading_time, transparent, function() { $(this).hide() })
console.log("hide " + element.attr("id"))
console.log(element)
		element.fadeOut(this.fading_time, _.callback)
//		element.animate({opacity: transparent}, this.fading_time, _.callback)
	}
	
	// kill focus
	this.kill_focus = function(element)
	{
		while (element.is(":animated"))
			element.stop(false, true)
			
		element.data("events").mouseleave[0].handler()
	}
})()