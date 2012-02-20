var Batch_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		get_data: function(data) { return data },
		finished: function() {},
		done: function() {},
		done_more: function() {},
		before_done_output: function() {},
		before_done_more_output: function() {},
		get_id: function(object) { return object._id }
	},
	
	есть_ли_ещё: true,
	index: 1,
	
	initialize: function(options)
	{
		this.setOptions(options)

		$(window).scrollTop(0)
		this.$scroll_detector = $('#scroll_detector')
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
			data.после = this.latest
			
		if (this.options.order)
			data.порядок = this.options.order
		
		Ajax.get(this.options.url, data, 
		{ 
			ошибка: function(ошибка)
			{
				callback(ошибка)
			},
			ok: function(data)
			{
				if (!data['есть ещё?'])
					loader.есть_ли_ещё = false
					
				var data_list = loader.options.get_data(data)
				loader.index += data_list.length
				callback(null, data_list)
			}
		})
	},
	
	load: function()
	{
		var loader = this
		
		var first_load = true
		if (loader.index > 1)
			first_load = false
			
		this.batch(function(ошибка, список)
		{
			if (ошибка)
			{
				loader.options.callback(ошибка)
				return
			}
		
			список.forEach(function(объект)
			{
				loader.options.show(объект)
			})
			
			if (first_load)
				loader.options.before_done_output()
			else
				loader.options.before_done_more_output()
			
			if (!список.is_empty())
			{
				if (loader.options.order === 'обратный')
					loader.latest = loader.options.get_id(список[0])
				else
					loader.latest = loader.options.get_id(список[список.length - 1])
			}
			
			if (!loader.есть_ли_ещё)
				loader.options.finished()
				
			loader.options.callback(null, function()
			{			
				if (first_load)
					loader.options.done()
				else
					loader.options.done_more.bind(loader)()
				
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
		this.options.loading_more()
		this.load()
	}
})

var Batch_loader_with_infinite_scroll = new Class
({
	Extends: Batch_loader,

	activate: function()
	{
		var loader = this
		
		this.$scroll_detector.on('appearing_on_bottom.scroller', function(event)
		{
			loader.load_more()
			event.stopPropagation()
		})
		
		прокрутчик.watch(this.$scroll_detector, $(window).height() + 1)
	},
	
	deactivate: function()
	{
		this.$scroll_detector.unbind('.scroller')
		прокрутчик.unwatch(this.$scroll_detector)
	}
})

var Data_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		parameters: {},
		get_data: function(data) { return data },
		done: function() {},
		before_done_output: function() {}
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
	},

	get: function(callback)
	{
		var loader = this
		
		Ajax.get(this.options.url, this.options.parameters,
		{ 
			ошибка: function(ошибка)
			{
				callback(ошибка)
			},
			ok: function(data)
			{
				callback(null, loader.options.get_data(data))
			}
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
				
			список.forEach(function(объект)
			{
				loader.options.show(объект)
			})
			
			loader.options.before_done_output()
				
			loader.options.callback(null, function()
			{
				loader.options.done()
			})
		})
	}
})

var Data_templater = new Class
({
	initialize: function(options, loader)
	{
		var conditional = initialize_conditional(options.conditional)

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
				var item = $.tmpl(options.template_url, data)
				options.postprocess_element(item).appendTo(options.item_container)
			}
		
		if (!options.process_data)
			options.process_data = function(data) { return data }
		
		loader.options.show = function(item)
		{
			if (options.data)
			{
				var items = item
				for (var property in options.data)
					if (options.data.hasOwnProperty(property))
						if (items[property])
						{
							if (items[property].constructor === Array)
							{
								items[property].forEach(function(item)
								{
									show_item(item, options.process_data(options.data[property]))
								})
							}
							else
							{
								show_item(items[property], options.process_data(options.data[property]))
							}
						}
			}
			else
				show_item(item, options)
		}
		
		loader.options.callback = conditional.callback
		loader.options.loading_more = conditional.loading_more
		loader.options.done = options.done || function() {}
		
		if (options.data)
		{
			var latest_deferred
			for (var property in options.data)
				if (options.data.hasOwnProperty(property))
				{
					if (latest_deferred)
						latest_deferred = latest_deferred.pipe(function() { return load_template(options.data[property].template_url) })
					else
						latest_deferred = load_template(options.data[property].template_url)
				}
			
			latest_deferred.done(function() { loader.load() })
		}
		else
			load_template(options.template_url).done(function() { loader.load() })
			
		function load_template(template_url)
		{
			var deferred = $.Deferred()
			Ajax.get(template_url,
			{
				//cache: false,
				type: 'html',
				ошибка: function()
				{
					conditional.callback('Не удалось загрузить страницу')
				},
				ok: function(template) 
				{
					$.template(template_url, template)
					deferred.resolve()
				}
			})
			return deferred
		}
	}
})