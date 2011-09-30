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

var veil = new Class
({
	/**
	 * Constructor
	 * creates a new veil
	 */
	initialize: function(options) 
	{
		this.smooth = options.smooth
	
		this.$element = $('<div></div>')
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
			
		this.$element
			.addClass('dialog_window_veil')
			
		veiler.register(this.$element)
		
		this.show()
	},
	
	/**
	 * shows the veil
	 */
	show: function()
	{
		if (this.smooth)
			this.$element.fadeIn()
		else
			this.$element.show()
	},
	
	/**
	 * hides the veil
	 */
	hide: function(callback)
	{
		if (this.smooth)
			this.$element.fadeOut()
		else
		{
			this.$element.hide()
			
			if (callback)
				callback()
		}
	},
	
	/**
	 * destroys the veil
	 */
	destroy: function()
	{			
		veiler.unregister(this.$element)
	
		this.hide(this.$element.remove)
	},
	
	/**
	 * sets z-index
	 */
	set_z_index: function(top_z)
	{
		this.$element.css('z-index', top_z)
	}
})