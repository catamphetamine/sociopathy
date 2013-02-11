/**
 * Text Button
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 *
 * Usage:
 *
 * var add_book = text_button.new($('.main_content .add_book')).does(function() { alert('test') })
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
	
	initialize: function(selector_or_element, options)
	{
		var element = button.get_element(selector_or_element)
		
		element.css
		({
			'display': 'inline-block'
		})
		
		button.physics.classic(this)
		
		this.parent(element, $.extend({}, this.default_options, options))		
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
			return ['generic']
			
		return styles.split(', ')
	},
	
	clone_content: function()
	{
		return $(this.content)
	}
	.protect(),
	
	build_idle_frame: function()
	{
		this.$element.wrapInner('<div/>')
		
		this.$element.css
		({
			'min-height': this.skin.height + 'px',
			'max-height': this.skin.height + 'px',
		})
		
		var idle_frame = this.$element.find(':first')
		
		this.options.styles.each(function(style_name)
		{
			idle_frame.addClass(style_name + '_button')			
			idle_frame.addClass(style_name + '_button_idle')			
		},
		this)

		// style left part

		var left_part = $('<div/>')
		
		left_part.css
		({
			'display': 'inline-block',
			'vertical-align': 'top',
			
			'min-height': this.skin.height + 'px',
			'max-height': this.skin.height + 'px',

			'width': this.skin['side bar size'] + 'px',
			
			'background_position_x': 'left',
			'background_position_y': 'top',
			'background-image': this.get_image_path('left'),
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
		})

		// style content
		
		idle_frame.wrapInner('<div/>')
		var middle_part = idle_frame.find(':first')
	
		middle_part.css
		({
			'display': 'inline-block',
			'vertical-align': 'top',
			
			'min-height': this.skin.height + 'px',
			'max-height': this.skin.height + 'px',
			
			'background_position_x': 'left',
			'background_position_y': 'top',
			'background-image': this.get_image_path('middle'),
			'background-color': 'transparent',
			'background-repeat': 'repeat-x',
		})
	
		middle_part.wrapInner('<div/>')
		var content = middle_part.find(':first')
		content.addClass('button_contents')

		if (this.options.icon)
			this.add_icon(content)
			
		//content.appendTo(middle_part)
		
		// style right part

		var right_part = $('<div/>')
		
		right_part.css
		({
			'display': 'inline-block',
			'vertical-align': 'top',
			
			'min-height': this.skin.height + 'px',
			'max-height': this.skin.height + 'px',

			'width': this.skin['side bar size'] + 'px',

			'background_position_x': 'right',
			'background_position_y': 'top',
			'background-image': this.get_image_path('right'),
			'background-color': 'transparent',
			'background-repeat': 'no-repeat',
			
			/*
			// causes a strange bug - an empty pixel stripe before the right side
			'-moz-transform': 'scaleX(-1)',
			'-o-transform': 'scaleX(-1)',
			'-webkit-transform': 'scaleX(-1)',
			'transform': 'scaleX(-1)'
			*/
		})
		
		// (does not) fix a strange bug - an empty pixel stripe before the right side
		//right_part.width(right_part.width() - 1)

		idle_frame.prepend(left_part).append(right_part)

		// for ready and pushed frames		
		this.$element.css
		({
			'position': 'relative',
			'white-space': 'nowrap'
		})
		
		this.$element.disableTextSelect()
		
		this.content = idle_frame.html()
		
		return idle_frame
		//return this.$element
	},
	
	build_ready_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button')			
			 styles.push(style_name + '_button_ready')			
		})

		return this.build_hidden_frame({ styles: styles, 'image index': 2 })
	},
	
	build_pushed_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button')			
			 styles.push(style_name + '_button_pushed')			
		})

		return this.build_hidden_frame({ styles: styles, 'image index': 3 })
	},
	
	build_hidden_frame: function(options)
	{
		var $frame = $('<div></div>')
		
		options.styles.each(function(style_name)
		{
			$frame.addClass(style_name)			
		})

		var $content = this.clone_content()
		$frame.append($content)
	
		var $left_part = $frame.find(':first')
		//$left_part.css('background_position_x', 'left')
		$left_part.css('background_position_y', "-" + this.skin.height * (options['image index'] - 1) + "px")
	
		var $middle_part = $frame.children().eq(1)
		//$left_part.css('background_position_x', 'left')
		$middle_part.css('background_position_y', "-" + this.skin.height * (options['image index'] - 1) + "px")
	
		var $right_part = $frame.find(':last')
		//$left_part.css('background_position_x', 'left')
		$right_part.css('background_position_y', "-" + this.skin.height * (options['image index'] - 1) + "px")

		$frame.css
		({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'display': 'none',
			'opacity': 0
		})
		
		// adjust the icon image
		$content.find('.button_icon').css('background_position_y', '-' + this.options.icon.height * (options['image index'] - 1) + 'px')

		// result		
		this.$element.append($frame)
		return $frame
	},

	get_image_path: function(image_name)
	{
		return "url('" + this.skin.path + "/" + this.options["button type"] + "/" + image_name + "." + this.skin['image format'] + "')"
	}
	.protect(),
	
	get_icon_path: function(icon_name)
	{
		return "url('" + this.skin.path + "/icon/" + icon_name + "." + this.skin['image format'] + "')"
	}
	.protect(),
	
	add_icon: function($element)
	{
		if (!this.options.icon.name)
			return
			
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

text_button['new'] = function(selector, options)
{
	var element = $(selector)

	options = options || {}
	options.selector = selector

	if (!options.physics)
		options.physics = 'classic'
		
	if (element.attr('dark'))
		element.data('button_type', 'dark generic')
	else
		element.data('button_type', 'generic')
			
	return button.physics[options.physics](new text_button
	(
		element,
		Object.append
		(
			{
				skin: 'sociopathy',
				
				// miscellaneous
				'button type':  element.attr('type') || element.data('button_type'), // || 'generic',
			},
			options
		)
	))
}