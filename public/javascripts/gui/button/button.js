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
		'image format': "png",
		
		'ready frame fade in duration': 500,
		'ready frame fade out duration': 500,
		'pushed frame fade in duration': 370,
		'pushed frame fade out duration': 400,

		'pushed frame fade in easing': 'easeInOutCubic',
		'pushed frame fade out easing': 'swing'
	},

	// is the button being locked while executing an action, or is is pushable
	is_locked: false,
	// the caller permits to unlock the button, when the push animation is finished
	may_unlock: false,
	// the push animation is finished, and now the button can be unlocked, if the caller gives it permission to do this
	can_unlock: false,
		
	initialize: function(id, options)
	{
		this.setOptions(options)
		
		var self = this
		
		this.$element = $("#" + id),
		
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
			if (self.is_locked)
				return
				
			self.lock()

			self.on_push(function()
			{
				if (self.may_unlock)
				{
					self.may_unlock = false
					self.unlock()
					return
				}
					
				self.can_unlock = true
			})
			
			self.execute_action()
		})
	},
	
	lock: function()
	{
		this.is_locked = true
		
//		this.fade_in('locked') 
	},
	
	unlock: function()
	{
		this.is_locked = false
		
//		this.fade_out('locked')
	},
	
	let_unlock: function()
	{
		if (this.can_unlock)
		{
			this.can_unlock = false
			this.unlock()
			return
		}
			
		this.may_unlock = true
	},
	
	execute_action: function()
	{
		if (!this.options.action)
			return
		
		var self = this
		
		// execute action after delay
		setTimeout(function() { self.options.action(self) }, self.get_action_delay())
	},
	
	get_action_delay: function()
	{
		var delay = this.options.delay
		
		// if delay is in units (1 unit = 1 button push/unpush duration)
		if (delay && delay.ends_with("x"))
			// convert units to milliseconds
			delay = (this.options['pushed frame fade in duration'] + this.options['pushed frame fade out duration']) * parseInt(delay)
			
		return delay
	},
	
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
	
	on_push: function(unlock_when_finished) 
	{
//		this.frames.pushed.stop(true, false) // clearQueue, jumpToEnd
		this.fade_in('pushed')
		this.fade_out('pushed', unlock_when_finished)
	},
	
	// fading wrapper

	fade_in: function(frame_name, callback)
	{
		this.fader.fade_in(this.frames[frame_name],
		{
			duration: this.options[frame_name + ' frame fade in duration'],
			easing: this.options[frame_name + ' frame fade in easing'],
			callback: callback
		})
	},
	
	fade_out: function(frame_name, callback)
	{
		this.fader.fade_out(this.frames[frame_name], 
		{
			duration: this.options[frame_name + ' frame fade out duration'],
			easing: this.options[frame_name + ' frame fade out easing'],
			callback: callback
		})
	},
	
	// fading
	
	fader: new (function(button)
	{
		var fade_for = button.fade_for
		
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
			$element.fadeTo(_.duration, transparent, _.easing, this.get_callback(_))
//			$element.fadeOut(_.duration, _.easing, _.callback)
		}
		
		this.get_callback = function(_)
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
})