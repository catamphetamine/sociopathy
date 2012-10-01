function either_way_loading(options)
{
	parameters = options.data.parameters || {}
	
	//var page = options.page
	
	var bottom_loader
		
	var overall_count
	
	var progress_bar
	
	function set_page_number(number)
	{
		if (number > 1)
			set_url(options.путь + '/' + number)
		else 
			set_url(options.путь)
	}
	
	var skip_pages = (options.страница || 1) - 1
	
	//page.load = function()
	//{
		//page.content.disableTextSelect()
		
	var loader_markup = $.tmpl('either way loading', {})
	
	options.container = page.get(options.container)
	
	//var real_content = //page.content.children()
	//page.content.prepend(loader_markup)
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

	var on_data = function(data)
	{
		if (first_batch)
		{
			if (!overall_count)
				overall_count = data.всего
			
			if (options.data.on_first_batch)
				options.data.on_first_batch(data)

			first_batch = false
		}
		
		data = data[options.data.name]
			
		if (options.data.loaded)
			data = options.data.loaded(data)
			
		return data
	}
	
	var common_loader_options =
	{
		url: options.data.url,
		latest_first: options.data.latest_first,
		batch_size: options.data.batch_size,
	}
	
	if (options.data.before_output_async)
		common_loader_options.before_output_async = options.data.before_output_async

	if (options.data.after_output)
		common_loader_options.after_output = options.data.after_output

	// загрузчик вверху
	
	var previous_link = previous_block.find('.previous > a')
	
	var top_loader = new Batch_loader(Object.x_over_y(common_loader_options,
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
		before_done_more: function()
		{
			ajaxify_internal_links(page.content)
		
			//set_page_number(this.page.number)
			
			if (this.есть_ли_ещё)
				previous_link.fade_in(0.2)
		},
		done_more: function()
		{
			if (options.progress_bar)
				update_progress_bar({ skipped: this.skipped() })
		},
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

	function show_previous(event)
	{
		event.preventDefault()
		
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
	
	new Data_templater
	({
		template_url: options.template,
		container: options.container,
		show: function(data)
		{
			var element
			
			if (options.data.prepend)
				element = options.data.prepend(data)
			else
			{
				element = $.tmpl(options.template, data)
				options.container.prepend($('<li/>').append(element))
			}
		
			if (!element)
				return
			
			if (options.с_номерами_страниц)
			{
				activate_page_scrolling(data, element)
				прокрутчик.watch(element)
			}
			
			return element
		},
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
		before_done: function()
		{
			ajaxify_internal_links(page.content)
		
			top_loader.index++
			top_loader.latest = bottom_loader.earliest
			previous_conditional.callback()
		},
		before_done_more: function()
		{
			ajaxify_internal_links(page.content)
		},
		after_output: function()
		{
			if (options.progress_bar)
				update_progress_bar()
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
		template_url: options.template,
		container: options.container,
		show: function(data)
		{
			var element
			
			if (options.data.append)
				element = options.data.append(data)
			else
			{
				element = $.tmpl(options.template, data)
				options.container.append($('<li/>').append(element))
			}
			
			if (!element)
				return
				
			if (options.с_номерами_страниц)
			{
				activate_page_scrolling(data, element)
				прокрутчик.watch(element)
			}
			
			return element
		},
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
			progress = new Progress
			({
				element: $('.vertical_progress_bar .bar .progress'),
				maximum: overall_count,
				vertical: true,
				skipped: skip_pages * options.data.batch_size
			})
			
			progress_bar.show()
		}
		
		progress.update(bottom_loader.уже_загружено(), update_options)
	}
	
	var result =
	{
		unload:	 function()
		{
			bottom_loader.deactivate()
			
			if (options.progress_bar)
				progress_bar.remove()
		}
	}
	
	return result
}