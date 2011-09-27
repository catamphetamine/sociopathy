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
 * 		<!-- cancel button -->
 *		<span id="join_dialog_cancel_button" class="left" type="minor" styles="generic, minor, caution">
 *			<span type="icon" icon="cross" width="30" height="30" top_offset="5"></span>
 *			<span class="translated" label="button 'cancel'"></span>
 *		</span>
 *		
 *		<!-- next button -->			
 *		<span id="join_dialog_next_button" class="right" type="dark generic" styles="generic">
 *			<span class="translated" label="button 'next'"></span>
 *			<span type="icon" icon="right arrows" width="40" height="30" top_offset="7"></span>
 *		</span>
 *
 *		<!-- done button -->
 *		<span id="join_dialog_done_button" class="right" type="dark generic" styles="generic">
 *			<span type="icon" icon="check" width="24" height="24" top_offset="8"></span>
 *			<span class="translated" label="button 'done'"></span>
 *		</span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 * 
 * <span id="back" ... style="float: left">Back</span> // align button to the left
 * <span id="next" ... style="float: right">Next</span> // align button to the right
 *
 * In javascript:
 * 
 *	$(function()
 *	{
 *		new text_button
 *		(
 *			"yes",
 *			{
 *				skin: 'aqua',
 *				action: function() { alert('yes') }
 *			}
 *		)
 *
 *		new text_button
 *		(
 *			"no",
 *			{
 *				skin: 'aqua',
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
 * 		/картинки/button/generic/left.png
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * create sprite image for the right part of the button (100 pixels high and 10 pixels wide, in this example):
 * 		/картинки/button/generic/right.png
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * create style sheets for 'generic', 'minor' and 'caution' buttons (see the default examples), and include them in your html page
 * (the order of css file inclusion matters, because the latest css file will overwrite styling of the previous css file)
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
		icon:
		{
			spacing: 10,
			'top offset': 0,
			floating: 'left'
		}
	},
	
	initialize: function(id_or_element, options)
	{
		this.parent(id_or_element, $.extend({}, this.default_options, options))		
	},
	
	prepare: function()
	{
		// set button styles
		this.options.styles = this.get_styles()
		
		// set button skin
		this.skin = this.skins[this.options.skin]
		
		// set button icon options
		this.set_icon_options()
	},
	
	set_icon_options: function()
	{
		// initialize icon options
		this.options.icon = this.options.icon || {}
		
		// shortcut
		var icon = this.options.icon
		
		var $icon = this.get_icon_element()
		
		icon.name = $icon.attr('icon')
		
		icon.width = $icon.attr('width')
		icon.height = $icon.attr('height')
		
		icon['top offset'] = $icon.attr('top_offset')
		
		if ($icon.prev().length == 0)
			icon.floating = 'left'
		else
			icon.floating = 'right' 
	},
	
	get_icon_element: function()
	{
		return $('span[type="icon"]', this.$element)
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
		
		this.options.styles.each(function(style_name)
		{
			$element.addClass(style_name + '_button')			
		})
			
		this.$element.wrapInner('<span><span></span></span><div style="clear: both"></div>')

		// style left part

		var $left_part = $(':first', this.$element)

		$left_part.css
		({
			'display': 'block',
			
			'min-height': this.skin.height + 'px',
			'max-height': this.skin.height + 'px',

			'background_position_x': 'left',
			'background_position_y': 'top',
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

			'padding-left': this.skin['side bar size'] + 'px',

			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		})

		if (this.options.icon)
			this.add_icon($content)
		
		// style right part (and container)

		this.$element.css
		({
			'background_position_x': 'right',
			'background_position_y': 'top'
		})
		
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
		$left_part.css('background_position_x', 'left')
		$left_part.css('background_position_y', "-" + this.skin.height * (options['image index'] - 1) + "px")
	
		$frame.css
		({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'display': 'none',
			'opacity': 0
		})
	
		// a fix for Chrome
		$frame.css('background-position', '0 0')

		$frame.css('background_position_x', 'right')
		$frame.css('background_position_y', "-" + this.skin.height * (options['image index'] - 1) + "px")
		$frame.css(this.get_right_part_style())
		
		// adjust the icon image
		$('.button_icon', $content).css('background_position_y', '-' + this.options.icon.height * (options['image index'] - 1) + 'px')

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
				
			'height': this.skin.height + 'px',
			'margin': 0,
			'padding-right': this.skin['side bar size'] + 'px',
	
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		}
		
		return style
	},
	
	get_image_path: function(image_name)
	{
		return "url('" + this.skin.path + "/" + this.options["button type"] + "/" + image_name + "." + this.skin['image format'] + "')"
	}.protect(),
	
	get_icon_path: function(icon_name)
	{
		return "url('" + this.skin.path + "/icon/" + icon_name + "." + this.skin['image format'] + "')"
	}.protect(),
	
	add_icon: function($element)
	{
		// set icon margin type
		
		var margin_type
		
		if (this.options.icon.floating == "right")
			margin_type = "left"
		else
			margin_type = "right"
	
		// float the preceeding element to the opposite direction
		
		var previous_element_float
		
		if (this.options.icon.floating == "right")
			previous_element_float = "left"
		else
			previous_element_float = "right"

		$(':first', $element).css('float', previous_element_float)
	
		// create icon image
		
		var $image = $('<span></span>')
		
		$image.css
		({
			'display': 'block',
			
			'width': this.options.icon.width + 'px',
			'height': this.options.icon.height + 'px',
			
			'margin-top': this.options.icon['top offset'] + 'px',
			
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
			'background_position_x': 'left',
			'background_position_y': 'top',
			'background-image': this.get_icon_path(this.options.icon.name),
		})

		$image.css('margin-' + margin_type, this.options.icon.spacing + 'px')
		
		$image.addClass('button_icon')
	
		// create icon element
		var $icon = this.get_icon_element()
		$icon.css
		({
			display: 'block',
			'float': this.options.icon.floating
		})
		.append($image)
		
		// place the icon on the page
		if (this.options.icon.floating == "right")
			$element.append($icon)
		else
			$element.prepend($icon)
	}.protect()
})

// skinning
text_button.add_skin = function(name, settings)
{
	button.prototype.skins = button.prototype.skins || {}
	
	button.prototype.skins[name] = settings
}