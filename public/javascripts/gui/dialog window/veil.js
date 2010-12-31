/**
 * Dialog Window veil
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

function veil()
{
	/**
	 * Constructor
	 * creates a new veil
	 */
	this.create = function() 
	{
		var $veil = $('<div></div>')
			.appendTo(document.body)
			.hide()
			.css
			({
				position: 'absolute',
				
				left: 0,
				top: 0,

				'z-index': z_indexer.acquire_top_z(),
				
				width: get_page_width() + 'px',
				height: get_page_height() + 'px'
			})
			
		$veil.addClass('dialog_window_veil')
		
		veiler.register($veil)
		return $veil
	}
	
	/**
	 * shows the veil
	 */
	this.show = function()
	{
		this.$element.show()
//		this.$element.fadeIn()
	}
	
	/**
	 * hides the veil
	 */
	this.hide = function(callback)
	{
		this.$element.hide()
		
		if (callback)
			callback()
			
//		this.$element.fadeOut()
	}
	
	/**
	 * destroys the veil
	 */
	this.destroy = function()
	{			
		veiler.unregister(this.$element)
	
		this.hide(this.$element.remove)
	}
	
	/**
	 * sets z-index
	 */
	this.set_z_index = function(top_z)
	{
		this.$element.css('z-index', top_z)
	}

	// call the constructor	
	this.$element = this.create()
	this.show()
}