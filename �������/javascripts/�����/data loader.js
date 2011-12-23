var Batch_loader = new Class
({
	Implements: [Options],
	
	options:
	{
		get_data: function(data) { return data }
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
		
		Ajax.get(this.options.url, { с: this.index, сколько: count }, 
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
			
			loader.options.callback(null, function()
			{
				if (loader.есть_ли_ещё)
					loader.activate()
			})
		})
	},
	
	activate: function()
	{
		var loader = this
		
		this.$scroll_detector.bind('appearing_on_bottom.scroller', function(event)
		{
			loader.deactivate()
			loader.options.loading_more()
			loader.load()
				
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
		get_data: function(data) { return data }
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
			error: function(ошибка)
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
			
			loader.options.callback()
		})
	}
})

var Data_templater = new Class
({
	initialize: function(options, loader)
	{
		var conditional = initialize_conditional(options.conditional)

		if (!options.postprocess_item_element)
			options.postprocess_item_element  = function(element)
			{
				return element
			}
		
		function show_item(item, options)
		{
			var item_element = $.tmpl(options.template_url, item)
			options.postprocess_item_element(item_element).appendTo(options.item_container)
		}
		
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
								items[property].forEach(function(item)
								{
									show_item(item, options.data[property])
								})
							else
								show_item(items[property], options.data[property])
						}
			}
			else
				show_item(item, options)
		}
		
		loader.options.callback = conditional.callback
		
		if (options.data)
		{
			var latest_deferred
			for (var property in options.data)
				if (options.data.hasOwnProperty(property))
				{
					if (latest_deferred)
						latest_deferred.then(function() { load_template(options.data[property].template_url) })
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
				error: function()
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