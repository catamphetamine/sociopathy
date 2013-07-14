var Context_menu = new Class
({
	Implements: [Options],
	
	options: {},
	
	namespace: '.' + $.unique_namespace(),
	
	initialize: function(element, options)
	{
		this.element = element
		
		if (options instanceof Array)
		{
			options = { items: options }
		}
		else if (!options.items)
		{
			var items = []
			
			Object.for_each(options, function(key, value)
			{
				items.push({ title: key, action: value })
			})
			
			options = { items: items }
		}
		
		this.setOptions(options)
		
		if (!this.options.selectable_element)
			this.options.selectable_element = element
			
		this.menu = $('<div/>').addClass('context_menu')
		this.menu.list = $('<ul/>').appendTo(this.menu)
		
		this.options.items.forEach((function(item)
		{
			var element = $('<li/>').text(item.title)
		
			element.disableTextSelect()
			
			element.on('mousedown', function(event)
			{
				event.stopPropagation()
			})
			
			element.on('click', (function(event)
			{
				item.action.bind(this)(this.data)
				
				this.menu.fade_out(0.2)
				
				this.options.selectable_element.removeClass('selected')
			})
			.bind(this))
			
			element.appendTo(this.menu.list)
		})
		.bind(this))
		
		this.menu.addClass('popup_panel_container')
		this.menu.list.addClass('popup_panel')
		
		this.menu.hide().appendTo('body')
		
		var width = this.menu.outerWidth()
		var height = this.menu.outerHeight()
		
		var screen_width = $(window).width()
		var screen_height = $(window).height()
		
		element.on('contextmenu' + this.namespace, (function(event)
		{
			event.preventDefault()
			
			var left = event.pageX
			var top = event.pageY
			
			if (left + width > screen_width)
				left = left - width
			
			if (top + height > screen_height)
				top = top - height
			
			this.menu.move_to
			({
				left: left,
				top: top
			})
			
			this.menu.fade_in(0.2)
			
			this.options.selectable_element.addClass('selected')
			
			$('body').on('mousedown' + this.namespace, (function()
			{
				this.menu.hide()
			
				this.options.selectable_element.removeClass('selected')
				
				$('body').unbind('mousedown' + this.namespace)
			})
			.bind(this))
		})
		.bind(this))
	},
	
	destroy: function()
	{
		this.element.unbind(this.namespace)
		this.options.selectable_element.removeClass('selected')
		$('body').unbind(this.namespace)
		this.menu.remove()
	}
})

$.fn.context_menu = function(options)
{
	if (this.data('context_menu'))
		this.data('context_menu').destroy()
	
	var menu = new Context_menu(this, options)
	this.data('context_menu', menu)
	
	Режим.data('context_menus', menu, { add: true })
	
	return menu
}