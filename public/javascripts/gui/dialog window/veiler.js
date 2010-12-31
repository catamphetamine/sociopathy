/**
 * Dialog Window veiler
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

var veiler = new (function()
{
	var escape_key_code = 27
	
	var namespace = "veiler" 

	// veil collection
	
	var $veils = []
		
	/**
	 * checks if there are no veils shown
	 */
	var no_veils = function()
	{
		return $veils.length == 0
	}
	
	/**
	 * checks if there are some veils shown
	 */
	var has_veils = function()
	{
		return $veils.length > 0
	}
			
	// mutable events
	var events = $.map
	(
		'focus, mousedown, mouseup, keydown, keypress, click'.split(', '),
		function(event) { return event + '.' + namespace }
	).join(' ')
	
	/**
	 * unbinds all events
	 */
	this.unbind = function()
	{
		$([document, window]).unbind('.' + namespace)
	}
	
	/**
	 * starts muting of events targeted to anything beneath the dialog window
	 */
	/*
	this.start_underneath_event_muting = function() 
	{
		if (has_veils())
			$(document).bind
			(
				events,
				this.mute_if_belongs_underneath
			)
	}
	*/
	
	/**
	 * mutes all events targeted to anything beneath the dialog window
	 */
	/*
	this.mute_if_belongs_underneath = function(event)
	{
		var $element = $(event.target)
		
		if ($element.belongs_to(z_indexer.get_top_dialog_window().$element))
			return
			
		if ($element.css('zIndex') < z_indexer.top_z)
			return false
	}
	*/
	
	// handle resizing
	
	/**
	 * sizes all the veils to take the whole page space
	 */
	this.resize = function() 
	{
		$veils.each(this.size_veil)
	}
	
	/**
	 * sizes the veil to take the whole page space
	 */
	this.size_veil = function($veil)
	{
		$veil.css
		({
			width: 0,
			height: 0
		}).css
		({
			width: get_page_width() + 'px',
			height: get_page_height() + 'px'
		})
	}
	
	/**
	 * registers the new veil
	 */
	this.register = function($veil)
	{
		// if this is gonna be the first veil - initialize environment
		if (no_veils())
		{
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling
//			setTimeout(this.start_underneath_event_muting.bind(this), 1)
			
			// allow closing current dialog window by pressing the escape key
			this.allow_closing_on_escape()

			// handle window resize
			$(window).bind('resize.' + namespace, this.resize.bind(this))
		}
		
		// add the veil to the list
		$veils.push($veil)
	}
	
	/**
	 * allow closing current dialog window by pressing the escape key
	 */
	this.allow_closing_on_escape = function()
	{
		$(document).bind
		(
			'keydown.' +namespace, 
			function(event)
			{
				if (!event.keyCode || event.keyCode !== escape_key_code)
					return 
				
				var dialog_window = z_indexer.get_top_dialog_window()
				
				if (dialog_window.options['close on escape'])
				{
					dialog_window.close()
					event.preventDefault()
				}
			}
		)
	}
	
	/**
	 * unregisters the veil being destroyed
	 */
	this.unregister = function($veil)
	{
		$veils.remove($veil)

		if (no_veils())
			this.unbind()
	}
})()
