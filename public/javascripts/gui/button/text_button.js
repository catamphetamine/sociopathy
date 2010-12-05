/**
 * Text Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * 
 * Usage:
 * 
 * In html:
 * 
 * // align buttons to the center
 * <div class="float_centerer">
 * 		<span id="yes" type="generic" styles="greenish">Yes</span>
 * 		<span id="no" type="generic" styles="reddish">No</span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 * 
 * <span id="back" ... style="float: left">Back</span> // align button to the left
 * <span id="next" ... style="float: right">Next</span> // align button to the right
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		new text_button
 *		(
 *			"yes",
 *			{
 *				path: 'images/button',
 *				height: 100,
 *				'side bar size': 10,
 *				action: function() { alert('yes') }
 *			}
 *		)
 *
 *		new text_button
 *		(
 *			"no",
 *			{
 *				path: 'images/button',
 *				height: 100,
 *				'side bar size': 10,
 *				action: function() { alert('no') }
 *			}
 *		)
 *	})
 *
 * In stylesheet:
 * 
 *	div.float_centerer
 *	{
 *		margin-left: auto;
 *		margin-right: auto;
 *	
 *		display: table;
 *	}
 *
 *	hr.float_centerer
 *	{
 *		clear: left; 
 *		visibility: hidden;
 *	}
 * 
 * In filesystem:
 * 
 * create sprite image for the left part of the button (100 pixels high and, for example, 500 pixels wide):
 * 		/images/button/generic/left.png
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * create sprite image for the right part of the button (100 pixels high and 10 pixels wide, in this example):
 * 		/images/button/generic/right.png
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * create style sheet for 'greenish' and 'reddish' buttons, and include them in your html page
 * (the order of css file inclusion matters, because the latest css file will overwrite styling of the previous css file)
 * 
 * Advanced usage example:
 * 
 * new text_button('fancy_button', 
 *	{
 *		icon: "cross",
 *		'icon width': 30,
 *		'icon height': 40,
 *		'icon top offset': 7,
 *		'icon spacing': 10,
 *		action: function() { alert('cancel') },
 *		delay: '1x'
 *	})
 *
 *	new text_button('another_fancy_button',
 *	{
 *		icon: "right arrows",
 *		'icon width': 32,
 *		'icon height': 32,
 *		'icon floating': "right",
 *		'icon top offset': 8,
 *		'icon spacing': 10
 *	})
 * 
 * Requires jQuery, MooTools, Button. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var text_button = new Class
({
	Extends: button,
	
	default_options:
	{
		'icon spacing': 10,
		'icon top offset': 0,
		'icon floating': 'left'
	},
	
	initialize: function(id_or_element, options)
	{
		this.parent(id_or_element, $.extend({}, this.default_options, options))		
	},
	
	prepare: function()
	{
		this.options.styles = this.get_styles()
	},
		
	get_styles: function()
	{
		var styles = this.$element.attr('styles')
		
		if (!styles)
			return []
			
		return styles.split(', ')
	},
	
	clone_content: function()
	{
		return $(this.content)
	}.protect(),
	
	build_idle_frame: function()
	{
		var $element = this.$element
		
		this.options['styles'].each(function(style_name)
		{
			$element.addClass(style_name + '_button')			
		})
			
		this.$element.wrapInner('<span><span></span></span><div style="clear: both"></div>')

		// style left part

		var $left_part = $(':first', this.$element)

		$left_part.css
		({
			'display': 'block',
			
			'min-height': this.options.height + 'px',
			'max-height': this.options.height + 'px',

			'background-position': 'left 0',
			'background-image': this.get_image_path('left'),
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
		})

		// style content
		
		var $content = $(':first :first', this.$element)
		$content.addClass('button_contents')

		$content.css
		({
			'display': 'block',
			'float': 'left',

			'padding-left': this.options['side bar size'] + 'px',

			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		})

		if (this.options.icon)
			this.add_icon($content)
		
		// style right part (and container)

		this.$element.css('background-position', 'right top')
		this.$element.css(this.get_right_part_style())
	
		this.$element.css
		({
			'position': 'relative',
			'display': 'block'
		})

		this.content = this.$element.html()
		
		return this.$element
	},
	
	build_ready_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button_ready')			
		})

		return this.build_hidden_frame({ styles: styles, 'image index': 2 })
	},
	
	build_pushed_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button_pushed')			
		})

		return this.build_hidden_frame({ styles: styles, 'image index': 3 })
	},
	
	build_hidden_frame: function(options)
	{
		var $frame = $('<span></span>')
		
		options.styles.each(function(style_name)
		{
			$frame.addClass(style_name)			
		})

		var $content = this.clone_content()
		$frame.append($content)
	
		var $left_part = $(':first', $frame)
		$left_part.css('background-position', "left -" + this.options.height * (options['image index'] - 1) + "px")
	
		$frame.css
		({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'display': 'none',
			'opacity': 0
		})
	
		$frame.css("background-position", "right -" + this.options.height * (options['image index'] - 1) + "px")
		$frame.css(this.get_right_part_style())
		
		// adjust the icon image
		$('.button_icon', $content).css('background-position', 'left -' + this.options['icon height'] * (options['image index'] - 1) + 'px')

		// result		
		this.$element.append($frame)
		return $frame
	},

	get_right_part_style: function()
	{
		var style = 
		{
			'background-image': this.get_image_path('right'),
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
				
			'height': this.options.height + 'px',
			'margin': 0,
			'padding-right': this.options['side bar size'] + 'px',
	
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		}
		
		return style
	},
	
	get_image_path: function(image_name)
	{
		return "url('" + this.options.path + "/" + this.options["button name"] + "/" + image_name + "." + this.options['image format'] + "')"
	}.protect(),
	
	get_icon_path: function(icon_name)
	{
		return "url('" + this.options.path + "/icon/" + icon_name + "." + this.options['image format'] + "')"
	}.protect(),
	
	add_icon: function($element)
	{
		// set icon margin type
		
		var margin_type
		
		if (this.options['icon floating'] == "right")
			margin_type = "left"
		else
			margin_type = "right"
	
		// float the preceeding element to the opposite direction
		
		var previous_element_float
		
		if (this.options['icon floating'] == "right")
			previous_element_float = "left"
		else
			previous_element_float = "right"
			
		$(':first', $element).css('float', previous_element_float)
	
		// create icon image
		
		var $image = $('<span></span>')
		
		$image.css
		({
			'display': 'block',
			
			'width': this.options['icon width'] + 'px',
			'height': this.options['icon height'] + 'px',
			
			'margin-top': this.options['icon top offset'] + 'px',
			
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
			'background-position': 'left top',
			'background-image': this.get_icon_path(this.options.icon),
		})

		$image.css('margin-' + margin_type, this.options['icon spacing'] + 'px')
		
		$image.addClass('button_icon')
	
		// create icon element
		var $icon = $('<span style="display: block; float: ' + this.options['icon floating'] + '"></span>')
		$icon.append($image)
		
		// place the icon on the page
		if (this.options['icon floating'] == "right")
			$element.append($icon)
		else
			$element.prepend($icon)
	}.protect()
})