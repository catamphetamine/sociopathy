/**
 * Dialog Window
 * 
 * This script creates windows inside the page
 * 
 * Requires jQuery. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

(function($)
{
	function dialog_window($element, custom_options)
	{
		var escape_key_code = 27
		var tabulation_key_code = 9

		var self = this
		
		var controls = []
		
		var namespace = "window"
		
		var top_z = 0
	
		var is_open = false
		
		var dialog_window
		var veil
		
		var options =
		{
			modal: true,
			stack: true,
			close_on_escape: true,
			width: "auto",
			height: "auto"
		}
		
		// the force parameter allows us to move modal dialogs 
		// to their correct position on open
		this.rise = function()//force, event) 
		{
			/*
			if ((options.modal && !force) ||
				(!options.stack && !options.modal))
				return $element.trigger(event)
			*/
	
			top_z++
			dialog_window.css('z-index', top_z)
			
			veil.set_top_z(top_z)
		}
		
		// creates new dialog window
		var create = function() 
		{
			var title = $element.attr('title')
	
			dialog_window = $('<div></div>')
				.appendTo(document.body)
				.hide()
				.addClass("dialog_window")
				// setting tabIndex makes the div focusable
				.attr('tabIndex', -1)
				// setting outline to 0 prevents a border on focus in Mozilla
				.css('outline', 0)
				.bind('keydown.' + namespace, function(event) 
				{
					// close on escape key
					if (options.close_on_escape && event.keyCode &&
						event.keyCode === escape_key_code) 
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
	
			var content = $element
				.addClass("dialog_window_content")
				.appendTo(dialog_window)
	
			var title_bar = $('<div></div>')
				.addClass("dialog_window_top_bar")
				.text(title)
				.prependTo(dialog_window)
		}
		
		// opens the dialog window
		this.open = function() 
		{
			if (is_open)
				return
	
			if (options.modal)
				veil = new veil(this)
				
			this.size()
			this.position()
			dialog_window.show()
			this.rise()
	
			// prevent tabbing out of modal dialog windows
			if (options.modal)
				dialog_window.bind('keypress.' + namespace, this.swallow_outer_tabulation)
			
			is_open = true
		}
		
		// prevent tabbing out of modal dialog windows
		this.swallow_outer_tabulation = function(event) 
		{	
			if (event.keyCode !== tabulation_key_code)
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
			veil.destroy()
			
			dialog_window.unbind('keypress.' + namespace);
					
			dialog_window.hide()
			
			// adjust the z-index counter
			if (options.modal)
				dialog_window_manager.refresh_top_z()

			is_open = false
		}
	
		/*
		destroy = function() 
		{
			if (veil)
				veil.destroy()
			
			dialog.hide()
			$element.unbind(namespace)
			dialog.remove()	
		}
		*/
		
		this.size = function() 
		{
			// reset content sizing
			dialog_window.show().css
			({
				width: 'auto',
				height: 0
			})
	
			// reset wrapper sizing
			// determine the height of all the non-content elements
			var non_content_elements_height = dialog_window.css
			({
				height: 'auto',
				width: options.width
			})
			.height()
			
			if (options.height === "auto") 
				dialog_window.css({ height: "auto" })
			else
				dialog_window.height(Math.max(options.height - non_content_elements_height, 0))
		}
		
		this.position = function()
		{
			dialog_window.css
			({
				left: 0,
				top: 0
			})
		}
		
		this.reset = function()
		{
			// reset controls
			this.controls.each(function(control) { control.reset() })			
		}
		
		this.add_controls = function()
		{
			controls.combine(Array.prototype.slice.call(arguments).flatten())
		}
		
		create()
	}
	
	var dialog_window_manager = new (function()
	{
		var dialog_windows = []
		
		this.refresh_top_z = function()
		{
			top_z = this.calculate_top_z()
		}
		
		this.calculate_top_z = function()
		{
			var top_z = 0
			
			$.each(dialog_windows, function() 
			{
				top_z = Math.max(top_z, $(this).css('z-index'))
			})
			
			return top_z
		}
	})()
	
	function veil(dialog)
	{
		this.$element = veiler.create(dialog)
		
		this.destroy = function()
		{
			if (veiler.has_veils())
				veiler.unbind()
				
			$veil.remove()
			
			veiler.refresh_top_z()
		}
		
		this.set_top_z = function(top_z)
		{
			veiler.top_z = top_z
			this.$element.css('z-index', top_z)
		}
	}
	
	var veiler = new(function()
	{
		var namespace = "veiler" 

		// veil collection
		
		var veils = []
			
		var no_veils = function()
		{
			return veils.length == 0
		}
		
		var has_veils = function()
		{
			return veils.length > 0
		}
		
		// z-index handling
		
		var top_z = 0
		
		var refresh_top_z = function()
		{
			top_z = this.calculate_top_z()
		}
		
		this.calculate_top_z = function()
		{
			var top_z = 0
			
			$.each(veils, function() 
			{
				top_z = Math.max(top_z, this.css('z-index'))
			})
			
			return top_z
		}
		
		// mutable events
		var events = $.map
		(
			'focus, mousedown, mouseup, keydown, keypress, click'.split(', '),
			function(event) { return event + '.' + namespace }
		).join(' ')
		
		// unbind all events
		this.unbind = function()
		{	
			$([document, window]).unbind(namespace)
		}
		
		// muting events targeted to anything beneath the dialog window
		
		this.start_underneath_event_muting = function() 
		{
			if (has_veils())
				$(document).bind
				(
					events, 
					this.mute_if_belongs_underneath(event)
				)
		}
		
		this.mute_if_belongs_underneath = function(event)
		{
			if ($(event.target).zIndex() < top_z)
				return false
		}
		
		// creates new veil
		this.create = function(dialog_window) 
		{
			// if this is gonna be the first veil - initialize environment
			if (no_veils())
			{
				// prevent use of anchors and inputs
				// we use a setTimeout in case the overlay is created from an
				// event that we're going to be cancelling
				setTimeout(start_underneath_event_muting, 1)
				
				// allow closing by pressing the escape key
				$(document).bind
				(
					'keydown.' +namespace, 
					function(event)
					{
						if (dialog.options.close_on_escape && event.keyCode &&
							event.keyCode === escape_key_code) 
						{
							dialog_window.close(event)
							event.preventDefault()
						}
					}
				)
	
				// handle window resize
				$(window).bind('resize' + namespace, this.resize)
			}
	
			var $veil = $('<div></div>')
				.appendTo(document.body)
				.css
				({
					width: get_width(),
					height: get_height()
				})
	
			veils.push($veil)
			return $veil
		}
		
		// handle resizing
		
		function get_height()
		{
			return $(document).height() + 'px';
		}
		
		function get_width()
		{
			return $(document).width() + 'px';
		}
		
		this.resize = function() 
		{
			var $veils = $([])
			
			$.each(veils, function() 
			{
				$veils = $veils.add(this)
			})
	
			$veils.css
			({
				width: 0,
				height: 0
			}).css
			({
				width: get_width(),
				height: get_height()
			})
		}
	})()
	
	// jQuery plugin
	$.fn.window = function(options)
	{
		var $element = this
		
		if (this.length > 1)
			$element = $(this.get(0))
		
		return new dialog_window($element, options)
	}
	
	// from jQuery UI

	function visible( element ) 
	{
		return !$( element ).parents().andSelf().filter(function() 
		{
			return $.curCSS( this, "visibility" ) === "hidden" ||
				$.expr.filters.hidden( this );
		}).length;
	}
	
	$.extend( $.expr[ ":" ], 
	{
		focusable: function( element ) 
		{
			var tag = element.nodeName.toLowerCase()
			var tab_index = $.attr( element, "tabindex" )
			
			return ( /input|select|textarea|button|object/.test( tag )
				? !element.disabled
				: "a" == tag
					? element.href || !isNaN( tab_index )
					: !isNaN( tab_index ))
				// the element and all of its ancestors must be visible
				&& visible( element )
		},
	
		tabbable: function( element ) 
		{
			var tab_index = $.attr( element, "tabindex" );
			return ( isNaN( tab_index ) || tab_index >= 0 ) && $( element ).is( ":focusable" );
		}
	})
})(jQuery)
