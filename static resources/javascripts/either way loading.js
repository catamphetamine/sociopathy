var either_way_loading = function(options)
{
	return new Either_way_loading(options)
}

var Pagination = new Class
({
	Implements: [Options],
	
	total: 0,
	
	options:
	{
		fade_duration: 0.2
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
		
		var pagination = page.get('.pagination')
		
		pagination.disableTextSelect()
		
		var whole = pagination.find('.whole')
		var current = whole.find('.current')
		
		var start = pagination.find('.start')
		var end = pagination.find('.end')
		
		whole.on('click', function(event)
		{
			var x = event.clientX - this.offset.left
			
			this.options.go_to_page(this.sector_by_offset(x))
		}
		.bind(this))
		
		whole.on('mousedown.pagination', function(event)
		{
			whole.addClass('active')
		})
		
		whole.on('mouseup.pagination', function(event)
		{
			whole.removeClass('active')
		})
		
		pagination.on('mouseenter.pagination', function()
		{
			pagination.addClass('moused_over')
		})
		
		pagination.on('mouseleave.pagination', function()
		{
			pagination.removeClass('moused_over')
		})
		
		whole.on('mouseover.pagination', function()
		{
			whole.addClass('moused_over')
		})
		
		whole.on('mouseout.pagination', function()
		{
			whole.removeClass('moused_over')
			whole.removeClass('active')
		})
		
		current.on('mouseover.pagination', function(event)
		{
			event.preventDefault()
			event.stopImmediatePropagation()
			
			pagination.addClass('moused_over')
			whole.removeClass('moused_over')
		})
		
		current.on('mousedown.pagination', function(event)
		{
			event.preventDefault()
			event.stopImmediatePropagation()
		})
		
		current.on('click.pagination', function(event)
		{
			event.preventDefault()
			event.stopImmediatePropagation()
			
			info(text('loading.either way.pagination.dont click on the slider'))
		})
		
		start.on('click.pagination', function()
		{
			this.options.go_to_page(1)
		}
		.bind(this))
		
		end.on('click.pagination', function()
		{
			this.options.go_to_page(this.pages)
		}
		.bind(this))
		
		$(window).on_page('resize.pagination', function()
		{
			if (this.shown)
				this.calculate_dimensions()
			else
				this.needs_recalculation = true
		}
		.bind(this))
		
		this.whole = whole
		this.current = current
		this.pagination = pagination
	},
	
	reset: function()
	{
		this.set_page(0)
	},
	
	skip: function(skipped)
	{
		var page = Math.ceil(skipped / this.options.per_page)
		
		this.set_page(page)
	},
	
	skip_pages: function(pages)
	{
		this.skip(pages * this.options.per_page)
	},
	
	set_total: function(total)
	{
		this.total = total
		
		this.pages = Math.ceil(this.total / this.options.per_page)
		
		if (this.shown)
			this.update_to_page_count()
	},
	
	set_page: function(page)
	{
		if (this.page === page)
			return
		
		this.page = page
		
		this.position_current_sector()
		
		//console.log('Set page ' + page)
		
		if (this.page === this.pages)
			this.hide()
		else
			this.show()
	},
	
	update_to_page_count: function()
	{
		this.sector_width = this.whole_width / this.pages
		this.pixels_per_item = this.sector_width / this.options.per_page
		
		this.current.width(this.sector_width)
		this.position_current_sector()
	},
	
	calculate_dimensions: function()
	{
		this.whole_width = this.whole.width() + 1
		
		this.update_to_page_count()
	},
	
	position_current_sector: function()
	{
		var current_sector_offset = (this.page - 1) * this.sector_width
		
		current_sector_offset -= 1
		
		this.current.css('left', current_sector_offset + 'px')
	},
	
	sector_by_offset: function(x)
	{
		var item = Math.ceil(x / this.pixels_per_item)
		var sector = Math.ceil(item / this.options.per_page)
	
		// if clicked on the border
		if (sector > this.pages)
			sector = this.pages
	
		return sector
	},
	
	hide: function()
	{
		this.shown = false
		this.pagination.fade_out(this.options.fade_duration)
	},
	
	show: function()
	{
		if (this.shown)
			return
		
		if (this.pages === 1)
			return
		
		this.pagination.fade_in(this.options.fade_duration)
		
		if (!this.offset)
		{
			this.needs_recalculation = true
		}
		
		if (this.needs_recalculation)
		{
			this.needs_recalculation = false
			
			this.offset = this.whole.offset()
			
			this.calculate_dimensions()
			
			this.update_to_page_count()
			
			this.pagination.addClass('smooth')
		}
		
		this.shown = true
	}
})

