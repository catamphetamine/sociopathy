/**
 * Dialog Window
 * 
 * This jQuery plugin creates dialog windows inside the page.
 * 
 * Inspired by jQuery UI Dialog.
 * Requires jQuery and MooTools.
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
	// jQuery plugin
	$.fn.dialog_window = function(options)
	{
		var $element = this
		
		if (this.length > 1)
			$element = $(this.get(0))
		
		return new dialog_window($element, options)
	}
	
	// some selection filters from jQuery UI: focusable and tabbable

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