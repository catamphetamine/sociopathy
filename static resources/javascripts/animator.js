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

// jQuery animator
var jquery_animator = new Class
({
	stop: function($element)
	{
		if ($element.is(":animated")) 
			$element.stop(true /* clear queue */, false /* don't jump to queue end */)
	},
	
	fade_in: function($element, options)
	{
		// options
		options = options || {}
		
		// if delay animation
		if (options.delay)
			$element.delay(options.delay * 1000)

		var maximum_opacity = 1
		if (options.maximum_opacity)
			maximum_opacity = options.maximum_opacity
			
		if ($element.css('opacity') > maximum_opacity)
			$element.css('opacity', 0)
			
		$element.show()
		this.stop($element)
		$element.fadeTo(options.duration * 1000, maximum_opacity, options.easing, options.callback)
	},
	
	fade_out: function($element, options)
	{
		// options
		options = options || {}
		
		// if delay animation
		if (options.delay)
			$element.delay(options.delay * 1000)
			
		this.stop($element)
		$element.fadeTo(options.duration * 1000, 0, options.easing, this.get_callback($element, options))
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

// MooTools animator
var moo_tools_animator = new Class
({
	stop: function($element)
	{
		if ($element.data('animation_effect'))
		{
			$element.data('animation_effect').cancel()			
			$element.removeData('animation_effect')
		}
	},

	fade_in: function($element, options)
	{
		// options
		options = options || {}
		
		var link = 'cancel'
		if (options.callback)
			link = 'ignore'
	
		var effect = new Fx.Tween($element[0], 
		{
			duration: options.duration * 1000,
			transition: this.get_transition(options.transition, 'in'),
			link: link,
			property: 'opacity'
		})
 
		effect.addEvent('onComplete', function()
		{
			$element.removeData('animation_effect') 

			if (options.callback)
				options.callback()
		})
 		
		$element.show()

		this.stop($element)
		
		var maximum_opacity = 1
		if (options.maximum_opacity)
			maximum_opacity = options.maximum_opacity
		
		$element.data('animation_effect', effect)
		effect.start(maximum_opacity)
	},
	
	fade_out: function($element, options)
	{
		// options
		options = options || {}
		
		var link = 'cancel'
		if (options.callback)
			link = 'ignore'
	
		var effect = new Fx.Tween($element[0], 
		{
			duration: options.duration * 1000,
			transition: this.get_transition(options.transition, 'in'),
			link: link,
			property: 'opacity'
		})

		effect.addEvent('onComplete', function()
		{
			$element.removeData('animation_effect')
		
			if (options.hide)			
				$element.hide()
			
			if (options.callback)
				options.callback()
		})
		
		this.stop($element)
		
		$element.data('animation_effect', effect)		
		effect.start(0)
	},
	
	get_transition: function(transition, direction)
	{
		var fx
		
		switch (transition)
		{
			case 'linear':
				fx = Fx.Transitions.linear
			
			default:
				//alert('unknown transition: ' + transition)
		}
		
		if (!fx)
			return
			
		switch (direction)
		{
			case 'in':
				return fx.easeIn
			
			case 'out':
				return fx.easeOut
			
			default:
				alert('unknown direction: ' + direction)
				return
		}
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
	
	roll_left: function($element, amount, options)
	{
		// options
		options = options || {}
		
		$element.animate({ marginLeft: amount }, options.callback)
	}
})

// the animator being used
var animator = new moo_tools_animator()
animator.jquery = new jquery_animator()
