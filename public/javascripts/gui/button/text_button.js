/**
 * Text Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <div class="float_centerer">
 * 		<span id="yes">Yes</span>
 * 		<span id="no">No</span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 * 
 * <span id="back" style="float: left">Back</span>
 * <span id="next" style="float: right">Next</span>
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		new text_button
 *		(
 *			"yes"
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
 * graphics for generic buttons is described in the buttons.css file 
 * and is included in the distribution
 * 
 * Advanced usage example:
 * 
 * button_fader.activate_buttons("images/button", 
 *	{
 *		cancel: 
 *		{
 *			icon: "cross",
 *			"top offset": 13,
 *			spacing: 10,
 *			"text color": "#ad1c00",
 			action: function() { alert('cancel') },
			delay: "2x"
 *		},
 *		next: 
 *		{
 *			icon: "right arrows",
 *			floating: "right",
 *			"top offset": 14,
 *			spacing: 10
 *		}
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

// style preset
$(document).ready(function()
{
	$("body").append
	(
		"<div id='style_preset' style='display: none'>" +
			"<span class='caution_button'></span>" +  
			"<span class='caution_button_ready'></span>" +  
			"<span class='caution_button_pushed'></span>" +  
		"</div>"
	)
})

var text_button = new Class
({
	Extends: button,
	
	default_options:
	{
		'icon spacing': 10
	},
	
	initialize: function(id_or_element, options)
	{
		this.parent(id_or_element, options)		
	},

	clone_content: function()
	{
		return $(this.content)
	}.protect(),
	
	build_idle_frame: function()
	{
		this.$element.addClass('button')	
		this.$element.wrapInner('<span><span></span></span>')

		// style left part

		var $left_part = $(':first', this.$element)
		$left_part.addClass('button_contents')

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

		$content.css
		({
			'display': 'block',
			'float': 'left',

			'padding-left': this.options['side bar size'] + 'px',
	
			'cursor': this.get_cursor_style(),
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		})

		// style right part (and container)

		this.$element.css('background-position', 'right top')
		this.$element.css(this.get_right_part_style())
	
		this.$element.css
		({
			'position': 'relative',
			'display': 'block'
		})

		this.content = this.$element.html()
	},
	
	build_ready_frame: function()
	{
		return this.build_hidden_frame({ style_name: 'button_ready', height: this.options.height })
	},
	
	build_pushed_frame: function()
	{
		return this.build_hidden_frame({ style_name: 'button_pushed', height: this.options.height * 2 })
	},
	
	build_hidden_frame: function(options)
	{
		var $frame = $('<span></span>')
		$frame.addClass(options.style_name)

		var $content = this.clone_content()
		$frame.append($content)
	
		var $left_part = $(':first', $frame)
		$left_part.css('background-position', "left -" + options.height + "px")
	
		$frame.css
		({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'display': 'none',
			'opacity': 0
		})
	
		$frame.css("background-position", "right -" + options.height + "px")
		$frame.css(this.get_right_part_style())
		
		this.$element.append($frame)
		return $frame
	},

	get_right_part_style: function()
	{
		var style = 
		{
			'background-attachment': 'scroll',
			'background-image': this.get_image_path('right'),
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
				
			'height': this.options.height + 'px',
			'margin': 0,
			'padding-right': this.options['side bar size'] + 'px',
	
			'cursor': this.get_cursor_style(),
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		}
		
		return style
	},
	
	get_image_path: function(image_name)
	{
		return "url('" + this.options.path + "/" + this.options["button name"] + "/" + image_name + "." + this.options['image format'] + "')"
	}.protect(),
	
	get_cursor_style: function()
	{
		if (this.$element.attr('level') == 'minor')
			return 'pointer'
			
		return 'default'
	}.protect()
})