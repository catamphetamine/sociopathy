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

function dialog_window($element, options)
{
	var self = this
	
	this.controls = []
	this.control_locks = []
	
	var namespace = "window"

	var is_open = false
	
	this.options = 
	{
		modal: true,
//		stack: true,
		'close on escape': false,
		width: 'auto',
		height: 'auto'
	}
	
	Object.append(this.options, options)

	// dialog window padding inside the viewport
	this.padding = {}
	
	/**
	 * Constructor:
	 * creates new dialog window
	 */
	this.create = function() 
	{
		// get the title
		var title = $element.attr('title')
		$element.removeAttr('title')

		// create the dialog element
		this.$element = $('<div></div>')
		
		// set up the dialog element
		this.$element.appendTo(document.body)
			.hide()
			// setting tabIndex makes the div focusable
			.attr('tabIndex', -1)
			.css
			({
				// setting outline to 0 prevents a border on focus in Mozilla
				outline: 0,
				
//				position: 'absolute',
				position: 'fixed',
				
				// setting overflow to hidden fixes the box-shadow scroll bar bug in Fire Fox
				overflow: 'hidden'
			})
			.bind('keydown.' + namespace, function(event) 
			{
				// close on escape key
				if (self.options['close on escape'] && event.keyCode &&
					event.keyCode === key_code.escape) 
				{	
					self.close(event)
					event.preventDefault()
				}
			})	
			/*			
			.mousedown(function(event) 
			{
				self.rise(false, event)
			})
			*/
			
		// the wrapped dialog window (fixes the box-shadow scroll bar bug in Fire Fox)
		var $dialog_window = $('<div></div>')
			.addClass("dialog_window")
			.appendTo(this.$element)

		// set dialog content
		$element
			.addClass("dialog_window_content")
			.appendTo($dialog_window)

		// set dialog title bar
		$('<div></div>')
			.addClass("dialog_window_top_bar")
			.text(title)
			.prependTo($dialog_window)
			
		// when scrolling page - reposition the dialog
//			$(document).bind('scroll.' + namespace, dialog_window_manager.reposition)				
	}
	
	/**
	 * shows the dialog window
	 */
	this.show = function()
	{
		this.$element.show()
//		this.$element.fadeIn()

		this.$element.focus()
	}
	
	/**
	 * hides the dialog window
	 */
	this.hide = function(callback)
	{
		this.$element.hide()
		
		if (callback)
			callback()
			
//		this.$element.fadeOut()
	}
	
	// opens the dialog window
	this.open = function() 
	{
		if (is_open)
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
			this.$element.bind('keypress.' + namespace, this.swallow_outer_tabulation)
					
		z_indexer.register(this)

		is_open = true
	}
	
	// prevent tabbing out of modal dialog windows
	this.swallow_outer_tabulation = function(event) 
	{	
		if (event.keyCode !== key_code.tabulation)
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
	}
	
	// closes the dialog window
	this.close = function(event) 
	{
		this.veil.destroy()
		
		this.$element.unbind('keypress.' + namespace)
		
		this.hide()
		
//		enable_scroll()
		
		// adjust the z-index counter
//			if (this.options.modal)
		z_indexer.unregister(this)

		this.reset()

		is_open = false
	}

	/*
	this.destroy = function() 
	{
		dialog.close()

		if (this.veil)
			this.veil.destroy()
		
		$element.unbind('.' + namespace)
		dialog.remove()	
		
		z_indexer.unregister(this)
	}
	*/

	/**
	 * moves the dialog window to the top
	 */
	// the force parameter allows us to move modal dialogs 
	// to their correct position on open
	this.rise = function()//force, event) 
	{
		/*
		if ((this.options.modal && !force) ||
			(!this.options.stack && !this.options.modal))
			return this.$element.trigger(event)
		*/

		this.veil.set_z_index(z_indexer.acquire_top_z())
		this.$element.css('z-index', z_indexer.acquire_top_z())
	}
			
	/**
	 * sizes the dialog window
	 */
	this.size = function() 
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
	}
	
	/**
	 * positions the dialog window at the center of the screen
	 */
	this.position = function()
	{
		this.padding.left = parseInt((get_viewport_width() - this.$element.width()) / 2)
		this.padding.right = get_viewport_width() - this.$element.width() - this.padding.left
		
		this.padding.top = parseInt((get_viewport_height() - this.$element.height()) / 2)
		this.padding.bottom = get_viewport_height() - this.$element.height() - this.padding.top
		
		this.$element.css
		({
			left: 0,
			top: 0,//get_scroll_y(),
			
			'padding-left': this.padding.left,
			'padding-right': this.padding.right,
			'padding-top': this.padding.top,
			'padding-bottom': this.padding.bottom
		})
			
		/*
		this.$element.css
		({
			left: left_padding + 'px',
			top: get_scroll_y() + top_padding + 'px'
		})
		*/
	}
	
	/**
	 * resets all the registered controls
	 */
	this.reset = function()
	{
		// reset controls
		this.controls.each(function(control) { control.reset() })			
	}
	
	/**
	 * registers controls
	 */
	this.register_controls = function()
	{
		this.controls.combine(Array.prototype.slice.call(arguments).flatten())
	}

	// page scrolling helpers
	
	/**
	 * retrieves the current scroll position: (left, top)
	 */
	function get_scroll_position()
	{
		var scroll_position = 
		{
			x: get_scroll_x(),
			y: get_scroll_y()
		}
		
		return scroll_position
	}
	
	/**
	 * disables page scrolling
	 */
	function disable_scroll()
	{
		$(window).bind('scroll.' + namespace, {scroll_position: get_scroll_position()}, function(event) 
		{
    		window.scrollTo(event.data.scroll_position.x, event.data.scroll_position.y)
	    	return false
		})
	}
	
	/**
	 * enables page scrolling
	 */
	function enable_scroll()
	{
		$(window).unbind('scroll.' + namespace)
	}
	
	// locking
	this.is_locked = false
	
	/**
	 * locks the dialog window (and all of its controls)
	 */
	function lock()
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
	}
	
	/**
	 * unlocks the dialog window (and all of its controls)
	 */
	function unlock()
	{
		if (!this.is_locked)
			return
			
		this.is_locked = false
		
		// unlock controls
		this.control_locks.each(function(lock) { lock.unlock() })
	}

	// call the constructor
	this.create()
}	