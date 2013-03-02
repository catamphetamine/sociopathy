(function()
{
	var results_viewer =
	{
		initialize: function()
		{
			this.results = $('<ul/>')
			this.results.fade_out(0)
			
			this.results.appendTo(this.container)
			
			this.selected = $('<div/>')
			this.selected.addClass('selected')
			
			this.selected.appendTo(this.container)
			
			this.show = results_viewer.show.bind(this)
			this.hide = results_viewer.hide.bind(this)
			this.highlight = results_viewer.highlight.bind(this)
			this.highlight_previous = results_viewer.highlight_previous.bind(this)
			this.highlight_next = results_viewer.highlight_next.bind(this)
			this.append_match = results_viewer.append_match.bind(this)
		},
		
		reset: function()
		{
			this.results.empty()
			this.hide()
		},
		
		hide: function()
		{
			if (!this.results_shown)
				return
			
			this.results.fade_out(0.1)
			this.results_shown = false
		},
		
		show: function()
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
		
		value: function()
		{
			var selected_result = $('<div/>').addClass('selected_result')
			this.options.decorate.bind(selected_result)(this.find_result_data_by_value())
			
			this.selected
				.disableTextSelect()
				.append(selected_result)
			
			if (this.options.hide_input_after_selection)
			{
				this.input.hide()
				this.selected.show()
			}
		},
		
		highlight: function(element)
		{
			this.results.find('> .highlighted').removeClass('highlighted')
			
			if (element)
				element.addClass('highlighted')
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
		
		append_match: function(match)
		{
			var element = $('<li/>')
			this.options.decorate.bind(element)(match)
			element.disableTextSelect()
			
			element.data('data', match)
			
			element.on('click', (function()
			{
				this.set_value(this.options.value(element.data('data')))
				this.hide()
			})
			.bind(this))
			
			element.on('mousedown', (function()
			{
				this.focus.bind(this).delay(1)
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
		
		display: function(results_list)
		{
			this.results.empty()
			
			this.results_list = results_list
			
			if (this.results_list.is_empty())
			{
				this.hide()
			}
			else
			{
				this.results_list.forEach(this.append_match)
				this.show()
				
				this.data = {}
				this.results_list.forEach((function(match)
				{
					this.data[this.options.value(match)] = match
				})
				.bind(this))
			}
		},
		
		blur: function()
		{
			this.hide()
		},
		
		focus: function()
		{
			if (!this.value)
				this.show()
		},
		
		input: function()
		{
			this.hide()
		},
		
		enter: function(event)
		{
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
		},
		
		up: function()
		{
			this.highlight_previous()
		},
		
		down: function()
		{
			this.highlight_next()
		}
	}
	
	var Autocomplete = new Class
	({
		Implements: [Options],
		Binds: ['on_focus', 'on_blur', 'on_key_down', 'on_input'],
		
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
			},
			required: true,
			results_viewer: results_viewer
		},
		
		initialize: function(container, options)
		{
			this.setOptions(options)
			
			this.container = container
				.addClass('autocomplete')
		
			this.selected_value = $('<input/>')
				.attr('type', 'hidden')
				.appendTo(this.container)
			
			this.input = $('<input/>')
				.attr('type', 'text')
				.addClass('field')
				.appendTo(this.container)
			
				.on('focus', this.on_focus)
				.on('blur', this.on_blur)
				.on('keydown', this.on_key_down)
			
			this.results_viewer('initialize')
		},
		
		results_viewer: function(action, argument)
		{
			if (!this.options.results_viewer[action])
				return
			
			this.options.results_viewer[action].bind(this)(argument)
		},
		
		invalid: function()
		{
			this.container.addClass('invalid')
		},
		
		valid: function()
		{
			this.container.removeClass('invalid')
		},
		
		reset: function()
		{
			this.set_value(null)
			
			this.results_viewer('reset')
		},
		
		selection_data: function()
		{
			return this.data[this.value]
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
				
			this.valid()
			
			this.input.val(this.options.title(this.find_result_data_by_value()))
			this.input.focus()
			
			this.results_viewer('value')
			
			if (this.options.choice)
				this.options.choice.bind(this.find_result_data_by_value())(this.value)
		},
		
		display_results: function(results_list)
		{
			if (results_list.is_empty())
			{
				if (this.options.required)
					this.invalid()
			}
			else
				this.valid()
			
			this.results_viewer('display', results_list)
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
			this.results_viewer('blur')
			
			if (!this.value)
				if (this.options.required)
					this.invalid()
		},
		
		on_focus: function()
		{
			this.results_viewer('focus')
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
				this.valid()
				this.results_viewer('input')
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
				
				return this.results_viewer('enter', event)
			}
			
			// up arrow
			if (event.which === Клавиши.Up)
			{
				event.preventDefault()
				
				if (this.results.is_empty())
					return
				
				return this.results_viewer('up')
			}
			
			// down arrow
			if (event.which === Клавиши.Down)
			{
				event.preventDefault()
				
				if (this.results.is_empty())
					return
				
				return this.results_viewer('down')
			}
			
			// character entered
			
			this.set_value(null)
			
			this.on_input.delay(1)
		},
		
		focus: function()
		{
			this.input.focus()
		}
	})
	
	$.fn.autocomplete = function(options)
	{
		return new Autocomplete(this, options)
	}
})()