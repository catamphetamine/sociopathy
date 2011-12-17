var Batch_loader = new Class
({
	Implements: [Options],
	
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
					
				var list = loader.options.list(data)
				loader.index += list.length
				callback(null, list)
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

var Templated_batch_loader = new Class
({
	Extends: Batch_loader,
	
	initialize: function(options)
	{
		this.conditional = initialize_conditional(options.conditional)

		if (!options.postprocess_item_element)
			options.postprocess_item_element  = function(element)
			{
				return element
			}
			
		options.show = function(item)
		{
			var item_element = $.tmpl(options.template_url, item)
			options.postprocess_item_element(item_element).appendTo(options.item_container)
		}
		
		options.loading_more = this.conditional.loading_more
		options.callback = this.conditional.callback

		this.parent(options)
		
		var loader = this
		
		Ajax.get(options.template_url, 
		{
			//cache: false,
			type: 'html',
			error: function()
			{
				loader.conditional.callback('Не удалось загрузить страницу')
			},
			ok: function(template) 
			{
				$.template(options.template_url, template)
				loader.load()
			}
		})
	}
})