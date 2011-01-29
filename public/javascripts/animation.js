/**
 * Javascript animation engine
 * 
 * Animator: fade_in(element, options), fade_out(element, options), stop(element), roll_left(element, options)
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

fx_animator.data_key = 'animation'

fx_animator.of = function($element)
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
	},
	
	roll_left: function($element, amount)
	{
		$element.animate({ marginLeft: amount })
	}
})

// this is what it's for
var my_animator = new Class
({
	options:
	{
		target_frames_per_second: 30,
	},
	
	animate: function(property, options)
	{
		if (!options.from)
			options.from = property.get()
		
		var animation_cycle_delay = 1000 / this.options.target_frames_per_second
		
		var scheduled_time = options.duration
		var started_at = $time()
		
		// TO DO: prevent step from creation each time
		var step = function step()
		{
			var elapsed_time = $time() - started_at
			var current_time_value = ((scheduled_time - elapsed_time) / scheduled_time) * (options.to - options.from)
			property.set(current_time_value)
			
			step.delay(animation_cycle_delay)
		}
		
		step.delay(animation_cycle_delay)
	},

	stop: function($element)
	{
		$element.stop(true /* clear queue */, false /* don't jump to queue end */)
	},
	
	fade_in: function($element, options)
	{
		// options
		options = options || {}
		
		options.from = 0
		options.to = 1
		
		// if delay animation
		if (options.delay)
			element.delay(options.delay)

		$element.show()
		this.properties($element).opacity.set(0)
		
		this.animate(this.properties($element).opacity, options)
		
		//$element.fadeTo(options.duration, 1, options.easing, options.callback)
	},
	
	fade_out: function($element, options)
	{
		// options
		options = options || {}

		options.from = 1
		options.to = 0
		
		// if delay animation
		if (options.delay)
			element.delay(options.delay)

		options.callback =  this.get_callback($element, options)
		this.animate(this.properties($element).opacity, options)
		
//		$element.fadeTo(options.duration, 0, options.easing, this.get_callback($element, options))
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
	},
	
	roll_left: function($element, amount)
	{
		var options = { amount: amount }
		
		this.animate(this.properties($element).left_margin, options)
	},
	
	properties: function($element)
	{
		var properties =
		{
			opacity: function()
			{
				this.get = function()
				{
					$element.css('opacity')
				}
				
				this.set = function(value)
				{
					$element.css('opacity', value)
				}
			},
			
			left_margin: function()
			{
				this.get = function()
				{
					$element.css('margin-left')
				}
				
				this.set = function(value)
				{
					$element.css('margin-left', value)
				}
			}
		}
		
		return properties
	}
})

// the animator being used
var animator = new jquery_animator()