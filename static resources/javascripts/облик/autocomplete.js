(function()
{
	var Autocomplete = new Class
	({
		Implements: [Options],
		Binds: ['on_focus', 'on_blur', 'on_key_down', 'on_input', 'append_match'],
		
		options:
		{
			mininum_query_length: 3,
			search: function(query, callback)
			{
				var timer = (function()
				{
					timer = null
					callback(['abc', 'def', 'ghi', '123'])
				})
				.delay(100)
				
				var search =
				{
					cancel: function()
					{
						if (timer)
							clearTimeout(timer)
					}
				}
				
				return search
			},
			decorate: function(data)
			{
				this.text(data)
			},
			value: function(data)
			{
				return data + ''
			},
			title: function(data)
			{
				return data
			}
		},
		
		initialize: function(container, options)
		{
			this.container = container
			this.setOptions(options)
			
			this.container.addClass('autocomplete')
			
			this.selected = $('<div/>')
			this.selected.addClass('selected')
			
			this.selected.appendTo(this.container)
		
			this.selected_value = $('<input/>')
			this.selected_value.attr('type', 'hidden')
			
			this.selected_value.appendTo(this.container)
			
			this.input = $('<input/>')
			this.input.attr('type', 'text')
			this.input.addClass('field')
			
			this.input.appendTo(this.container)
			
			this.results = $('<ul/>')
			this.results.fade_out(0)
			
			this.results.appendTo(this.container)
			
			this.input.on('focus', this.on_focus)
			this.input.on('blur', this.on_blur)
			this.input.on('keydown', this.on_key_down)
		},
		
		reset: function()
		{
			this.set_value(null)
			this.results.empty()
			this.hide_results()
		},
		
		selection_data: function()
		{
			return this.data[this.value]
		},
		
		hide_results: function()
		{
			if (!this.results_shown)
				return
			
			this.results.fade_out(0.1)
			this.results_shown = false
		},
		
		show_results: function()
		{
			if (this.results_shown)
				return
			
			if (this.results.is_empty())
				return
			
			this.results_shown = true
			
			if (this.results_list.length > 1)
				this.highlight()
			
			this.results.fade_in(0.2)
		},
		
		find_result_data_by_value: function()
		{
			var result_data
			
			var autocomplete = this
			
			this.results_list.for_each(function()
			{
				if (autocomplete.options.value(this) === autocomplete.value)
					result_data = this
			})
			
			return result_data
		},
		
		set_value: function(value)
		{
			if (!value)
			{
				this.value = null
				this.selected_value.val(this.value)
			
				this.selected.empty()
				return
			}
			
			this.value = value
			this.selected_value.val(this.value)
				
			this.container.removeClass('invalid')
			
			this.input.val(this.options.title(this.find_result_data_by_value()))
			this.input.focus()
			
			var selected_result = $('<div/>').addClass('selected_result')
			this.options.decorate.bind(selected_result)(this.find_result_data_by_value())
			
			this.selected.append(selected_result)
			
			if (this.options.hide_input_after_selection)
			{
				this.input.hide()
				this.selected.show()
			}
			
			if (this.options.choice)
				this.options.choice(this.value)
		},
		
		highlight: function(element)
		{
			this.results.find('> .highlighted').removeClass('highlighted')
			
			if (element)
				element.addClass('highlighted')
		},
		
		append_match: function(match)
		{
			var element = $('<li/>')
			this.options.decorate.bind(element)(match)
			element.data('data', match)
			
			element.on('click', (function()
			{
				this.set_value(this.options.value(element.data('data')))
				this.hide_results()
			})
			.bind(this))
			
			element.on('mouseenter', (function()
			{
				this.highlight(element)
			})
			.bind(this))
			
			if (this.results_list.length === 1)
				this.highlight(element)
			
			element.appendTo(this.results)
		},
		
		display_results: function(results_list)
		{
			if (results_list.is_empty())
				this.container.addClass('invalid')
			else
				this.container.removeClass('invalid')
			
			this.results.empty()
			
			this.results_list = results_list
			
			if (this.results_list.is_empty())
			{
				this.hide_results()
			}
			else
			{
				this.results_list.forEach(this.append_match)
				this.show_results()
				
				this.data = {}
				this.results_list.forEach((function(match)
				{
					this.data[this.options.value(match)] = match
				})
				.bind(this))
			}
		},
		
		highlight_previous: function()
		{
			var results = this.results.children()
			
			var i = 0
			while (i < results.length)
			{
				var element = $(results[i])
				if (element.hasClass('highlighted'))
				{
					element.removeClass('highlighted')
					
					if (i - 1 >= 0)
					{
						$(results[i - 1]).addClass('highlighted')
					}
					else
					{
						$(results.last()).addClass('highlighted')
					}
					
					return
				}
				
				i++
			}
			
			$(results.last()).addClass('highlighted')
		},
		
		highlight_next: function()
		{
			var results = this.results.children()
			
			var i = 0
			while (i < results.length)
			{
				var element = $(results[i])
				if (element.hasClass('highlighted'))
				{
					element.removeClass('highlighted')
					
					if (i + 1 < results.length)
					{
						$(results[i + 1]).addClass('highlighted')
					}
					else
					{
						$(results.first()).addClass('highlighted')
					}
					
					return
				}
				
				i++
			}
			
			$(results.first()).addClass('highlighted')
		},
		
		perform_search: function(query)
		{
			var cancelled = false
					
			var display_search_results = (function(data)
			{
				if (cancelled)
					return
				
				this.display_results(data)
			})
			.bind(this)
			
			var search = this.options.search(this.input.val(), display_search_results)
			
			var cancel = search.cancel
			search.cancel = function()
			{
				cancelled = true
				
				cancel.bind(search)()
			}
			
			return search
		},
		
		on_blur: function()
		{
			this.hide_results()
			
			if (!this.value)
				this.container.addClass('invalid')
		},
		
		on_focus: function()
		{
			if (!this.value)
				this.show_results()
		},
		
		on_input: function()
		{
			var query = this.input.val()
			
			if (this.search)
				this.search.cancel()
					
			if (query.length >= this.options.mininum_query_length)
			{
				this.search = this.perform_search(query)
			}
			else
			{	
				this.container.removeClass('invalid')
				this.hide_results()
			}
		},
		
		on_key_down: function(event)
		{
			// ignore irrelevant keys
			switch (event.which)
			{
				case Клавиши.Shift:
				case Клавиши.Alt:
				case Клавиши.Ctrl:
				case Клавиши.Left:
				case Клавиши.Right:
				case Клавиши.End:
				case Клавиши.Home:
				case Клавиши.Tab:
					return
			}
			
			// enter
			if (event.which === Клавиши.Enter)
			{
				if (this.value)
					return
				
				var highlighted = this.results.find('> .highlighted')
				
				if (highlighted.exists())
				{
					highlighted.trigger('click')
				
					event.preventDefault()
					event.stopImmediatePropagation()
					
					return
				}
				
				if (this.results_list.length === 1)
				{
					$(this.results.children()[0]).click()
					return
				}
				else
				{
					event.preventDefault()
					event.stopImmediatePropagation()
				
					return
				}
			}
			
			// up arrow
			if (event.which === Клавиши.Up)
			{
				event.preventDefault()
				
				if (this.results.is_empty())
					return
				
				return this.highlight_previous()
			}
			
			// down arrow
			if (event.which === Клавиши.Down)
			{
				event.preventDefault()
				
				if (this.results.is_empty())
					return
				
				return this.highlight_next()
			}
			
			// character entered
			
			this.set_value(null)
			
			this.on_input.delay(1)
		}
	})
	
	$.fn.autocomplete = function(options)
	{
		return new Autocomplete(this, options)
	}
})()