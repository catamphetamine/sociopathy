function loader_get_data(data)
{
	if (this.options.data)
	{
		if (typeof this.options.data === 'string')
		{
			return data[this.options.data]
		}
		else if (typeof this.options.data === 'function')
		{
			var modified_data = this.options.data(data)
			if (modified_data)
				return modified_data
			
			return data
		}
	}
		
	return data
}

var Batch_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		parameters: {},
		get_data: loader_get_data,
		finished: function() {},
		done: function() {},
		done_more: function() {},
		before_output_async: function(elements, callback) { callback() },
		after_output: function() {},
		before_done: function() {},
		before_done_more: function() {},
		get_item_locator: function(object) { return object._id },
		reverse: false,
		Ajax: Ajax,
		each: function() {}
	},
	
	есть_ли_ещё: true,
	index: 1,
	
	page: { number: 0 },
	
	counter: 0,
	
	первый_раз: true,
	
	initialize: function(options)
	{
		this.setOptions(options)

		this.options.url = correct_internal_url(this.options.url)
		
		if (page)
			if (!this.options.Ajax)
				this.options.Ajax = page.Ajax
			
		if (this.options.skip_pages)
			this.page.number += this.options.skip_pages
	},

	batch: function(возврат)
	{
		this.get(this.options.batch_size, возврат)
	},
	
	get: function(count, callback)
	{
		var loader = this
			
		var data = { сколько: count }
		
		if (this.latest)
			data.после = this.options.get_item_locator(this.latest)
			
		if (this.options.skip_pages)
			data.пропустить = this.options.skip_pages * this.options.batch_size
			
		if (this.options.order)
			data.порядок = this.options.order
		
		if (this.options.latest_first == true)
			data.задом_наперёд = true
			
		if (this.options.parameters)
			data = Object.x_over_y(this.options.parameters, data)
		
		if (this.первый_раз)
		{
			data.первый_раз = true
			this.первый_раз = false
		}
		
		this.options.Ajax.get(this.options.url, data)
		.ошибка(function(ошибка)
		{
			callback(ошибка)
		})
		.ok(function(data)
		{
			if (!data['есть ещё?'])
				loader.есть_ли_ещё = false
				
			var data_list = loader.options.get_data.bind(loader)(data)
			loader.index += data_list.length
			
			if (!data_list.is_empty())
			{
				if (!loader.options.reverse)
				{
					loader.page.number++
					
					loader.counter = (loader.page.number - 1) * loader.options.batch_size + data_list.length
				}
				else
					loader.page.number--
			}

			data_list.for_each(function()
			{
				loader.options.each.bind(this)(data_list)
			})
			
			callback(null, data_list)
		})
	},
	
	no_data_yet: function()
	{
		return this.index <= 1
	},
	
	уже_загружено: function()
	{
		if (this.options.reverse)
			throw 'No counter for reversed loader'
		
		return this.counter
	},
	
	skipped: function()
	{
		return (this.page.number - 1) * this.options.batch_size
	},
	
	load: function()
	{
		var loader = this
		
		var заморозка
		if (this.options.editable)
			заморозка = Режим.заморозить_переходы()
		
		var is_first_batch = loader.no_data_yet()
			
		this.batch(function(ошибка, список)
		{
			if (ошибка)
				return loader.options.callback(ошибка)
		
			var elements = []
			список.for_each(function()
			{
				var element = loader.options.show(this)
				if (element)
					elements.push(element)
			})
			
			if (!список.is_empty())
			{
				loader.earliest = список.first()
				loader.latest = список.last()
				
				if (loader.options.order === 'обратный')
				{
					var earliest = loader.earliest
					
					loader.earliest = loader.latest
					loader.latest = earliest
				}
			}
			
			if (is_first_batch)
				loader.options.before_done.bind(loader)(список)
			else
				loader.options.before_done_more.bind(loader)(список)
		
			if (loader.options.before_output)
				loader.options.before_output(elements)
			
			loader.options.before_output_async.bind(loader)(elements, function()
			{
				if (!loader.есть_ли_ещё)
					loader.options.finished(список)
				
				loader.options.callback(null, function()
				{
					if (loader.options.after_output)
						loader.options.after_output(elements)
						
					if (is_first_batch)
						loader.options.done.bind(loader)(список)
					else
						loader.options.done_more.bind(loader)(список)
					
					if (loader.есть_ли_ещё)
						loader.activate()
						
					if (заморозка)
						заморозка.разморозить()
						
					//else
					//{
					//	if (loader.options.finished)
					//		loader.options.finished()
					//}
				})
			})
		})
	},
	
	activate: function() {},
	deactivate: function() {},
	finished: function() {},
	
	load_more: function()
	{
		this.deactivate()
		this.load()
		
		var loader = this
		return function()
		{
			loader.options.loading_more()
		}
	}
})

var Batch_data_loader = Batch_loader

var Batch_loader_with_infinite_scroll = new Class
({
	Extends: Batch_loader,

	initialize: function(options)
	{
		options = options || {}
		
		var old = options.finished
		options.finished = function()
		{
			this.options.scroll_detector.remove()
			
			if (old)
				old()
		}
		.bind(this)
							
		this.parent(options)
		
		$(window).scrollTop(0)
		this.options.scroll_detector = this.options.scroll_detector || $('#scroll_detector')
	},
	
	disabled: function()
	{
		if (this.options.editable)
			if (!Режим.обычный_ли())
				return true
	},
	
	activate: function()
	{
		var loader = this
		
		this.options.scroll_detector.on('appears_on_bottom.scroller', function(event)
		{
			if (loader.disabled())
				return
			
			loader.load_more()
			event.stopPropagation()
		})
		
		прокрутчик.watch(this.options.scroll_detector)
	},
	
	deactivate: function()
	{
		this.options.scroll_detector.unbind('.scroller')
		прокрутчик.unwatch(this.options.scroll_detector)
	}
})

