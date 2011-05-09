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
	Implements: [Options, Events],
	
	Binds: ['can_unlock_the_pushing_lock'],
	
	namespace: "button",
	
	frames: 
	{
		idle: null,
		ready: null,
		pushed: null
	},

	is_shown: true,
	
	locks: [],

	options:
	{
		style:
		{
			cursor: 'pointer'
		},
		
		'auto unlock': true,
		'prevent double submission': false,

		'idle frame fade in duration': 500,
		'idle frame fade out duration': 500,
		
		'ready frame fade in duration': 500,
		'ready frame fade out duration': 500,
		
		'pushed frame fade in duration': 200,
		'pushed frame fade out duration': 500,
	},

	// locking button while being pushed
	pushing:
	{
		// is the button being locked while executing an action, or is is pushable
		is_locked: false,
		// the caller permits to unlock the button, when the push animation is finished
		may_unlock: false,
		// the push animation is finished, and now the button can be unlocked, if the caller gives it permission to do this
		can_unlock: false,
		
		lock: function()
		{
			this.locker = this.self.lock()
		},
		
		unlock: function()
		{
			if (!this.locker)
				return
			
			if (this.self.options['prevent double submission'] === true)
				return

			this.locker.unlock()
			this.locker = null
			
			// reset the flags
			this.can_unlock = false
			this.may_unlock = false			
		},
		
		let_unlock: function()
		{
			// now the caller permits to unlock the button
			this.may_unlock = true
	
			// if the button can now be unlocked (has finished the push animation) - unlock it
			if (this.can_unlock)
				this.unlock()
		},
		
		can_now_unlock: function()
		{
			// now the button can be unlocked (has finished the push animation), if the caller permits
			this.can_unlock = true

			// if the caller permits - unlock
			if (this.may_unlock)
				this.unlock()
		},
		
		is_locked: function()
		{
			return (this.locker || false)
		}
	},
		
	initialize: function(id_or_element, options)
	{
		// apply options
		this.setOptions(options)

		// back reference		
		var self = this
		this.pushing.self = this

		// get the element
		this.$element = get_element(id_or_element)
		
		// custom preparations
		this.prepare()
		
		// build frames
		
		this.frames.idle = this.build_idle_frame()
		this.frames.ready = this.build_ready_frame()
		this.frames.pushed = this.build_pushed_frame()
		
		// stylize
		
		Object.each(this.frames, function($frame) { $frame.css(self.options.style) })
		
		// bind events
		
		this.$element.bind('mouseenter.' + this.namespace, function() 
		{
			this.is_rolled_over = true

			// if is locked - exit
			if (this.is_locked())
				return false	
	
			this.on_roll_over()
		}.
		bind(this))
		
		this.$element.bind('mouseleave.' + this.namespace, function() 
		{
			this.is_rolled_over = false
			
			// if is locked - exit
			if (this.is_locked())
				return false
				
			this.on_roll_out()
		}.
		bind(this))

		this.$element.bind('click.' + this.namespace, function() 
		{
			// if is locked - exit
			if (this.is_locked())
				return false
				
			// lock the button
			this.pushing.lock()
			
			// *after the button is pushed - executes the after pushed actions
			this.on_push()
		}.
		bind(this))
	},

	let_unlock: function()
	{
		// if auto unlock - unlock the button immediately
		if (this.options['auto unlock'])
			this.pushing.let_unlock()
	},
	
	prepare: function() {},

	// you can call this method back after the push animation to handle button unlocking
	can_unlock_the_pushing_lock: function()
	{
		// now the button can be unlocked (has finished the push animation), if the caller permits
		this.pushing.can_now_unlock()
	},
	
	lock: function()
	{
		var self = this
	
		var lock = new (function()
		{
			this.unlock = function()
			{
				self.locks.erase(this)
				
				if (self.is_rolled_over)
					self.on_roll_over()
					//self.$element.trigger('mouseenter.' + self.namespace)
			}
		})()
		
		this.locks.push(lock)
		return lock
	},
	
	unlock: function()
	{
		this.pushing.unlock()
		this.locks.each(function(lock) { lock.unlock() })
	}
	.protect(),
	
	is_locked: function()
	{
		return this.locks.length > 0
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
	}
	.protect(),
	
	push: function()
	{
		this.$element.trigger('click.' + this.namespace)
	},
	
	// handlers
	
	on_roll_over: function() 
	{
//		animator.stop(this.frames.ready)
		this.fade_in('ready') 
	},
	
	on_roll_out: function() 
	{
//		animator.stop(this.frames.ready)
		this.fade_out('ready')
	},
	
	on_push: function()
	{
		this.fade_in('pushed', function() 
		{
			this.on_roll_out()
			
			this.execute_action()
			this.let_unlock()

			this.fade_out('pushed', this.can_unlock_the_pushing_lock)
		}.
		bind(this))
	},
	
	// show immediately
	show: function()
	{
		// if already shown - exit
		if (this.is_shown)
			return
			
		this.frames.idle.show()
		this.frames.idle.css({ opacity: 1 })
		this.is_shown = true
	},
	
	// hide immediately
	hide: function()
	{
		// if already hidden - exit
		if (!this.is_shown)
			return
		
		this.frames.idle.hide()
		this.is_shown = false
	},
	
	show_animated: function(callback)
	{
		// if already shown - exit
		if (this.is_shown)
			return
			
		var self = this
			
		var lock = this.lock()
		this.fade_in('idle', function() 
		{ 
			self.is_shown = true
			
			if (callback) 
				callback()

			lock.unlock()	
		})
	},
	
	hide_animated: function(callback)
	{
		// if already hidden - exit
		if (!this.is_shown)
			return
			
		var self = this
			
		var lock = this.lock()
		
		function fade_out_after_pushed()
		{
			if (self.pushing.is_locked())
			{
				setTimeout(fade_out_after_pushed, 10)
				return
			}
				
			self.fade_out('idle', function() 
			{ 
				self.is_shown = false
			
				if (callback) 
					callback()
	
				lock.unlock()				
			})
		}
		
		fade_out_after_pushed()
	},
	
	// fading wrapper

	fade_in: function(frame_name, callback)
	{
		animator.fade_in(this.frames[frame_name],
		{
			duration: this.options[frame_name + ' frame fade in duration'],
			easing: this.options[frame_name + ' frame fade in easing'],
			callback: callback
		})
	},
	
	fade_out: function(frame_name, callback)
	{
		animator.fade_out(this.frames[frame_name], 
		{
			duration: this.options[frame_name + ' frame fade out duration'],
			easing: this.options[frame_name + ' frame fade out easing'],
			callback: callback,
			hide: true
		})
	},
	
	reset: function()
	{
		this.on_roll_out(),
		this.unlock()
	},
	
	does: function(fn, options)
	{
		if (arguments.length == 0)
			return this.options.action
			
		this.options.action = fn
		
		options = options || {}
		this.options.delay = options.delay
		
		return this
	}
})

button.physics = 
{
	classic: function(the_button)
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
		
		return the_button
	}
}