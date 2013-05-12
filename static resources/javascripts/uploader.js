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
	
	initialize: function(options)
	{
		this.setOptions(options)
	
		if (!this.options.Ajax)
			return alert('Uploader needs an Ajax option')
		
		/*
		if (this.options.auto_upload)
			input.onchange = this.upload_input
		*/
	},

	upload_input: function(input)
	{
		if (input instanceof jQuery)
			input = input[0]
			
		// Make sure there is at least one file selected
		if (input.files.length < 1)
		{
			if (this.options.error)
				this.options.error('Must select a file to upload')
				
			return false
		}
		
		// Don't allow multiple file uploads if not specified
		if (this.options.multiple === false && input.files.length > 1)
		{
			if (this.options.error)
				this.options.error('Can only upload one file at a time')
				
			return false
		}
		
		if (this.options.multiple) 
			this.upload(input.files)
		else 
			this.upload_batch(input.files[0])
	},

	upload: function(file)
	{
		var data = new FormData()
		data.append(String(this.options.prefix), file)
		this.upload_data(data)
	},

	upload_batch: function(files)
	{
		var data = new FormData()
		
		files.forEach(function(file, i)
		{
			data.append(this.options.prefix + i, file)
		})
		
		this.upload_data(data)
	},

	upload_data: function(data)
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
			uploader.options.success(data)
		})
		.ошибка(function(error)
		{
			uploader.options.error(error)
		})
	}
})