var Either_way_loading = new Class
({
	Implements: [Options],
	
	options:
	{
		Skip_for_pagination: 80,
	
		fade_in: 0.1,
		fade_out: 0.1,
		
		previous_link:
		{
			fade_in: 0.2,
			fade_out: 0.2
		}
	},
	
	first_batch: true,
	first_output: true,
		
	initialize: function(options)
	{
		this.setOptions(options)
		
		var loader_markup = $.tmpl('either way loading', {})
		
		this.options.container = page.get(this.options.container)
		
		this.options.container.before(loader_markup)
		
		options = this.options
		
		var ok_block = page.get('.main_conditional > [type=ok]')
		
		ok_block.find('> [type="placeholder"]').replaceWith(options.container)
		
		this.previous_block = page.get('.previous_conditional')
		
		var main_conditional = initialize_conditional(page.get('.main_conditional'))
		var previous_conditional = initialize_conditional(this.previous_block)
		
		this.previous_block.prependTo(ok_block)
	
		page.get('[type="error"], [type="loading_more_error"]').text(options.error || "Во время загрузки данных произошла ошибка")
		
		this.pagination = new Pagination
		({
			per_page: this.options.data.batch_size,
			go_to_page: this.go_to_page.bind(this)
		})
		
		var previous_link = this.previous_block.find('.previous > a')
		this.previous_link = previous_link
		
		this.reset()
		
		var skip_pages = this.options.страница
		
		if (skip_pages)
		{
			this.pagination.skip_pages(skip_pages)
			this.pagination.show()
		}
		
		var common_loader_options =
		{
			url: this.options.data.url,
			latest_first: this.options.data.latest_first,
			batch_size: this.options.data.batch_size,
			editable: this.options.editable,
			before_output_async: this.options.data.before_output_async
		}
		
		var either_way = this
		options = this.options
			
		this.top_loader = new Batch_loader(Object.x_over_y(common_loader_options,
		{
			skip_pages: skip_pages + 1,
			reverse: true,
			parameters: function()
			{
				return Object.combine(data_loader_parameters(options.data.parameters), { раньше: true })
			},
			get_data: function (data)
			{
				data = either_way.on_data(data, this)
				
				if (data.is_empty())
					return []
				
				var loader = this
				var amendment = 0
				data.for_each(function()
				{
					this.страница = loader.get_current_page(amendment)
					amendment--
				})
				
				return data
			},
			before_output: function(elements)
			{
				if (options.data.before_output)
					options.data.before_output(elements)
					
				page.data.container_height_before_loaded_previous = either_way.container_height()
			},
			after_output: function(elements, options)
			{
				прокрутчик.scroll_by(either_way.container_height() - page.data.container_height_before_loaded_previous)
				
				ajaxify_internal_links(page.content)
				
				if (this.есть_ли_ещё)
					previous_link.fade_in(either_way.options.previous_link.fade_in)
			
				elements.reverse()
				either_way.after_output(elements, {})
				elements.reverse()
			},
			finished: function()
			{
				previous_link.hide()
			}
		}))
		
		this.top_loader.activate = function()
		{
			previous_link.fade_in(0)
			previous_link.on('click', either_way.show_previous.bind(either_way))
			previous_link.removeClass('inactive')
		}
		
		this.top_loader.deactivate = function()
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
		
		function activate_page_scrolling(data, element)
		{
			element.on('appears_on_bottom.scroller', function(event)
			{
				/*
				console.log('appears_on_bottom.scroller')
				console.log(element.node())
				console.log(data.страница)
				*/
				
				either_way.set_page_number(data.страница)
				event.stopPropagation()
			})
			
			element.on('fully_appears_on_top.scroller', function(event)
			{
				/*
				console.log('fully_appears_on_top.scroller')
				console.log(element.node())
				console.log(data.страница)
				*/
				
				either_way.set_page_number(data.страница)
				event.stopPropagation()
			})
		}
		
		function render_item(data)
		{
			var item
			
			if (options.data.render)
				item = options.data.render(data)
			else
				item = create_item_from_template(data)
		
			if (!item)
				return
			
			if (options.с_номерами_страниц)
				activate_page_scrolling(data, item)
						
			var postprocessed_item
			if (options.data.postprocess_item)
				postprocessed_item = options.data.postprocess_item.bind(item)(data)
			
			return postprocessed_item || item
		}
		
		new Data_templater
		({
			template: this.options.template,
			container: this.options.container,
			render: function(data) { return render_item(data) },
			show: function(element) { prepend_item(element) },
			conditional: previous_conditional,
			load_data_immediately: false
		},
		this.top_loader)
		
		// загрузчик внизу
		
		this.bottom_loader = new Scroll_loader(Object.x_over_y(common_loader_options,
		{
			skip_pages: skip_pages,
			parameters: options.data.parameters,
			get_data: function(data)
			{
				if (this.no_data_yet())
				{
					if (data['есть ли предыдущие?'])
					{
						either_way.previous_block.visible()
						either_way.previous_link.fade_in(either_way.options.previous_link.fade_in)
						either_way.top_loader.activate()
						
						if (data.пропущено > either_way.options.Skip_for_pagination)
							either_way.pagination.show()					
					}
				
					either_way.top_loader.первый_раз = false
				}
				
				data = either_way.on_data(data, this)
				
				if (data.is_empty())
					return []
			
				var loader = this
				var amendment = 1
				data.for_each(function()
				{
					this.страница = loader.get_current_page(amendment)
					amendment++
				})
				
				if (either_way.resetted)
				{
					options.container.empty()
				}
				
				return data
			},
			before_output: function(elements)
			{
				if (options.data.before_output)
					options.data.before_output(elements)
			
				if (options.data.is_in_the_end)
					options.data.is_in_the_end(!this.есть_ли_ещё)
			
				if (either_way.resetted)
				{
					either_way.resetted = false
					options.container.fade_in(either_way.options.fade_in)
				}
			
				if (!either_way.top_loader.latest)
				{
					either_way.top_loader.latest = either_way.bottom_loader.earliest
					options.container.fade_in(either_way.options.fade_in)
				}
				
				previous_conditional.callback()	
			},
			after_output: function(elements)
			{
				either_way.after_output(elements, { first: true })
				
				if (either_way.first_output)
				{
					either_way.first_output = false
					
					if (options.data.on_first_output)
						options.data.on_first_output()
				}
				
				//if (options.progress_bar)
				//	update_progress_bar()
				
				ajaxify_internal_links(page.content)
			},
			finished: function()
			{
				//if (options.progress_bar)
				//	update_progress_bar()
					
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
		this.bottom_loader)
		
		/*
		if (options.progress_bar)
		{
			progress_bar = $('.vertical_progress_bar').show()
			progress_bar.appendTo('body')
		}
		
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
		*/
	},
	
	destroy: function()
	{
		if (this.destroyed)
			return
		
		this.destroyed = true
		
		this.top_loader.deactivate()
		this.bottom_loader.deactivate()
		
		//if (this.options.progress_bar)
		//	this.progress_bar.remove()
	},
	
	go_to_page: function(page)
	{
		if (this.options.data.on_go_to_page)
			this.options.data.on_go_to_page(page)
	
		this.resetted = true
	
		this.reset()
		
		this.pagination.set_page(page)
		
		var skip_pages = page - 1
		
		this.top_loader.skip_pages(skip_pages)
		this.bottom_loader.skip_pages(skip_pages)
		
		this.bottom_loader.options.с_начала = true
		this.bottom_loader.load_more()
	},
	
	set_page_number: function(number)
	{
		if (this.options.set_url !== false)
		{
			if (number > 1)
				set_url(this.options.путь + '/' + number)
			else 
				set_url(this.options.путь)
		}
		
		this.pagination.set_page(number)
	},
	
	reset: function()
	{
		this.pagination.reset()
		
		this.options.container.children().each(function()
		{
			page.unwatch(this)
		})
		
		if (!this.top_loader)
			this.previous_block.invisible()
		
		this.previous_link.fade_out(this.options.previous_link.fade_out)
		
		if (this.top_loader)
			this.top_loader.reset()
			
		if (this.bottom_loader)
			this.bottom_loader.reset()
		
		if (this.resetted)
			this.options.container.fade_out(this.options.fade_out)
	},
	
	on_data: function(data, loader)
	{
		if (this.first_batch)
		{
			this.pagination.set_total(data.всего)
			
			if (data.пропущено)
			{
				this.top_loader.set_skipped_before(data.пропущено)
				this.bottom_loader.set_skipped_before(data.пропущено)
			}
				
			if (this.options.data.on_first_batch)
				this.options.data.on_first_batch(data)

			this.pagination.set_page(loader.get_current_page())
			
			this.first_batch = false
		}
		
		data = data[this.options.data.name]
			
		if (this.options.data.loaded)
		{
			var altered_data = this.options.data.loaded(data)
			if (typeof altered_data !== 'undefined')
				data = altered_data
		}
		
		return data
	},
	
	after_output: function(elements, options)
	{
		if (this.options.data.after_output)
			this.options.data.after_output(elements)
		
		if (this.options.с_номерами_страниц)
		{
			elements.for_each(function()
			{
				page.watch(this, options)
			})
		}
	},

	container_height: function()
	{
		return this.options.container.outerHeight(true)
	},
	
	disabled: function()
	{
		if (this.options.editable)
			if (!Режим.обычный_ли())
				return true
	},

	show_previous: function(event)
	{
		event.preventDefault()
		
		if (this.disabled())
			return info(text('loader.either way.can\'t load more while in edit mode'))
	
		this.top_loader.deactivate()
		
		var indicate_loading = this.top_loader.load_more()
		
		var top_loader = this.top_loader
		var latest = top_loader.latest
		
		this.previous_link.fade_out(this.options.previous_link.fade_out, function()
		{
			if (top_loader.latest === latest)
				indicate_loading()
		})
	},
	
	removed_message_from_top: function()
	{
		var element = $(this.options.container.node().firstChild)
		this.top_loader.latest = { _id: element.attr('message_id') }
	}
})