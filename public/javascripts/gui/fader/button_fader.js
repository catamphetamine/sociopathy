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
 * Distributed under GNU General Public License
 * http://www.gnu.org/licenses/gpl.html
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var button_fader = new (function()
{
	this.fading_time = 200
		
	// any button fading activation
	this.activate_fading = function(_, additional_options)
	{
		activate_mouse_over(_, additional_options)
		activate_mouse_out(_, additional_options)
		activate_push(_, additional_options)
	}
	
	function activate_mouse_over(_, additional_options)
	{
		// prepare roll over animation
		var on_mouse_over = get_on_mouse_over(additional_options)
		
		// roll over animation
		activate_fading
		({
			"element": _["button"],
			"faded element": _["ready frame"],
			trigger: "mouseover",
			"triggered functions":
			[
				function() { on_mouse_over(_) }
			]
		})
	}
	
	function activate_mouse_out(_, additional_options)
	{
		// prepare roll out animation
		var on_mouse_out = get_on_mouse_out(additional_options)
		
		// roll out animation
		activate_fading
		({
			"element": _["button"],
			"faded element": _["ready frame"],
			trigger: "mouseout",
			"triggered functions":
			[
			
				function() { on_mouse_out(_) }
			]
		})
	}
	
	function activate_push(_, additional_options)
	{
		// prepare push animation
		var on_push = get_on_push(additional_options)
		
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
					// on_mouse_out(_)
							
					// if no options - exit
					if (!additional_options)
						return;
						
					// if this button has an action - do it
					execute_action(_["button"], additional_options);
				}
			]
		});
	}
	
	// get on mouse over function
	function get_on_mouse_over(additional_options)
	{
		if (additional_options)
			if (additional_options['on mouse over'])
				return additional_options['on mouse over']
				
		return on_mouse_over_generic
	}
	
	// get on mouse out function
	function get_on_mouse_out(additional_options)
	{
		if (additional_options)
			if (additional_options['on mouse out'])
				return additional_options['on mouse out']
				
		return on_mouse_out_generic
	}
	
	// get on push function
	function get_on_push(additional_options)
	{
		if (additional_options)
			if (additional_options['on push'])
				return additional_options['on push']
				
		return on_push_generic
	}
	
	// for generic button - show the activation frame
	function on_mouse_over_generic(_)
	{
		button_fader.fade_in(_['ready frame'])
	}
	
	// for generic button - hide the activation frame
	function on_mouse_out_generic(_)
	{
		button_fader.fade_out(_['ready frame'])
	}
	
	// for a generic button - animate smooth pushing
	function on_push_generic(_)
	{	
		button_fader.fade_in(_['pushed frame'])
		button_fader.fade_out(_['pushed frame'])
	}
	
	function get_button_type(additional_options)
	{
		if (additional_options)
			if (additional_options["type"])
				return additional_options["type"]
			
		return "generic"
	}
	
	function execute_action(button, additional_options)
	{
		if (!additional_options["action"])
			return
		
		var action = additional_options["action"]
		var delay = additional_options["delay"]
		
		// if no delay - execute action and exit
		if (!delay)
		{
			action(button)
			return
		}
			
		// if delay is in units (1 unit = 1 fading_time)
		if (delay.ends_with("x"))
		{
			// convert units to milliseconds
			delay = button_fader.fading_time * parseInt(delay)
		}
		
		// execute action after delay
		setTimeout(function() { action(button) }, delay)
	}
	
	// core fading activation
	function activate_fading(_)
	{
		var element = _["element"]
		var faded_element = _["faded element"]
		
		// triggered functions (supplied upon button creation)
		var triggered_functions = []
		
		// prepare triggered functions to be executed 'on fade'
		for (var index in _["triggered functions"])
		{
			var triggered_function = _["triggered functions"][index];
			
			(function(triggered_function) 
			{
				triggered_functions.push(
					function()
					{
						if ($.bind(faded_element, button_fader.is_being_animated)())
							$.bind(faded_element, button_fader.stop_animation)()
						
						//$.bind(faded_element, triggered_function)()
						triggered_function()
					}
				)
			})(triggered_function)
		}
		
		// set triggered functions to be executed 'on fade'
		element[_["trigger"]].apply(element, triggered_functions)
	}
	
	// animation helpers
	
	// will be bound to a jquery element
	this.is_being_animated = function() 
	{
		return this.is(":animated")
	}
	
	// will be bound to a jquery element
	this.stop_animation = function()
	{
		this.stop(true, true) // clearQueue, jumpToEnd
	}
	
	var opaque = 1
	var transparent = 0
	
	this.fade_in = function(element, _)
	{
//		if (!element)
//			return
			
		// check options
		if (!_)
			_ = {}
			
		// if has timing - delay animation
		if (_.timing)
			element.delay(_.timing)
			
		// animate
		element.fadeIn(this.fading_time, _.callback)
		//element.animate({opacity: opaque}, this.fading_time)
	}
	
	this.fade_out = function(element, _)
	{
//		if (!element)
//			return

		// check options
		if (!_)
			_ = {}
						
		// if has timing - delay animation
		if (_.timing)
			element.delay(_.timing)

		// animate
		element.fadeOut(this.fading_time, _.callback)
		//element.animate({opacity: transparent}, this.fading_time)
	}
	
	// kill focus
	this.kill_focus = function(element)
	{
		element.data("events").mouseout[0].handler()
	}
})()