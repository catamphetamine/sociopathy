$.fn.autocomplete = function(options)
{
	options = Object.merge
	({
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
	options)
	
	var container = this
	this.addClass('autocomplete')
	
	var selected = $('<div/>')
	selected.addClass('selected')
	
	selected.appendTo(container)

	var selected_value = $('<input/>')
	selected_value.attr('type', 'hidden')
	
	selected_value.appendTo(container)
	
	var input = $('<input/>')
	input.attr('type', 'text')
	input.addClass('field')
	
	input.appendTo(container)
	
	var results = $('<ul/>')
	
	results.fade_out(0)
	
	var results_shown = false
	
	results.appendTo(container)
	
	function hide_results()
	{
		if (!results_shown)
			return
		
		results.fade_out(0.1)
		results_shown = false
	}
	
	function show_results()
	{
		if (results_shown)
			return
		
		if (results.is_empty())
			return
		
		results_shown = true
		
		highlight()
		
		results.fade_in(0.2)
	}
	
	var value
	
	var results_list
	
	function find_result_data_by_value()
	{
		var result_data
		
		results_list.for_each(function()
		{
			if (options.value(this) === value)
				result_data = this
		})
		
		return result_data
	}
	
	function set_value(val)
	{
		if (!val)
		{
			value = null
			selected_value.val(value)
		
			selected.empty()
			return
		}
		
		value = val
		selected_value.val(value)
			
		container.removeClass('invalid')
		
		input.val(options.title(find_result_data_by_value()))
		input.focus()
		
		var selected_result = $('<div/>')
		options.decorate.bind(selected_result)(this)
		
		selected.append(selected_result)
	}
	
	function highlight(element)
	{
		results.find('> .highlighted').removeClass('highlighted')
		
		if (element)
			element.addClass('highlighted')
	}
	
	function display_results(found_results_list)
	{
		if (found_results_list.is_empty())
			container.addClass('invalid')
		else
			container.removeClass('invalid')
		
		results_list = found_results_list
		
		results.empty()
		
		results_list.for_each(function()
		{
			var element = $('<li/>')
			options.decorate.bind(element)(this)
			element.data('data', this)
			
			element.on('click', function()
			{
				set_value(options.value(element.data('data')))
				hide_results()
			})
			
			element.on('mouseenter', function()
			{
				highlight(element)
			})
			
			if (results_list.length === 1)
				highlight(element)
			
			element.appendTo(results)
		})
		
		if (results_list.is_empty())
			hide_results()
		else
			show_results()
	}
	
	input.on('blur', function(event)
	{
		hide_results()
		
		if (!value)
			container.addClass('invalid')
	})
	
	input.on('focus', function(event)
	{
		if (!value)
			show_results()
	})
	
	//var previous_query
		
	var search
		
	input.on('keydown', function(event)
	{
		switch (event.which)
		{
			case Клавиши.Shift:
			case Клавиши.Alt:
			case Клавиши.Ctrl:
			case Клавиши.Left:
			case Клавиши.Right:
			case Клавиши.End:
			case Клавиши.Home:
				return
		}
		
		// enter
		if (event.which === Клавиши.Enter)
		{
			if (value)
				return
			
			var highlighted = results.find('> .highlighted')
			
			if (highlighted.exists())
			{
				highlighted.trigger('click')
				
				event.preventDefault()
				event.stopImmediatePropagation()
				
				return
			}
		}
		
		// up arrow
		if (event.which === Клавиши.Up)
		{
			event.preventDefault()
			
			var the_results = results.children()
			
			if (the_results.is_empty())
				return
			
			var i = 0
			while (i < the_results.length)
			{
				var element = $(the_results[i])
				if (element.hasClass('highlighted'))
				{
					element.removeClass('highlighted')
					
					if (i - 1 >= 0)
					{
						$(the_results[i - 1]).addClass('highlighted')
					}
					else
					{
						$(the_results.last()).addClass('highlighted')
					}
					
					return
				}
				
				i++
			}
			
			return $(the_results.last()).addClass('highlighted')
		}
		
		// down arrow
		if (event.which === Клавиши.Down)
		{
			event.preventDefault()
			
			var the_results = results.children()
			
			if (the_results.is_empty())
				return
			
			var i = 0
			while (i < the_results.length)
			{
				var element = $(the_results[i])
				if (element.hasClass('highlighted'))
				{
					element.removeClass('highlighted')
					
					if (i + 1 < the_results.length)
					{
						$(the_results[i + 1]).addClass('highlighted')
					}
					else
					{
						$(the_results.first()).addClass('highlighted')
					}
					
					return
				}
				
				i++
			}
			
			return $(the_results.first()).addClass('highlighted')
		}
		
		set_value(null)
		
		;(function()
		{
			var query = input.val()				

			//if (previous_query === query)
			//	return
			
			//previous_query = query
			
			if (search)
				search.cancel()
					
			if (query.length >= options.mininum_query_length)
			{
				var cancelled = false
					
				var display_search_results = function(data)
				{
					if (cancelled)
						return
					
					display_results(data)
				}
				
				search = options.search(input.val(), display_search_results)
				
				var cancel = search.cancel
				search.cancel = function()
				{
					cancelled = true
					
					cancel.bind(search)()
				}
			}
			else
			{	
				container.removeClass('invalid')
				hide_results()
			}
		})
		.delay(1)
	})
}