/**
 * Dialog Window class
 * 
 * Usage:
 * 
 * In Html:
 * 
 * <div id="the_dialog_window" title="Hello">Greetings</div>
 * 
 * In javascript:
 * 
 * $("#the_dialog_window").dialog_window
 * ({
 * 		'close on escape': true
 * })
 * .open()
 * 
 * The stylesheet ("окошко.css") is included.
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

	is_open: false,
	
	options: 
	{
		modal: true,
		'close on escape': false,
		
		width: 'auto',
		height: 'auto'
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
		
		// set width and height
		this.set_dimensions($element)

		// get the title
		var title = $element.attr('title')
		$element.removeAttr('title')

		// create the dialog element
		this.$element = $('<article/>')
		
		// set up the dialog element
		this.$element.appendTo(document.body)
			.hide()
			// setting tabIndex makes the div focusable
			.attr('tabIndex', -1)
			.css
			({
				// setting outline to 0 prevents a border on focus in Mozilla
				outline: 0,
				
				position: 'fixed',
				
				// setting overflow to hidden fixes the box-shadow scroll bar bug in Fire Fox
				overflow: 'hidden'
			})
			.bind('keydown.' + this.namespace, function(event) 
			{
				// close on escape key
				if (self.options['close on escape'] && event.keyCode &&
					event.keyCode === Event.Keys.esc) 
				{	
					self.close(event)
					event.preventDefault()
				}
			})
			
		// the wrapped dialog window (fixes the box-shadow scroll bar bug in Fire Fox)
		var $dialog_window = $('<section/>')
			.addClass("dialog_window")
			.appendTo(this.$element)

		// set dialog content
		$element
			.addClass("dialog_window_content")
			.appendTo($dialog_window)
			.css({ width: 'auto' })

		// set dialog title bar
		$('<header/>')
			.addClass("dialog_window_top_bar")
			.prependTo($dialog_window)	
			.text(title)
	},

	set_dimensions: function($element)
	{
		// if dialog window width is set manually
		if ($element.attr('set_width'))
			this.options.width = $element.width()
			
		// if dialog window height is set manually
		if ($element.attr('set_height'))
			this.options.height = $element.height()
	},
	
	/**
	 * shows the dialog window
	 */
	show: function()
	{
		this.$element.show()

		this.$element.focus()
	},
	
	/**
	 * hides the dialog window
	 */
	hide: function(callback)
	{
		this.$element.hide()
		
		if (callback)
			callback()
	},
	
	// opens the dialog window
	open: function() 
	{
		if (this.is_open)
			return
		
//		disable_scroll()

		if (this.options.modal)
			this.veil = new veil()
			
		this.size()
		this.position()
		this.show()
		this.rise()

		// prevent tabbing out of modal dialog windows
		if (this.options.modal)
			this.$element.bind('keypress.' + this.namespace, this.swallow_outer_tabulation)
					
		z_indexer.register(this)

		this.is_open = true
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
	close: function(event) 
	{
		this.veil.destroy()
		
		this.$element.unbind('keypress.' + this.namespace)
		
		this.hide()
		
		z_indexer.unregister(this)

		this.reset()

		this.is_open = false
	},

	/**
	 * moves the dialog window to the top
	 */
	// the force parameter allows us to move modal dialogs 
	// to their correct position on open
	rise: function()
	{
		this.veil.set_z_index(z_indexer.acquire_top_z())
		this.$element.css('z-index', z_indexer.acquire_top_z())
	},
			
	/**
	 * sizes the dialog window
	 */
	size: function() 
	{
		// reset content sizing
		this.$element.show().css
		({
			width: 'auto',
			height: 0
		})

		// reset wrapper sizing
		// determine the height of all the non-content elements
		var non_content_elements_height = this.$element.css
		({
			height: 'auto',
			width: this.options.width
		})
		.height()
		
		if (this.options.height === "auto") 
			this.$element.css({ height: "auto" })
		else
			this.$element.height(Math.max(this.options.height - non_content_elements_height, 0))
	},
	
	/**
	 * positions the dialog window at the center of the screen
	 */
	position: function()
	{
		this.padding.left = parseInt((get_viewport_width() - this.$element.width()) / 2)
		this.padding.right = get_viewport_width() - this.$element.width() - this.padding.left
		
		this.padding.top = parseInt((get_viewport_height() - this.$element.height()) / 2)
		this.padding.bottom = get_viewport_height() - this.$element.height() - this.padding.top
		
		this.$element.css
		({
			left: 0,
			top: 0,
			
			'padding-left': this.padding.left,
			'padding-right': this.padding.right,
			'padding-top': this.padding.top,
			'padding-bottom': this.padding.bottom
		})
	},
	
	/**
	 * resets all the registered controls
	 */
	reset: function()
	{
		// reset controls
		this.controls.each(function(control) { control.reset() })			
	},
	
	/**
	 * registers controls
	 */
	register_controls: function()
	{
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