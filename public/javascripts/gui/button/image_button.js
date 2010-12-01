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
 *	$(document).ready(function()
 *	{
 *		button_fader.activate
 *		(
 *			"fancy_button", 
 *			{
 *				path: "/images",
 *				"button name": "fancy button",
 *				width: 100,
 *				height: 100,	
 *				action: function(button) { alert('button pressed: ' + button); button.let_unlock(); },
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
 * Requires jQuery and Button. 
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
	
	initialize: function(id, options)
	{
		this.parent(id, options)
	},
	
	build_idle_frame: function()
	{
		this.$element.css("width", this.options.width + "px")
		this.$element.css("height", this.options.height + "px")
			
		this.$element.css("position", "relative")
		this.$element.css("display", "block")
		
		this.$element.css("background-repeat", "no-repeat")
		this.$element.css("background-color", "transparent")
		this.$element.css("background-position", "0 0")
		this.$element.css("background-image", this.get_image_path())
	},
	
	build_ready_frame: function()
	{
		var $frame = $('<span></span>')
		this.$element.append($frame)

		$frame.css("width", this.options.width + "px")
		$frame.css("height", this.options.height + "px")
			
		$frame.css("position", "absolute")
		$frame.css("top", "0")
		$frame.css("left", "0")
		$frame.css("display", "none")
		$frame.css("opacity", "0")

		$frame.css("background-repeat", "no-repeat")
		$frame.css("background-color", "transparent")
		$frame.css("background-position", "0 -" + this.options.height + "px")
		$frame.css("background-image", this.get_image_path())

		return $frame
	},
	
	build_pushed_frame: function()
	{
		var $frame = $('<span></span>')
		this.$element.append($frame)

		$frame.css("width", this.options.width + "px")
		$frame.css("height", this.options.height + "px")
			
		$frame.css("position", "absolute")
		$frame.css("top", "0")
		$frame.css("left", "0")
		$frame.css("display", "none")
		$frame.css("opacity", "0")

		$frame.css("background-repeat", "no-repeat")
		$frame.css("background-color", "transparent")
		$frame.css("background-position", "0 -" + this.options.height * 2 + "px")
		$frame.css("background-image", this.get_image_path())

		return $frame
	},
	
	get_image_path: function()
	{
		return "url('" + this.options.path + "/" + this.options["button name"] + "." + this.options['image format'] + "')"
	}
})