var Batch_data_loader_with_infinite_scroll = Batch_loader_with_infinite_scroll

var Data_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		parameters: {},
		get_data: loader_get_data,
		done: function() {},
		show: function() {},
		before_done: function() {},
		each: function() {},
		Ajax: Ajax
	},
	
	initialize: function(options)
	{
		this.setOptions(options)

		this.options.url = correct_internal_url(this.options.url)
		
		if (this.options.conditional)
			this.options.callback = this.options.conditional.callback
		
		if (page)
			if (!this.options.Ajax)
				this.options.Ajax = page.Ajax
	},

	get: function(callback)
	{
		var loader = this
		
		this.options.Ajax.get(this.options.url, this.options.parameters)
		.ошибка(function(ошибка)
		{
			callback(ошибка)
		})
		.ok(function(data)
		{
			data = loader.options.get_data.bind(loader)(data)
			
			if (data instanceof Array)
			{
				data.for_each(function()
				{
					loader.options.each.bind(this)(data)
				})
			}
			
			callback(null, data)
		})
	},
	
	load: function()
	{
		var loader = this
		
		this.get(function(ошибка, список)
		{
			if (ошибка)
			{
				loader.options.callback(ошибка)
				return
			}
		
			if (список.constructor !== Array)
				список = [список]
				
			var elements = []
			список.for_each(function()
			{
				elements.push(loader.options.show(this))
			})
			
			loader.options.before_done(список)
				
			if (loader.options.before_output)
				loader.options.before_output(elements)
				
			loader.options.callback(null, function()
			{
				if (loader.options.after_output)
					loader.options.after_output(elements)
				
				loader.options.done(список)
			})
		})
	}
})

var Data_templater = new Class
({
	initialize: function(options, loader)
	{
		loader = loader || options.loader
		
		if (options.data)
		{
			loader = new Data_loader(options.data)
		}
		
		if (!options.container)
			options.container = options.to
			
		if (!options.conditional)
			options.conditional = initialize_conditional(page.get('.main_conditional'), { immediate: true })
		
		if (page)
			options.Ajax = options.Ajax || page.Ajax

		options.Ajax = options.Ajax || Ajax
	
		var conditional = options.conditional
		if (conditional.constructor === jQuery)
			conditional = initialize_conditional(options.conditional)
			
		if (!options.postprocess_item)
			options.postprocess_item = $.noop
	
		var show_item
		if (options.show)
			show_item = options.show
		else
			show_item = function(data, options)
			{
				var item
				
				if (options.template)
				{
					if (typeof options.template === 'string')
						item = $.tmpl(options.template, data)
					else
						item = $.tmpl(options.template, data)
				}
				else
					item = $.tmpl(options.template_url, data)
					
				if (options.table)
				{
					if (!item.is('tr'))
					{
						if (!item.is('td'))
						{
							item = $('<td/>').append(item)
						}
						
						item = $('<tr/>').append(item)
					}
				}
				else if (!item.is('li') && !options.single)
					item = $('<li/>').append(item)
					
				item = options.postprocess_item.bind(item)(data) || item
				
				return item.appendTo(options.container)
			}
		
		if (!options.process_data)
			options.process_data = function(data) { return data }
		
		if (options.after_output)
			loader.options.after_output = options.after_output
		
		loader.options.show = function(item)
		{
			if (options.data_structure)
			{
				var items = item
				for (var property in options.data_structure)
					if (options.data_structure.hasOwnProperty(property))
						if (items[property])
						{
							if (items[property].constructor === Array)
							{
								items[property].for_each(function()
								{
									show_item(this, options.process_data(options.data_structure[property]))
								})
							}
							else
							{
								show_item(items[property], options.process_data(options.data_structure[property]))
							}
						}
			}
			else
				return show_item(item, options)
		}
		
		loader.options.Ajax = options.Ajax
		
		loader.options.callback = conditional.callback
		loader.options.loading_more = conditional.loading_more
		
		if (options.before_done)
			loader.options.before_done = options.before_done
		
		var load_data = function()
		{
			if (options.load_data_immediately !== false)
				loader.load()
		}
		
		if (options.data_structure)
		{
			var latest_deferred
			for (var property in options.data_structure)
				if (options.data_structure.hasOwnProperty(property))
				{
					if (latest_deferred)
					{
						latest_deferred = latest_deferred.pipe(function()
						{
							return load_template(options.data_structure[property].template_url)
						})
					}
					else
					{
						latest_deferred = load_template(options.data_structure[property].template_url)
					}
				}
			
			latest_deferred.done(load_data)
		}
		else
		{
			load_template(options.template_url).done(load_data)
		}
			
		function load_template(template_url)
		{
			var deferred = $.Deferred()
			
			if (!template_url)
			{
				deferred.resolve()
				return deferred
			}
			
			options.Ajax.get(template_url, {}, { type: 'html' })
			.ошибка(function()
			{
				conditional.callback('Не удалось загрузить страницу')
			})
			.ok(function(template) 
			{
				$.template(template_url, template)
				deferred.resolve()
			})
			
			return deferred
		}
	}
})