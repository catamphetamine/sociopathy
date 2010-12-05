/**
 * Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * It's an abstract class, and can be used further to create, for example, animated image buttons and text buttons.
 * 
 * Usage:
 * 
 * see Text Button, Image Button, Image Chooser, etc
 * 
 * Requires jQuery and MooTools. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var button = new Class
({
	Implements: Options,
	
	namespace: "button",
	
	frames: 
	{
		idle: null,
		ready: null,
		pushed: null
	},

	options:
	{
		'auto unlock': true,
		'image format': "png",
		
		'ready frame fade in duration': 500,
		'ready frame fade out duration': 500,
		'pushed frame fade in duration': 200,
		'pushed frame fade out duration': 200,
	},

	// is the button being locked while executing an action, or is is pushable
	is_locked: false,
	// the caller permits to unlock the button, when the push animation is finished
	may_unlock: false,
	// the push animation is finished, and now the button can be unlocked, if the caller gives it permission to do this
	can_unlock: false,
		
	initialize: function(id_or_element, options)
	{
		// apply options
		this.setOptions(options)

		// back reference		
		var self = this
		
		// get the element
		this.$element = get_element(id_or_element)
		
		// custom preparations
		this.prepare()
		
		// build frames
		
		this.frames.idle = this.build_idle_frame()
		this.frames.ready = this.build_ready_frame()
		this.frames.pushed = this.build_pushed_frame()
		
		// bind events
		
		this.$element.bind('mouseenter.' + this.namespace, function() 
		{
			self.on_roll_over()
		})
		
		this.$element.bind('mouseleave.' + this.namespace, function() 
		{
			self.on_roll_out()
		})
		
		this.$element.bind('click.' + this.namespace, function() 
		{
			if (!self.handle_lock())
				return
				
			self.execute_action()
			
			if (self.options['auto unlock'])
				self.let_unlock()
		})
	},
	
	prepare: function() {},
	
	// locking
	handle_lock: function()
	{
		// if locking is disabled - skip it
//			if (!this.options.lockable)
//				return true

		// if is locked - exit
		if (this.is_locked)
			return false
		
		// lock
		this.lock()

		// after the button is pushed - executes the unlock handling callback
		this.on_push()
		
		// proceed further
		return true
	},

	// you can call this method back after the push animation to handle button unlocking
	handle_unlock_after_pushed: function()
	{
		// if 'auto unlock' is on - unlock the button without manual permission
		/*
		if (this.options['auto unlock'])
		{
			this.unlock()
			return
		}*/
		
		// now the button can be unlocked (has finished the push animation), if the caller permits
		this.can_unlock = true

		// if the caller permits - unlock
		if (this.may_unlock)
			this.unlock()
	},
	
	lock: function()
	{
		this.is_locked = true
		
//		this.fade_in('locked') 
	}.protect(),
	
	unlock: function()
	{
		// reset the flags
		this.can_unlock = false
		this.may_unlock = false
		
		this.is_locked = false
		
//		this.fade_out('locked')
	}.protect(),
	
	let_unlock: function()
	{
		// now the caller permits to unlock the button
		this.may_unlock = true

		// if the button can now be unlocked (has finished the push animation) - unlock it
		if (this.can_unlock)
			this.unlock()
	},
	
	execute_action: function()
	{
		// if no action - exit
		if (!this.options.action)
			return
		
		// back reference
		var self = this

		// execute action after delay
		setTimeout(function() { self.options.action(self) }, self.get_action_delay())
	},
	
	get_action_delay: function()
	{
		var delay = this.options.delay
	
		// if no delay - exit
		if (!delay)
			return
		
		// if delay is in units (1 unit = 1 button push/unpush duration)
		if (delay.ends_with("x"))
		{
			var push_duration = this.options['pushed frame fade in duration'] + this.options['pushed frame fade out duration']
			
			// convert units to milliseconds
			return push_duration * parseInt(delay)
		}
			
		// result
		return delay
	}.protect(),
	
	// handlers
	
	on_roll_over: function() 
	{
		this.frames.ready.stop(true, false) // clearQueue, jumpToEnd
		this.fade_in('ready') 
	},
	
	on_roll_out: function() 
	{
		this.frames.ready.stop(true, false) // clearQueue, jumpToEnd
		this.fade_out('ready') 
	},
	
	on_push: function() 
	{
//		this.frames.pushed.stop(true, false) // clearQueue, jumpToEnd
		this.fade_in('pushed')
		this.fade_out('pushed', $.bind(this, this.handle_unlock_after_pushed))
	}.protect(),
	
	// fading wrapper

	fade_in: function(frame_name, callback)
	{
		button.fader.fade_in(this.frames[frame_name],
		{
			duration: this.options[frame_name + ' frame fade in duration'],
			easing: this.options[frame_name + ' frame fade in easing'],
			callback: callback
		})
	}.protect(),
	
	fade_out: function(frame_name, callback)
	{
		button.fader.fade_out(this.frames[frame_name], 
		{
			duration: this.options[frame_name + ' frame fade out duration'],
			easing: this.options[frame_name + ' frame fade out easing'],
			callback: callback
		})
	}.protect(),
})

// fading
button.fader = new (function(button)
{
	var opaque = 1
	var transparent = 0
	
	// slowly show
	this.fade_in = function($element, _)
	{
		// options
		_ = _ || {}
		
		// if delay animation
		if (_.delay)
			element.delay(_.delay)
			
		// animate
		$element.show()
		$element.fadeTo(_.duration, opaque, _.easing, _.callback)
//			$element.fadeIn(_.duration, _.easing, _.callback)
	}
	
	// slowly hide
	this.fade_out = function($element, _)
	{
		// options
		_ = _ || {}

		// if delay animation
		if (_.delay)
			element.delay(_.delay)

		// animate
		$element.fadeTo(_.duration, transparent, _.easing, this.get_callback($element, _))
//			$element.fadeOut(_.duration, _.easing, _.callback)
	}
	
	this.get_callback = function($element, _)
	{
		if (!_.callback)
		{
			if (!_.hide)
				return
			
			return function() { $element.hide() }
		}
		
		if (!_.hide)
			return _.callback
		
		return function()
		{
			$element.hide()
			_.callback()
		}
	}
	
	// generic
	
	function get_number(variable)
	{
		if (is_number(variable))
			return variable
	}
	
	function is_number(variable)
	{
		return typeof variable == "number"
	}
	
	function get_function(variable)
	{
		if (is_function(variable))
			return variable
	}
	
	function is_function(variable)
	{
		return typeof variable == "function"
	}
})(this)


button.classic_button = function(the_button)
{
	the_button.setOptions
	({
		'ready frame fade in duration': 500,
		'ready frame fade out duration': 500,
		'pushed frame fade in duration': 370,
		'pushed frame fade out duration': 400,
	
		'pushed frame fade in easing': 'easeInOutCubic',
		'pushed frame fade out easing': 'swing'
	})
}