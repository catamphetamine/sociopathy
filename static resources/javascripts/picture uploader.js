var Picture_uploader = new Class
({
	Implements: [Options],
	
	options:
	{
		namespace: '',
		max_size: 1, // in megabytes
		max_size_text: 'одного мегабайта',
		error: "Не удалось загрузить картинку"
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
		
		var form = $('<form/>')
		form.addClass('picture_uploader')
		
		var input = $('<input/>')
		input.attr('type', 'file')
		input.appendTo(form)
		
		form.appendTo(page.content)
		
		this.input = input
		
		this.on_choice()
		this.initialize_uploader()
	},
	
	activate: function()
	{
		this.on_choice()
	},
	
	deactivate: function()
	{
		this.input.unbind(this.options.namespace)
	},
	
	choose: function()
	{
		this.input.click()
	},
	
	on_choice: function()
	{
		this.input.on('change' + this.options.namespace, (function()
		{
			var file = this.input[0].files[0]
			
			if (file.size > this.options.max_size * 1024 * 1024)
				return warning('Эта картинка слишком много весит. Разрешены картинки не более ' + this.options.max_size_text)

			if (file.type !== 'image/jpeg' && file.type !== 'image/png')
				return warning('Можно загружать только картинки форматов Jpeg и Png')
					
			this.uploading_screen().fade_in(0.2)
			
			this.uploader.send()
		})
		.bind(this))
	},
	
	initialize_uploader: function()
	{
		var picture_uploader = this
		
		this.uploader = new Uploader(this.input,
		{
			url: 'http://' + Configuration.Host + ':' + Configuration.Upload_server_port + this.options.url,
			parameter: { name: 'user', value: $.cookie('user') },
			success: function(data)
			{
				get_image_size(data.адрес, function(size)
				{
					data.size = size
					
					var ok = picture_uploader.options.ok.bind(picture_uploader)
					var ok_result = ok(data, picture_uploader.element())
					
					function finish()
					{
						picture_uploader.uploading_screen().hide() //fade_out(0.2)
					}
					
					if (typeof ok_result === 'function')
						ok_result(finish)
					else
						finish()
				})
			},
			error: function(ошибка)
			{
				//report_error('picture uploader', ошибка)
				error(picture_uploader.options.error)
				picture_uploader.uploading_screen().fade_out(0.2)
			},
			Ajax: page.Ajax
		})
	},
	
	element: function()
	{
		if (typeof this.options.element === 'function')
			return this.options.element.bind(this)()
		
		return this.options.element
	},
	
	uploading_screen: function()
	{
		var uploading_screen = this.element().find('.picture_uploading_screen')
		
		if (!uploading_screen.exists())
		{
			uploading_screen = $('<div/>')
			uploading_screen.addClass('picture_uploading_screen')
			
			uploading_screen.append($('<span/>').text('Загружается'))
			
			var target = this.element()
			
			if (this.options.uploading_screen_target)
				target = target.find(this.options.uploading_screen_target)
			
			uploading_screen.appendTo(target)
		}
		
		if (this.options.uploading_screen_size)
		{
			var size = this.options.uploading_screen_size.bind(this)(this.element())
			
			uploading_screen.width(size.width)
			uploading_screen.height(size.height)
		}
		
		return uploading_screen
	}
})