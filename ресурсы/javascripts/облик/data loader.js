var Batch_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		parameters: {},
		get_data: function(data)
		{
			if (this.options.data)
				return data[this.options.data]
				
			return data
		},
		finished: function() {},
		done: function() {},
		done_more: function() {},
		before_done: function() {},
		before_done_more: function() {},
		get_id: function(object) { return object._id },
		reverse: false,
		Ajax: Ajax,
		each: function() {}
	},
	
	есть_ли_ещё: true,
	index: 1,
	
	page: { number: 0 },
	
	уже_загружено: function()
	{
		return this.page.number * this.options.batch_size
	},
	
	initialize: function(options)
	{
		this.setOptions(options)

		if (page)
			if (!this.options.Ajax)
				this.options.Ajax = page.Ajax
			
		if (options.skip_pages)
			this.page.number += options.skip_pages
	},

	batch: function(возврат)
	{
		this.next(this.options.batch_size, возврат)
	},
	
	next: function()
	{
		var count = 1
		var callback
		
		switch (arguments.length)
		{
			case 1:
				callback = arguments[0]
				break
			case 2:
				count = arguments[0]
				callback = arguments[1]
				break
			default:
				throw 'next: invalid argument count'
		}

		this.get(count, callback)
	},
	
	get: function(count, callback)
	{
		var loader = this
		
		var data = { сколько: count }
		
		if (this.latest)
			data.с = this.latest
			
		if (this.options.skip_pages)
			data.пропустить = this.options.skip_pages * this.options.batch_size
			
		if (this.options.order)
			data.порядок = this.options.order
		
		data = Object.merge(this.options.parameters, data)
		
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
					loader.page.number++
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
	
	load: function()
	{
		var loader = this
		
		var is_first_batch = loader.no_data_yet()
		
		this.batch(function(ошибка, список)
		{
			if (ошибка)
			{
				loader.options.callback(ошибка)
				return
			}
		
			список.for_each(function()
			{
				loader.options.show(this)
			})
			
			if (!список.is_empty())
			{
				if (loader.options.order === 'обратный')
				{
					loader.earliest = loader.options.get_id(список[список.length - 1])
					loader.latest = loader.options.get_id(список[0])
				}
				else
				{
					loader.earliest = loader.options.get_id(список[0])
					loader.latest = loader.options.get_id(список[список.length - 1])
				}
			}
			
			if (is_first_batch)
				loader.options.before_done.bind(loader)(список)
			else
				loader.options.before_done_more.bind(loader)(список)
			
			if (!loader.есть_ли_ещё)
				loader.options.finished(список)
			
			loader.options.callback(null, function()
			{			
				if (is_first_batch)
					loader.options.done.bind(loader)(список)
				else
					loader.options.done_more.bind(loader)(список)
				
				if (loader.есть_ли_ещё)
					loader.activate()
			})
		})
	},
	
	activate: function() {},
	deactivate: function() {},
	
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
		this.parent(options)
		
		$(window).scrollTop(0)
		this.options.scroll_detector = this.options.scroll_detector || $('#scroll_detector')
	},
	
	activate: function()
	{
		var loader = this
		
		this.options.scroll_detector.on('appears_on_bottom.scroller', function(event)
		{
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
		get_data: function(data)
		{
			if (this.options.data)
				return data[this.options.data]
				
			return data
		},
		done: function() {},
		show: function() {},
		before_done: function() {},
		each: function() {},
		Ajax: Ajax
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
		
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
				data.for_each(function()
				{
					loader.options.each.bind(this)(data)
				})
			
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
				
			список.for_each(function()
			{
				loader.options.show(this)
			})
			
			loader.options.before_done(список)
				
			loader.options.callback(null, function()
			{
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
	
		if (page)
			options.Ajax = options.Ajax || page.Ajax

		options.Ajax = options.Ajax || Ajax
	
		var conditional = options.conditional
		if (conditional.constructor === jQuery)
			conditional = initialize_conditional(options.conditional)

		if (!options.postprocess_element)
			options.postprocess_element = function(element)
			{
				return element
			}
		
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
					
				options.postprocess_element(item).appendTo(options.container)
			}
		
		if (!options.process_data)
			options.process_data = function(data) { return data }
		
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
				show_item(item, options)
		}
		
		loader.options.Ajax = options.Ajax
		
		loader.options.callback = conditional.callback
		loader.options.loading_more = conditional.loading_more
		
		if (options.before_done)
			loader.options.before_done = options.before_done
		
		var load_data = function()
		{
			if (options.load_data !== false)
				loader.load()
		}
		
		if (options.data_structure)
		{
			var latest_deferred
			for (var property in options.data_structure)
				if (options.data_structure.hasOwnProperty(property))
				{
					if (latest_deferred)
						latest_deferred = latest_deferred.pipe(function()
						{
							return load_template(options.data_structure[property].template_url)
						})
					else
						latest_deferred = load_template(options.data_structure[property].template_url)
				}
			
			latest_deferred.done(load_data)
		}
		else
			load_template(options.template_url).done(load_data)
			
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