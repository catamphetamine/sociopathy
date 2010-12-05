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
 * 		<span id="yes" type="generic" styles="generic">Yes</span>
 * 		<span id="no" type="generic" styles="generic">No</span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 * 
 * <span id="back" ... style="float: left">Back</span>
 * <span id="next" ... style="float: right">Next</span>
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		new text_button
 *		(
 *			"yes"
 *		)
 *
 *		new text_button
 *		(
 *			"no"
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
 * new text_button('fancy_button', 
 *	{
 *		icon: "cross",
 *		"top offset": 13,
 *		spacing: 10,
 *		"text color": "#ad1c00",
 *		action: function() { alert('cancel') },
 *		delay: "2x"
 *	})
 *
 *	new text_button('another_fancy_button',
 *	{
 *		icon: "right arrows",
 *		floating: "right",
 *		"top offset": 14,
 *		spacing: 10
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
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button_ready')			
		})

		return this.build_hidden_frame({ styles: styles, height: this.options.height })
	},
	
	build_pushed_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button_pushed')			
		})

		return this.build_hidden_frame({ styles: styles, height: this.options.height * 2 })
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
	
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none'
		}
		
		return style
	},
	
	get_image_path: function(image_name)
	{
		return "url('" + this.options.path + "/" + this.options["button name"] + "/" + image_name + "." + this.options['image format'] + "')"
	}.protect()
})

/*
 			// if there is standard text color for this button frame - apply it
			this.set_text_color = function(button_content, postfix)
			{
				// check postfix
				if (!postfix)
					postfix = ""
				
				// get style presets
				var preset = $("#style_preset > ." + this.type + "_button" + postfix)
				
				if (preset.length == 0)
					return
	
				// get preset text color
				var color = preset.css("color")
												
				if (!color)
					return
					
				// apply the text color
				button_content.css("color", color)
			}
			
			// user can customize button icon and text color
			this.customize = function()
			{
				// for every subtype
				for (var subtype in this._)
				{
					// if this button belongs to a subtype
					if (button.attr("subtype") !== subtype)
						continue
					
					// set text color
					this.customize_text_color(this._[subtype])
					// set icon
					this.customize_icon(this._[subtype])
					
					// set 'on push' action
					this.additional_options.action = this._[subtype].action
					this.additional_options.delay = this._[subtype].delay
					
					// exit
					return
				}
			}
		
			this.customize_text_color = function(options)
			{
				// check text color
				var text_color = options["text color"]
				
				if (!text_color)
						return
					
				// set text color for ready button
				if (text_color.ready) 
					this.button_ready_content.css("color", text_color.ready)
	
				// set text color for pushed button
				if (text_color.pushed) 
					this.button_pushed_content.css("color", text_color.pushed)
			}
				
			this.customize_icon = function(options)
			{
				// check icon
				this.icon = options["icon"]
				
				if (!this.icon)
					return
					
				// apply options
				this.floating = safely_get(options["floating"], "left")
				this.top_offset = safely_get(options["top offset"], 0)
				this.spacing = safely_get(options["spacing"], default_icon_spacing)
				
				// add the icon to button
				this.add_icon($(":first", this.button_content))
				this.add_icon($(":first", this.button_ready_content), ready_image_postfix)
				this.add_icon($(":first", this.button_pushed_content), pushed_image_postfix)
			}
			
			this.add_icon = function(element, postfix)
			{
				// check postfix
				if (!postfix)
					postfix = ""
			
				// set icon margin type
				var margin_type
				
				if (this.floating == "right")
					margin_type = "left"
				else
					margin_type = "right"
			
				// generate icon code
				var code = 
				"<span " + 
					"style='" +
						"display: block; float: " + this.floating + ";'>" + 
					"<img " + 
						"style='" + 
							"padding-top: " + this.top_offset + "px; " + 
							"margin-" + margin_type + ": " + this.spacing + "px;'  " + 
						"src='" + this.images_path + "/icon/" + this.icon + "/" + this.icon + postfix + "." + image_format + "'" + 
					"/>" + 
				"</span>"
				
				// place the icon on the page
				if (this.floating == "right")
					element.append(code)
				else
					element.prepend(code)
			}
*/