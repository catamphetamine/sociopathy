/**
 * Dialog Window class
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

var dialog_window = new Class
({
	Implements: [Options],
	
	controls: [],
	control_locks: [],
	
	namespace: "window",
	
	state: {},

	is_open: false,
	
	smooth: true,
	
	options: 
	{
		modal: true,
		'close on escape': false,
		
		width: 'auto',
		height: 'auto',
		
		collapse_duration: 300,
		
		theme: 'fade'
		//theme: 'slide_from_top'
		//theme: 'bubble'
	},
	
	// dialog window padding inside the viewport
	padding: {},
	
	/**
	 * Constructor:
	 * creates new dialog window
	 */
	initialize: function($element, options)
	{
		// apply options
		this.setOptions(options)
		
		// back reference
		var self = this

		// get the title
		var title = $element.attr('title')
		$element.removeAttr('title')
		
		this.container = $('<div class="popup_veil collapsed"></div>')
			.appendTo(document.body)
			.on('keydown.' + this.namespace, function(event) 
			{
				// close on escape key
				if (self.options['close on escape'] && event.keyCode &&
					event.keyCode === Event.Keys.esc) 
				{	
					event.preventDefault()
					if (self.options.on_close)
						self.options.on_close()
					self.close()
				}
			})
			.addClass(this.options.theme)
		
		if (options.veil_style)
			this.container.css(options.veil_style)
		
		var dialog_window = $('<article/>')
			// setting tabIndex makes the div focusable
			.addClass('popup')
			.appendTo(this.container)
		
		
		// set dialog title bar
		$('<h1/>')
			.addClass("top_bar non_selectable")
			.appendTo(dialog_window)	
			.text(title)

		this.content = $element
			.removeClass('collapsed')
			.addClass('content')
			.attr('tabIndex', -1)
			.appendTo(dialog_window)
			
		var shadow = $('<div class="shadow"><div class="shrunk_shadow"></div></div>')
		//var shadow = $('<div class="shadow"><table><tr><td class="left_top corner"></td><td class="top"></td><td class="right_top corner"></td></tr><tr><td class="left"></td><td class="void"></td><td class="right"></td></tr><tr><td class="left_bottom corner"></td><td class="bottom"></td><td class="right_bottom corner"></td></tr></table></div>')
		dialog_window.append(shadow)
		
		this.reset()
		
		this.content.on('keydown', function(event) 
		{
			// if Enter key pressed
			if (event.keyCode == Event.Keys.enter)
			{
				if (self.on_enter)
				{
					self.on_enter()
					return false
				}
			}
			
			// if Tab key pressed
			//if (event.keyCode == Event.Keys.tab) 
			//	return false
		})
	},
	
	on: function(event, handler)
	{
		this.content.on(event, handler)
	},
	
	// opens the dialog window
	open: function(state) 
	{
		if (this.options['on open'])
			this.options['on open'].bind(this.content)()
			
		if (state)
			this.state = state
	
		if (this.is_open)
			return
		
		this.container.removeClass('collapsed').addClass('shown')
		
		if (this.options.theme === 'slide_from_top')
			this.container.children().eq(0).css('top', 0)
		
		this.content.find('input:first').focus()
		
		if (this.content.css('display') !== 'inline-block')
			this.content.css('display', 'inline-block')
		
		this.rise()

		// prevent tabbing out of modal dialog windows
//		if (this.options.modal)
		this.container.on('keypress.' + this.namespace, this.swallow_outer_tabulation)
					
//		z_indexer.register(this)

		this.is_open = true
		this.content.trigger('open')
	},
	
	// prevent tabbing out of modal dialog windows
	swallow_outer_tabulation: function(event) 
	{	
		if (event.keyCode !== Event.Keys.tab)
			return

		var tabbables = $(':tabbable', this)
		var first = tabbables.filter(':first')
		var last  = tabbables.filter(':last')

		if (event.target === last[0] && !event.shiftKey) 
		{
			first.focus(1)
			return false
		} 
		else if (event.target === first[0] && event.shiftKey) 
		{
			last.focus(1)
			return false
		}
	},
	
	// closes the dialog window
	close: function(callback) 
	{
		this.container.removeClass('shown').addClass('collapsed')
		
		var closed = function()
		{
			if (this.options['on close'])
				this.options['on close'].bind(this.content)()
			
			this.container.unbind('keypress.' + this.namespace)
			this.content.unbind('keypress.' + this.namespace)
			
			if (callback)
				callback()
		
			this.state = {}
	
			this.unrise()
	
			this.reset()
	
			this.is_open = false
			this.container.css('z-index', -1)
			this.content.trigger('close')
		}
		
		closed.bind(this).delay(this.options.collapse_duration)
	},

	/**
	 * moves the dialog window to the top
	 */
	// the force parameter allows us to move modal dialogs 
	// to their correct position on open
	rise: function()
	{
		this.container.css('z-index', z_indexer.acquire_top_z())
	},
	
	unrise: function()
	{
		//z_indexer.unregister(this)
	},
	
	/**
	 * resets all the registered controls
	 */
	reset: function()
	{
		if (this.options.theme === 'slide_from_top')
			this.container.children().eq(0).css('top', -(this.container.outerHeight(true) + this.container.offset().top) + 'px')

		// reset controls
		this.controls.each(function(control)
		{
			if (control instanceof jQuery)
				return control.val('')

			control.reset()
		})			
	},
	
	/**
	 * registers controls
	 */
	register_controls: function()
	{
		var dialog = this
		Array.prototype.slice.call(arguments).flatten().forEach(function(control)
		{
			if (control.constructor === Form)
				dialog.form = control
		})
	
		this.controls.combine(Array.prototype.slice.call(arguments).flatten())
	},
	
	// locking
	is_locked: false,
	
	/**
	 * locks the dialog window (and all of its controls)
	 */
	lock: function()
	{
		if (this.is_locked)
			return
			
		this.is_locked = true
		
		// lock controls
		this.control_locks = this.controls.map(function(control) 
		{ 
			if (control.lock)
				return control.lock() 
		})
		.clear()
	},
	
	/**
	 * unlocks the dialog window (and all of its controls)
	 */
	unlock: function()
	{
		if (!this.is_locked)
			return
			
		this.is_locked = false
		
		// unlock controls
		this.control_locks.each(function(lock) { lock.unlock() })
	}
})