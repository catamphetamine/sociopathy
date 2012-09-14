function either_way_loading(options)
{
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
	
	page.load = function()
	{
		//Подсказки.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')
	
		//page.content.disableTextSelect()
		
		var loader_markup = $.tmpl('either way loading', {})
		
		var real_content = page.content.children()
		page.content.prepend(loader_markup)
		
		var ok_block = page.get('.main_conditional > [type=ok]')
		
		ok_block.find('> [type="placeholder"]').replaceWith(real_content)
		
		var previous_block = page.get('.previous_conditional')
		
		var main_conditional = initialize_conditional(page.get('.main_conditional'))
		var previous_conditional = initialize_conditional(previous_block)
		
		previous_block.prependTo(ok_block)

		page.get('[type="error"], [type="loading_more_error"]').text(options.error || "Во время загрузки данных произошла ошибка")
		
		options.container = page.get(options.container)
		
		// загрузчик вверху
		
		var previous_link = previous_block.find('.previous > a')
		
		var top_loader = new Batch_loader
		({
			url: options.data.url,
			latest_first: options.data.latest_first,
			batch_size: options.data.batch_size,
			skip_pages: skip_pages + 1,
			reverse: true,
			parameters: { раньше: true, всего: overall_count },
			get_data: function (data)
			{
				data = data[options.data.name]
				
				if (data.is_empty())
					return
				
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
		})
		
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
		}
		
		top_loader.deactivate = function() { previous_link.unbind() }
		
		new Data_templater
		({
			template_url: options.template,
			container: options.container,
			show: function(data)
			{
				var element = $.tmpl(options.template, data)
					
				options.container.prepend($('<li/>').append(element))
				
				if (!data.страница)
					return
			
				if (options.с_номерами_страниц)
				{
					activate_page_scrolling(data, element)
					прокрутчик.watch(element)
				}
			},
			conditional: previous_conditional,
			load_data_immediately: false
		},
		top_loader)
		
		if (skip_pages)
			top_loader.activate()
		else
			previous_block.hide()
		
		// загрузчик внизу
		
		bottom_loader = new Batch_loader_with_infinite_scroll
		({
			url: options.data.url,
			latest_first: options.data.latest_first,
			batch_size: options.data.batch_size,
			skip_pages: skip_pages,
			parameters: { всего: overall_count },
			get_data: function(data)
			{
				if (!overall_count)
					overall_count = data.всего
					
				data = data[options.data.name]
					
				if (data.is_empty())
					return
				
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
			}
		})
		
		new Data_templater
		({
			template_url: options.template,
			container: options.container,
			show: function(data)
			{
				var element = $.tmpl(options.template, data)
				
				options.container.append($('<li/>').append(element))
				
				if (!data.страница)
					return
					
				if (options.с_номерами_страниц)
				{
					activate_page_scrolling(data, element)
					прокрутчик.watch(element)
				}
			},
			conditional: main_conditional
		},
		bottom_loader)
		
		if (options.progress_bar)
		{
			progress_bar = $('.vertical_progress_bar')
			progress_bar.appendTo('body')
		}
	}
	
	page.unload = function()
	{
		bottom_loader.deactivate()
		
		if (options.progress_bar)
			progress_bar.remove()
	}
	
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
}