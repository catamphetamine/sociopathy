var Page_available_actions = new Class
({
	Binds: ['show'],
	
	actions: [],
	
	add: function(title, action, options)
	{
		options = options || {}
		
		this.actions.add({ title: title, action: action, options: options })
		
		if (options.действие)
			page.hotkey('Действия.' + options.действие, action)
	},
	
	show: function()
	{
		this.available_actions_list.open()
	},
	
	is_empty: function()
	{
		return this.actions.пусто()
	},
	
	destroy: function()
	{
		if (this.is_empty())
			return
		
		if (this.available_actions_list)
			this.available_actions_list.destroy()
	},
	
	each: function(method)
	{
		this.actions.for_each(method)
	}
})

Page.implement
({
	create_actions_list: function()
	{
		if (this.Available_actions.is_empty())
		{
			return this.hotkey('Показать_действия', function()
			{
				info(text('page.no available actions'))
			})
		}
		
		var actions_list_window = $('<div/>')
			.addClass('available_actions')
			.attr('title', text('page.available actions'))
			
		var actions_list = $('<ul/>').appendTo(actions_list_window)
		
		var dialog_window
		
		this.Available_actions.each(function()
		{
			var action = this.action
			var options = this.options
			
			var button = $('<div/>')
				.text(this.title)
			
			if (options.type)
				button.attr('type', options.type)
				
			if (options.styles)
				button.attr('styles', options.styles)
				
			$('<li/>').append(button).appendTo(actions_list)
			
			new text_button(button).does(function()
			{
				if (options.immediate_transition_between_dialog_windows)
				{
					var dialog_window_options =
					{
						immediately: true,
						leave_modal: true
					}
					
					action(dialog_window_options)
					dialog_window.close(dialog_window_options)
					return
				}
				
				dialog_window.close(action)
			})
		})
		
		dialog_window = actions_list_window.dialog_window
		({
			'close on escape': true
		})
		
		dialog_window.content.disableTextSelect()
		
		this.Available_actions.available_actions_list = dialog_window
		
		this.hotkey('Показать_действия', function()
		{
			page.Available_actions.show()
		})
	}
})