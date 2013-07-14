/**
 * Image Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * 
 * Requires: jQuery, MooTools, Button. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var image_button = new Class
({
	Extends: button,
	
	initialize: function(id_or_element, options)
	{
		this.options['image format'] = 'png'

		var element = button.get_element(id_or_element)
		
		this.options.width = element.width()
		this.options.height = element.height()
		
		var ok = false
		
		if (this.options.width && this.options.height)
			ok = true
		
		if (options)
			if (options.width && options.height)
				ok = true
		
		if (!ok)
		{
			console.log(element)
				
			while (element.parent().exists())
			{
				console.log(element.parent())
				element = element.parent()
			}
			
			throw 'Width and height are not initialized for this image button'
		}

		this.options.skin = element.css('background-image') //element.attr('skin')
		
		this.parent(id_or_element, options)
	},
	
	build_idle_frame: function()
	{
		var position = this.$element.css('position')
		
		//if (position !== 'absolute')
		//	position = 'relative'
		
		if (this.$element.css('position') !== 'absolute')
			this.$element.css('position', 'relative')
		
		var display = this.$element.css('display')
		if (display !== 'block' && display !== 'inline-block' && display !== 'none')
			display = 'block';
		
		return this.build_frame({ skin_top_offset: 0 })
		
		this.$element.css
		({
			width: this.options.width + "px",
			height: this.options.height + "px",
				
			position: position,
			display: display,
			
			"background-repeat": "no-repeat",
			"background-color": "transparent",
			"background_position_x": 'left',
			"background_position_y": 'top',
			"background-image": this.get_image_path()
		})
		
		return this.$element
	},
	
	build_ready_frame: function()
	{
		return this.build_frame({ skin_top_offset: this.options.height }).css
		({
			display: 'none',
			opacity: 0
		})
	},
	
	build_pushed_frame: function()
	{
		return this.build_frame({ skin_top_offset: this.options.height * 2 }).css
		({
			display: 'none',
			opacity: 0
		})
	},
	
	build_frame: function(options)
	{
		var $frame = $('<div></div>')
		this.$element.append($frame)

		$frame.css
		({
			width: this.options.width + "px",
			height: this.options.height + "px",
				
			position: "absolute",
			top: 0,
			left: 0,
	
			"background-repeat": "no-repeat",
			"background-color": "transparent",
			"background_position_y": "-" + options.skin_top_offset + "px",
			"background-image": this.get_image_path()
		})

		return $frame
	},
	
	get_image_path: function()
	{
		return this.options.skin
	}
	.protect()
})
