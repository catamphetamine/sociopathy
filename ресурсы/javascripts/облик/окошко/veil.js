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
		//this.smooth = options.smooth
		
		this.$element = $('<div></div>')
			.appendTo(document.body)
			.hide()
			.css
			({
				position: 'fixed',
				
				left: 0,
				top: 0,
				
				width: '100%',
				height: '100%',

				'z-index': z_indexer.acquire_top_z(),
				
				//cursor: 'not-allowed'
			})
			
		if (options.style)
			this.$element.css(options.style)
		
		/*
		$(window).resize((function()
		{
			this.size()
		})
		.bind(this))
		*/
		
		this.$element.addClass('dialog_window_veil')
			
		veiler.register(this.$element)
		
		this.show()
	},
	
	/*
	size: function()
	{
		this.$element.css
		({
			width: $(document).width() + 'px',
			height: $(document).height() + 'px'
		})
	},
	*/
	
	/**
	 * shows the veil
	 */
	show: function()
	{
		//this.size()
		this.$element.fadeIn()
	},
	
	/**
	 * hides the veil
	 */
	hide: function(callback)
	{
		this.$element.fadeOut(function()
		{
			if (callback)
				callback()
		})
	},
	
	/**
	 * destroys the veil
	 */
	destroy: function()
	{
		var element = this.$element
		veiler.unregister(element)
		this.hide(function() { element.remove() })
	},
	
	hide_and_destroy: function()
	{
		var veil = this
		veil.$element.attr('destroying', true)
		veil.hide(function() { veil.destroy() })
	},
	
	/**
	 * sets z-index
	 */
	set_z_index: function(top_z)
	{
		this.$element.css('z-index', top_z)
	}
})