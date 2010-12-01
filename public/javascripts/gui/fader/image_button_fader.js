/**
 * Image Button Fader
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
 *				height: 100
 *			},
 *			{				
 *				action: function(button) { alert('button pressed: ' + button) },
 *				delay: "2x"
 *			}
 *		)
 *	});
 *
 * In filesystem:
 * 
 * create images (100 pixels by 100 pixels, in this example):
 * 		/images/fancy button.png
 * 		/images/fancy button ready.png 
 * 		/images/fancy button pushed.png
 * 
 * additional styles are described in the buttons.css file 
 * (included in the distribution)
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

var image_button_fader = new (function()
{	
	var ready_style_postfix = "_ready"
	var pushed_style_postfix = "_pushed"
	
	var ready_image_postfix = " ready"
	var pushed_image_postfix = " pushed"

	var image_format = "png"

	var image_button_style_name = "image_button"
	
	// for an image button
	this.activate = function(button_id_or_button, images_info, _)
	{
		new image_button_initializer(button_id_or_button, images_info, _).initialize()
	}
	
	// image button helper class
	function image_button_initializer(button_id_or_button, images_info, _)
	{
		// initialize member variables
		
		this.button = get_button(button_id_or_button)
		this.images_info = images_info
				
		// additional parameters
		this._ = _
		
		// main function	
		this.initialize = function()
		{	
			// this is the idle button frame
			this.button.addClass(image_button_style_name)
			
			this.create_other_button_frames()
		
			this.set_button_frame_backgrounds()
			this.set_button_frame_sizes()
					
			// activate fading between frames
			button_fader.activate_fading
			(
				{
					button: this.button,
					"ready frame": this.button_ready,
					"pushed frame": this.button_pushed
				},
				_
			)
		}
		
		// create additional button frames
		this.create_other_button_frames = function()
		{
			this.button.append
			(
				"<span class='" + image_button_style_name + ready_style_postfix + "'></span>" +
				"<span class='" + image_button_style_name + pushed_style_postfix + "'></span>"
			)
		
			this.button_ready = $(":nth-child(1)", this.button)
			this.button_pushed = $(":nth-child(2)", this.button)
		}

		// size button frames to the image size
		this.set_button_frame_sizes = function()
		{
			this.size_button(this.button)
			this.size_button(this.button_ready)
			this.size_button(this.button_pushed)
		}

		// set the backgrounds of button frames
		this.set_button_frame_backgrounds = function()
		{
			this.set_background(this.button)
			this.set_background(this.button_ready, ready_image_postfix)
			this.set_background(this.button_pushed, pushed_image_postfix)
		}
		
		function get_button(button_id_or_button)
		{
			if (typeof button_id_or_button == 'string')
				return $("#" + button_id_or_button)
			else
				return button_id_or_button
		}
		
		this.set_background = function(button, postfix)
		{
			button.css("background-image", this.get_background_url(postfix))	
		}
		
		this.get_background_url = function(postfix)
		{
			// check postfix
			if (!postfix) 
				postfix = ""
			
			// compose background image url
			return "url('" + this.images_info["path"] + "/" + this.images_info["button name"] + postfix + "." + image_format + "')"
		}
	
		this.size_button = function(button)
		{
			size(button, this.images_info["width"], this.images_info["height"])
		}
		
		function size(element, width, height)
		{
			element.css("width", width + "px")
			element.css("height", height + "px")
		}
	}
})()
