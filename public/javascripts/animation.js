/**
 * Javascript animation engine
 * 
 * Animator: fade_in(element, options), fade_out(element, options)
 * 
 * Requires MooTools (Core), (and jQuery). 
 * 
 * Copyright (c) 2011 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

// fx library - not working
var fx_animator = new Class
({
	Implements: [Options],
		
	// animation redrawings per second
	options:
	{
		frequency: 50
	},
	
	fx: null,
	
	initialize: function($element)
	{
		this.fx = $fx($element.get(0))
		this.set_back_reference($element)
	},
	
	set_back_reference: function($element)
	{
		var data_key = animation.data_key
		
		if ($element.data(data_key))
			alert('ahtung! $element.data("' + data_key + '") is already defined')
			
		$element.data(data_key, this)
	},
	
	animate: function(options)
	{			
		if (!options.delay)
			options.delay = 0
				
		var sign = 1
		if (options.to < options.from)
			sign = -1
	
		this.stop()
		this.fx.fxAdd
		({
			type: options.what, 
			from: options.from, 
			to: options.to, 
			step: sign * options.duration / this.options.frequency, 
			delay: 1000 / this.options.frequency
		})
		.fxHold(options.delay)
		.fxRun(options.callback)
	},
	
	stop: function()
	{
		this.fx.fxStop()
	},
	
	kill: function()
	{
		$element.removeData(this.options.data_key)
	},
	
	get_options: function()
	{
		return this.options
	}
})

animation.data_key = 'animation'

animation.of = function($element)
{
	var back_reference = $element.data(animation.data_key)
	
	if (back_reference)
		return back_reference
			
	return new animation($element)
}

// jQuery animator
var jquery_animator = new Class
({
	stop: function($element)
	{
		$element.stop(true /* clear queue */, false /* don't jump to queue end */)
	},
	
	fade_in: function($element, options)
	{
		// options
		options = options || {}
		
		// if delay animation
		if (options.delay)
			element.delay(options.delay)

		$element.show()
		$element.fadeTo(options.duration, 1, options.easing, options.callback)
	},
	
	fade_out: function($element, options)
	{
		// options
		options = options || {}
		
		// if delay animation
		if (options.delay)
			element.delay(options.delay)

		$element.fadeTo(options.duration, 0, options.easing, this.get_callback($element, options))
	},
	
	get_callback: function($element, options)
	{
		if (!options.callback)
		{
			if (!options.hide)
				return
			
			return function() { $element.hide() }
		}
		
		if (!options.hide)
			return options.callback
		
		return function()
		{
			$element.hide()
			options.callback()
		}
	}
})

// this is what it's for
var my_animator = new Class
({
})

// the animator being used
var animator = new jquery_animator()