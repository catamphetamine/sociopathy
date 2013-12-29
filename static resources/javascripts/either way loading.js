var Pagination = new Class
({
	Implements: [Options],
	
	total: 0,
	
	options:
	{
		fade_duration: 0.2,
		can_be_shown: true
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
		//console.log('Set page ' + page)
		//console.log('Total pages ' + this.pages)
		
		if (this.page === page)
			return
		
		this.page = page
		
		this.position_current_sector()
		
		if (this.page === 0)
			return
		
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
		//console.log('Hide pagination')
		
		this.shown = false
		this.pagination.fade_out(this.options.fade_duration)
	},
	
	show: function()
	{
		//console.log('Show pagination')
	
		if (this.shown)
			return
			
		if (!this.options.can_be_shown)
			return // console.log('can not be shown')
		
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
	
		fade_in: 0.0,
		fade_out: 0.0,
		
		previous_link:
		{
			fade_in: 0.2,
			fade_out: 0.2
		}
	},
	
	first_output: true,
		
	initialize: function(options)
	{
		this.setOptions(options)
		
		// загрузчик внизу
		
		var either_way = this
		
		this.bottom_loader = new Scroll_loader(Object.x_over_y(this.common_loader_options(),
		{
			skip_pages: this.options.страница,
			parameters: this.options.data.parameters,
			get_data: function(data)
			{
				if (this.первый_раз)
				{
					(function()
					{
						this.initial_data = data
						
						if (data.пропущено)
						{
							this.top_loader.set_skipped_before(data.пропущено)
							this.bottom_loader.set_skipped_before(data.пропущено)
						}
					
						this.top_loader.первый_раз = false
						
						if (this.options.data.on_pre_first_data)
							this.options.data.on_pre_first_data(data)
					})
					.bind(either_way)()
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
				
				return data
			},
			loaded: function(data_list)
			{
				if (this.bottom_loader.первый_раз)
				{
					var data = this.initial_data
					delete this.initial_data
					
					if (data['есть ли предыдущие?'])
					{
						this.previous_block.visible()
						this.previous_link.fade_in(this.options.previous_link.fade_in)
						this.top_loader.activate()
						
						if (data.пропущено > this.options.Skip_for_pagination)
							this.pagination.options.can_be_shown = true
					}
						
					this.pagination.set_total(data.всего)
					
					this.pagination.set_page(this.bottom_loader.get_current_page())
						
					if (this.options.data.on_first_batch)
						this.options.data.on_first_batch(data)
				}
				
				if (this.resetted)
				{
					this.resetted = false
					this.options.container.empty()
				}
			}
			.bind(this),
			before_output: function(elements)
			{
				if (this.options.data.before_output)
					this.options.data.before_output(elements)
			
				if (this.options.data.is_in_the_end)
					this.options.data.is_in_the_end(!this.есть_ли_ещё)
			
				if (!this.top_loader.latest)
				{
					this.top_loader.latest = this.bottom_loader.earliest
					//this.options.container.fade_in(this.options.fade_in)
				}
				
				this.previous_conditional.callback()	
			}
			.bind(this),
			after_output: function(elements)
			{
				this.after_output(elements, { first: true })
				
				if (this.first_output)
				{
					this.first_output = false
					
					if (this.options.data.on_first_output)
						this.options.data.on_first_output()
				}
				
				//if (this.options.progress_bar)
				//	update_progress_bar()
				
				ajaxify_internal_links(page.content)
			}
			.bind(this),
			finished: function()
			{
				//if (this.options.progress_bar)
				//	update_progress_bar()
					
				if (this.options.data.finished)
					this.options.data.finished()
			}
			.bind(this),
			hidden: true
		}))
		
		this.top_loader = new Batch_loader(Object.x_over_y(this.common_loader_options(),
		{
			skip_pages: this.options.страница + 1,
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
					either_way.previous_link.fade_in(either_way.options.previous_link.fade_in)
			
				elements.reverse()
				either_way.after_output(elements, {})
				elements.reverse()
			},
			finished: function()
			{
				this.previous_link.hide()
			}
			.bind(this)
		}))
		
		this.top_loader.activate = function()
		{
			this.previous_link.fade_in(0)
			this.previous_link.on('click', this.show_previous.bind(this))
			this.previous_link.removeClass('inactive')
		}
		.bind(this)
		
		this.top_loader.deactivate = function()
		{
			this.previous_link.unbind()
			this.previous_link.addClass('inactive')
		}
		.bind(this)
		
		if (this.options.show)
			this.show()
	},
	
	common_loader_options: function()
	{
		var common_loader_options =
		{
			url: this.options.data.url,
			latest_first: this.options.data.latest_first,
			batch_size: this.options.data.batch_size,
			editable: this.options.editable,
			before_output_async: this.options.data.before_output_async
		}
		
		return common_loader_options
	},
	
	preload: function(finished)
	{
		this.bottom_loader.preload(finished)
	},
	
	show: function()
	{
		var either_way = this
		
		var loader_markup = $.render('either way loading', {})
		
		this.options.container = page.get(this.options.container)
		
		this.options.container.before(loader_markup)
		
		var ok_block = page.get('.main_conditional > [type=ok]')
		
		ok_block.find('> [type="placeholder"]').replaceWith(this.options.container)
		
		this.previous_block = page.get('.previous_conditional')
		
		var main_conditional = initialize_conditional(page.get('.main_conditional'))
		this.previous_conditional = initialize_conditional(this.previous_block)
		
		this.previous_block.prependTo(ok_block)
	
		page.get('[type="error"], [type="loading_more_error"]').text(this.options.error || "Во время загрузки данных произошла ошибка")
		
		this.pagination = new Pagination
		({
			per_page: this.options.data.batch_size,
			go_to_page: this.go_to_page.bind(this)
		})
		
		this.previous_link = this.previous_block.find('.previous > a')
		
		this.reset()
		
		if (this.options.страница)
		{
			this.pagination.skip_pages(this.options.страница)
			this.pagination.show()
		}
			
		var create_item_from_template = function(data)
		{
			var item = $.render(this.options.template, data)
			
			if (!item.is('li'))
				item = $('<li/>').append(item)
				
			return item
		}
		.bind(this)
		
		var prepend_item = function(item)
		{
			if (this.options.data.prepend)
				return this.options.data.prepend(item)
			
			this.options.container.prepend(item)
		}
		.bind(this)
		
		var append_item = function(item)
		{
			if (this.options.data.append)
				return this.options.data.append(item)
			
			this.options.container.append(item)
		}
		.bind(this)
		
		function activate_page_scrolling(data, element)
		{
			//console.log('activate_page_scrolling for page ' + data.страница)
		
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
		
		var render_item = function(data)
		{
			var item
			
			if (this.options.data.render)
				item = this.options.data.render(data)
			else
				item = create_item_from_template(data)
		
			if (!item)
				return
			
			if (this.options.с_номерами_страниц)
				activate_page_scrolling(data, item)
						
			var postprocessed_item
			if (this.options.data.postprocess_item)
				postprocessed_item = this.options.data.postprocess_item.bind(item)(data)
			
			return postprocessed_item || item
		}
		.bind(this)
		
		new Data_templater
		({
			template: this.options.template,
			container: this.options.container,
			render: function(data) { return render_item(data) },
			show: function(element) { prepend_item(element) },
			conditional: this.previous_conditional
		},
		this.top_loader)
		
		//this.bottom_loader.options.scroll_detector = page.get('#scroll_detector')
		this.bottom_loader.initialize_scrolling()
		
		new Data_templater
		({
			container: this.options.container,
			render: function(data) { return render_item(data) },
			show: function(element) { append_item(element) },
			conditional: main_conditional
		},
		this.bottom_loader)
		.show()
		
		/*
		if (this.options.progress_bar)
		{
			progress_bar = $('.vertical_progress_bar').show()
			progress_bar.appendTo(body)
		}
		
		var progress
		
		function update_progress_bar(update_options)
		{
			if (!progress)
			{
				if (!skipped)
					if (skip_pages)
						skipped = skip_pages * either_way.options.data.batch_size
				
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
		console.log('Go to page ' + page)
	
		if (this.options.data.on_go_to_page)
			this.options.data.on_go_to_page(page)
	
		this.resetted = true
	
		this.reset_loaders()
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
		//console.log('Set page number ' + number)
	
		if (this.options.set_url !== false)
		{
			if (number > 1)
				set_url(this.options.путь + '/' + number)
			else 
				set_url(this.options.путь)
		}
		
		this.pagination.set_page(number)
	},
	
	reset_loaders: function()
	{
		if (this.top_loader)
			this.top_loader.reset()
			
		if (this.bottom_loader)
			this.bottom_loader.reset()
	},
	
	reset: function()
	{
		this.pagination.reset()
		
		прокрутчик.scroll_to_top()
		
		this.options.container.children().each(function()
		{
			page.unwatch(this)
		})
		
		if (!this.top_loader)
			this.previous_block.invisible()
		
		this.previous_link.hide() //.fade_out(this.options.previous_link.fade_out)
		
		//if (this.resetted)
		//	this.options.container.fade_out(this.options.fade_out)
	},
	
	on_data: function(data, loader)
	{	
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