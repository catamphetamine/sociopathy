/**
 * Image Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <span id="fancy_button" class="centered"></span>
 * 
 * In javascript:
 * 
 *	$(function()
 *	{
 *		new image_button
 *		(
 *			"fancy_button", 
 *			{
 *				path: "/images",
 *				"button name": "fancy button",
 *				width: 100,
 *				height: 100,	
 *				action: function() { alert('action') },
 *				delay: "1x"
 *			}
 *		)
 *	});
 *
 * In filesystem:
 * 
 * create sprite image (100 pixels by 300 pixels, in this example):
 * 		/images/fancy button.png
 * (frames (top to bottom): idle, ready, pushed)
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

		this.parent(id_or_element, options)
	},
	
	build_idle_frame: function()
	{
		this.$element.css
		({
			width: this.options.width + "px",
			height: this.options.height + "px",
				
			position: "relative",
			display: "block",
			
			"background-repeat": "no-repeat",
			"background-color": "transparent",
			"background-position": "0 0",
			"background-image": this.get_image_path()
		})
		
		return this.$element
	},
	
	build_ready_frame: function()
	{
		return this.build_hidden_frame({ height: this.options.height })
	},
	
	build_pushed_frame: function()
	{
		return this.build_hidden_frame({ height: this.options.height * 2 })
	},
	
	build_hidden_frame: function(options)
	{
		var $frame = $('<span></span>')
		this.$element.append($frame)

		$frame.css
		({
			width: this.options.width + "px",
			height: this.options.height + "px",
				
			position: "absolute",
			top: 0,
			left: 0,
			display: "none",
			opacity: 0,
	
			"background-repeat": "no-repeat",
			"background-color": "transparent",
			"background-position": "0 -" + options.height + "px",
			"background-image": this.get_image_path()
		})

		return $frame
	},
	
	get_image_path: function()
	{
		return "url('" + this.options.path + "/" + this.options["button name"] + "." + this.options['image format'] + "')"
	}.protect()
})
