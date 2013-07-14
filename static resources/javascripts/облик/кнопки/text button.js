var text_button = new Class
({
	Extends: button,
	
	default_options:
	{
	},
	
	initialize: function(selector_or_element, options)
	{
		var element = button.get_element(selector_or_element)
		
		element.css
		({
			'display': 'inline-block'
		})
		
		element.attr('type', options['button type'])
		
		this.parent(element, $.extend({}, this.default_options, options))		
	},
	
	prepare: function()
	{
		// set button styles
		this.options.styles = this.get_styles()
	},
	
	get_styles: function()
	{
		var styles = this.$element.attr('styles')
		
		if (!styles)
			return ['generic']
			
		return styles.split(', ')
	},
	
	build_idle_frame: function()
	{
		this.$element.wrapInner('<div/>')
		
		var idle_frame = this.$element.find(':first')
		
		this.options.styles.each(function(style_name)
		{
			idle_frame.addClass(style_name + '_button')			
			idle_frame.addClass(style_name + '_button_idle')			
		},
		this)

		// for ready and pushed frames		
		this.$element.css
		({
			'position': 'relative',
			'white-space': 'nowrap'
		})
		
		this.$element.disableTextSelect()
		
		this.content = idle_frame.html()
		
		return idle_frame
	},
	
	build_ready_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button')			
			 styles.push(style_name + '_button_ready')			
		})

		return this.build_hidden_frame({ styles: styles })
	},
	
	build_pushed_frame: function()
	{
		var styles = []
		
		this.options.styles.each(function(style_name)
		{
			 styles.push(style_name + '_button')			
			 styles.push(style_name + '_button_pushed')			
		})

		return this.build_hidden_frame({ styles: styles })
	},
	
	build_hidden_frame: function(options)
	{
		var $frame = $('<div></div>')
		
		options.styles.each(function(style_name)
		{
			$frame.addClass(style_name)			
		})

		var $content = $('<div/>')
		$frame.append($content)
	
		$frame.css
		({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'display': 'none',
			'opacity': 0
		})
		
		// result
		this.$element.append($frame)
		return $frame
	}
})

text_button['new'] = function(selector, options)
{
	var element = $(selector)

	options = options || {}
	options.selector = selector

	if (!options.physics)
		options.physics = 'immediate'
	
	element.data('button_type', 'generic')
	
	return button.physics[options.physics](new text_button
	(
		element,
		Object.append
		(
			{
				// miscellaneous
				'button type':  element.attr('type') || element.data('button_type'),
			},
			options
		)
	))
}