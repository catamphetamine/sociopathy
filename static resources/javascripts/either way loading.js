function either_way_loading(options)
{
	parameters = options.data.parameters || {}
		
	var overall_count
	var skipped
	
	var progress_bar
	
	function set_page_number(number)
	{
		if (number > 1)
			set_url(options.путь + '/' + number)
		else 
			set_url(options.путь)
	}
	
	var skip_pages = (options.страница || 1) - 1
	
	var loader_markup = $.tmpl('either way loading', {})
	
	options.container = page.get(options.container)
	
	options.container.before(loader_markup)
	
	var ok_block = page.get('.main_conditional > [type=ok]')
	
	ok_block.find('> [type="placeholder"]').replaceWith(options.container)
	
	var previous_block = page.get('.previous_conditional')
	
	var main_conditional = initialize_conditional(page.get('.main_conditional'))
	var previous_conditional = initialize_conditional(previous_block)
	
	previous_block.prependTo(ok_block)

	page.get('[type="error"], [type="loading_more_error"]').text(options.error || "Во время загрузки данных произошла ошибка")
	
	// common

	var first_batch = true
	var first_output = true

	var top_loader
	var bottom_loader
	
	var on_data = function(data)
	{
		if (first_batch)
		{
			if (!overall_count)
				overall_count = data.всего
			
			if (!skipped && data.пропущено)
			{
				skipped = data.пропущено
				
				top_loader.set_skipped_before(skipped)
				bottom_loader.set_skipped_before(skipped)
			}
				
			if (options.data.on_first_batch)
				options.data.on_first_batch(data)

			first_batch = false
		}
		
		data = data[options.data.name]
			
		if (options.data.loaded)
		{
			var altered_data = options.data.loaded(data)
			if (typeof altered_data !== 'undefined')
				data = altered_data
		}
		
		return data
	}
	
	var common_loader_options =
	{
		url: options.data.url,
		latest_first: options.data.latest_first,
		batch_size: options.data.batch_size,
		editable: options.editable,
		before_output_async: options.data.before_output_async
	}
	
	var after_output = function(elements)
	{
		if (options.data.after_output)
			options.data.after_output(elements)
	}

	// загрузчик вверху
	
	function container_height()
	{
		return options.container.outerHeight(true)
	}
	
	var previous_link = previous_block.find('.previous > a')
	
	top_loader = new Batch_loader(Object.x_over_y(common_loader_options,
	{
		skip_pages: skip_pages + 1,
		reverse: true,
		parameters: Object.x_over_y(parameters, { раньше: true, всего: overall_count }),
		get_data: function (data)
		{
			data = on_data(data)
			
			if (data.is_empty())
				return []
			
			data.last().страница = this.page.number - 1
			data.last().первый = true
			
			return data
		},
		before_output: function(elements)
		{
			if (options.data.before_output)
				options.data.before_output(elements)
				
			page.data.container_height_before_loaded_previous = container_height()
		},
		done_more: function()
		{
			прокрутчик.scroll_by(container_height() - page.data.container_height_before_loaded_previous)
			
			if (options.progress_bar)
				update_progress_bar({ skipped: this.skipped() })
				
			ajaxify_internal_links(page.content)
			
			if (this.есть_ли_ещё)
				previous_link.fade_in(0.2)
		},
		after_output: after_output,
		finished: function()
		{
			previous_link.hide()
		}
	}))
	
	function activate_page_scrolling(data, element)
	{
		if (!data.первый)
			return
		
		element.on('appears_on_bottom.scroller', function(event)
		{
			set_page_number(data.страница)
			event.stopPropagation()
		})
		
		element.on('disappears_on_bottom.scroller', function(event)
		{
			set_page_number(data.страница - 1)
			event.stopPropagation()
		})
	}
	
	function disabled()
	{
		if (options.editable)
			if (!Режим.обычный_ли())
				return true
	}

	function show_previous(event)
	{
		event.preventDefault()
		
		if (disabled())
			return info(text('loader.either way.can\'t load more while in edit mode'))
	
		top_loader.deactivate()
		var indicate_loading = top_loader.load_more()
		
		var latest = top_loader.latest
		previous_link.fade_out(0.2, function()
		{
			if (top_loader.latest === latest)
				indicate_loading()
		})
	}
	
	top_loader.activate = function()
	{
		previous_link.fade_in(0)
		previous_link.on('click', show_previous)
		previous_link.removeClass('inactive')
	}
	
	top_loader.deactivate = function()
	{
		previous_link.unbind()
		previous_link.addClass('inactive')
	}
	
	function create_item_from_template(data)
	{
		var item = $.tmpl(options.template, data)
		
		if (!item.is('li'))
			item = $('<li/>').append(item)
			
		return item
	}
	
	function prepend_item(item)
	{
		if (options.data.prepend)
			return options.data.prepend(item)
		
		options.container.prepend(item)
	}
	
	function append_item(item)
	{
		if (options.data.append)
			return options.data.append(item)
		
		options.container.append(item)
	}
	
	function render_item(data)
	{
		if (options.data.render)
			return options.data.render(data)
			
		var item = create_item_from_template(data)
	
		if (!item)
			return
		
		if (options.с_номерами_страниц)
		{
			activate_page_scrolling(data, item)
			прокрутчик.watch(item)
		}
		
		var postprocessed_item
		if (options.data.postprocess_item)
			postprocessed_item = options.data.postprocess_item.bind(item)(data)
		
		return postprocessed_item || item
	}
	
	new Data_templater
	({
		template: options.template,
		container: options.container,
		render: function(data) { return render_item(data) },
		show: function(element) { prepend_item(element) },
		conditional: previous_conditional,
		load_data_immediately: false
	},
	top_loader)
	
	previous_block.hide()
	
	// загрузчик внизу
	
	bottom_loader = new Batch_loader_with_infinite_scroll(Object.x_over_y(common_loader_options,
	{
		skip_pages: skip_pages,
		parameters: Object.x_over_y(parameters, { всего: overall_count }),
		get_data: function(data)
		{
			if (data['есть ли предыдущие?'])
			{
				previous_block.show()
				top_loader.activate()
			}
			
			data = on_data(data)
				
			if (data.is_empty())
				return []
		
			data.first().страница = this.page.number + 1
			data.first().первый = true
			
			return data
		},
		before_output: function(elements)
		{
			if (options.data.before_output)
				options.data.before_output(elements)
				
			top_loader.index++
			top_loader.latest = bottom_loader.earliest
			previous_conditional.callback()	
		},
		after_output: function(elements)
		{
			after_output(elements)
			
			if (first_output)
			{
				first_output = false
				
				if (options.data.on_first_output)
					options.data.on_first_output()
			}
			
			if (options.progress_bar)
				update_progress_bar()
			
			ajaxify_internal_links(page.content)
		},
		finished: function()
		{
			if (options.progress_bar)
				update_progress_bar()
				
			if (options.data.finished)
				options.data.finished()
		}
	}))
	
	new Data_templater
	({
		container: options.container,
		render: function(data) { return render_item(data) },
		show: function(element) { append_item(element) },
		conditional: main_conditional
	},
	bottom_loader)
	
	if (options.progress_bar)
	{
		progress_bar = $('.vertical_progress_bar').show()
		progress_bar.appendTo('body')
	}
	//}
	
	var progress
	
	function update_progress_bar(update_options)
	{
		if (!progress)
		{
			if (!skipped)
				if (skip_pages)
					skipped = skip_pages * options.data.batch_size
			
			progress = new Progress
			({
				element: $('.vertical_progress_bar .bar .progress'),
				maximum: overall_count,
				vertical: true,
				skipped: skipped
			})
			
			progress_bar.show()
		}
		
		progress.update(bottom_loader.уже_загружено(), update_options)
	}
	
	var destroyed = false
	
	var result =
	{
		destroy: function()
		{
			if (destroyed)
				return
			
			destroyed = true
			
			bottom_loader.deactivate()
			
			if (options.progress_bar)
				progress_bar.remove()
		}
	}
	
	return result
}