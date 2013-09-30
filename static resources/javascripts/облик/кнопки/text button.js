var text_button = new Class
({
	Extends: button,
	
	Implements: [Options],
	
	options:
	{
		physics: 'immediate',
		type: 'generic'
	},
	
	initialize: function(selector_or_element, options)
	{
		this.setOptions(options)
		
		var element
		
		if (typeof selector_or_element === 'string')
		{
			var selector = selector_or_element
		
			element = $(selector)
			this.options.selector = selector
		}
		else
			element = selector_or_element

		if (!element.attr('type'))
			element.attr('type', this.options.type)
		
		element.css
		({
			'display': 'inline-block'
		})
		
		this.parent(element, this.options)
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