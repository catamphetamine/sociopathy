/**
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var category_button = new Class
({
	Extends: button,
	
	initialize: function(id_or_element, options)
	{
		var element = get_element(id_or_element)
		
		this.parent(id_or_element, options)
	},
	
	build_idle_frame: function()
	{
		this.$element.css
		({
			position: 'relative',
			left: 0,
			top: 0
		})
		
		return this.$element
	},
	
	build_ready_frame: function()
	{
		var $frame = this.$element.find('> a:first').clone()

		$frame.css
		({
			'background-image': 'none',
			//'background-color': 'white'
		})
		
		$frame.addClass('hidden_button_frame frame')
		$frame.data('maximum opacity', 0.3)
		
		$frame.find('> span').css
		({
			opacity: 1,
			color: 'black',
			'background-color': '#ff0096'
		})

		this.$element.append($frame)
		return $frame
	},
	
	build_pushed_frame: function()
	{
		var $frame = this.$element.find('> a:first').clone()

		$frame.css
		({
			'background-image': 'none',
			'background-color': 'white'
		})
		
		$frame.addClass('hidden_button_frame frame')
		$frame.data('maximum opacity', 0.8)
		
		$frame.find('> span').css
		({
			opacity: 1,
			'background-color': 'transparent'
		})

		this.$element.append($frame)
		return $frame
	}
})
