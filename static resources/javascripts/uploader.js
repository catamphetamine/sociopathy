var Uploader = new Class
({
	Implements: [Options],

	options:
	{
		prefix: 'file',
		multiple: false,
		auto_upload: false,
		error: function(error)
		{
			//console.log('error')
		},
		success: function(data)
		{
			//console.log(data)
		}
	},
	
	initialize: function(input, options)
	{
		this.setOptions(options)
	
		if (!this.options.Ajax)
			return alert('Uploader needs an Ajax option')
		
		if (input instanceof jQuery)
			input = input[0]
			
		this.input = input
	
		if (this.options.auto_upload)
			this.input.onchange = this.send
	},

	send: function()
	{
		// Make sure there is at least one file selected
		if (this.input.files.length < 1)
		{
			if (this.options.error)
				this.options.error('Must select a file to upload')
				
			return false
		}
		
		// Don't allow multiple file uploads if not specified
		if (this.options.multiple === false && this.input.files.length > 1)
		{
			if (this.options.error)
				this.options.error('Can only upload one file at a time')
				
			return false
		}
		
		if (this.options.multiple) 
			this.multiSend(this.input.files)
		else 
			this.singleSend(this.input.files[0])
	},

	singleSend: function(file)
	{
		var data = new FormData()
		data.append(String(this.options.prefix), file)
		this.upload(data)
	},

	multiSend: function(files)
	{
		var data = new FormData()
		
		files.forEach(function(file, i)
		{
			data.append(this.options.prefix + i, file)
		})
		
		this.upload(data)
	},

	upload: function(data)
	{
		var url = this.options.url
		
		var parameter = this.options.parameter
		if (parameter)
		{
			if (url.indexOf('?') >= 0)
				url += '&'
			else
				url += '?'
				
			url += encodeURIComponent(parameter.name) + '=' + encodeURIComponent(parameter.value)
		}
		
		var uploader = this
	
		this.options.Ajax.post(url, data,
		{
			type: 'json',
			jQuery:
			{
				contentType: false,
				processData: false
			},
			before: function(XmlHttpRequest)
			{
				if (uploader.options.progress)
					XmlHttpRequest.upload.addEventListener('progress', uploader.options.progress, false)
			}
		})
		.ok(function(data)
		{
			uploader.input.value = ''
			uploader.options.success(data)
		})
		.ошибка(function(error)
		{
			uploader.options.error(error)
		})
	}
})