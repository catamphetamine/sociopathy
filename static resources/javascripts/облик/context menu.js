var Context_menu = new Class
({
	Implements: [Options],
	
	options: {},
	
	initialize: function(element, options)
	{
		this.element = element
		
		this.setOptions(options)
			
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
				item.action(this.data || this)
				
				this.menu.fade_out(0.2)
			})
			.bind(this))
			
			element.appendTo(this.menu.list)
		})
		.bind(this))
		
		this.menu.addClass('popup_panel_container')
		this.menu.list.addClass('popup_panel')
		
		this.menu.hide().appendTo('body')
			
		element.on('contextmenu.context_menu', (function(event)
		{
			event.preventDefault()
			
			this.menu.fade_in(0.2)
			this.menu.move_to
			({
				left: event.pageX,
				top: event.pageY
			})
		})
		.bind(this))
		
		$('body').on('mousedown.context_menu', (function()
		{
			this.menu.hide()
		})
		.bind(this))
	},
	
	destroy: function()
	{
		this.element.unbind('.context_menu')
		$('body').unbind('.context_menu')
		this.menu.remove()
	}
})

$.fn.context_menu = function()
{
}