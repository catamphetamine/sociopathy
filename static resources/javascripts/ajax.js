var Ajax = 
{
	get: function(url, data, options)
	{
		return this.request('GET', url, data, options);
	},
	
	post: function(url, data, options)
	{
		return this.request('POST', url, data, options);
	},
	
	put: function(url, data, options)
	{
		return this.request('POST', url, Object.merge(data, { _method: 'put' }), options);
	},
	
	'delete': function(url, data, options)
	{
		return this.request('POST', url, Object.merge(data, { _method: 'delete' }), options);
	},
	
	request: function(method, url, data, options)
	{
		options = options || {}
		
		options.type = options.type || 'json'
		
		if (options.type === 'json')
			url = correct_data_url(url)
		
		//var id = Math.random() + '@' + new Date().getTime()
		var result =
		{
			valid: true,
			expired: function()
			{
				return !this.valid
			},
			expire: function()
			{
				this.valid = false
			}
		}
	
		Default_ajax_error_message = 'Произошла ошибка на сервере'
		
		var jQuery_options = 
		{
			url: url, 
			type: method,
			data: data, 
			dataType: options.type,
			timeout: 15000
		}
		
		//if (window.development_mode)
		if (options.type === 'json')
			jQuery_options.cache = false
		
		if (options.jQuery)
			$.extend(jQuery_options, options.jQuery)
			
		var ajax = $.ajax(jQuery_options)
		
		var error_handler
		
		var on_error = function(сообщение, data)
		{
			if (сообщение === 'Internal Server Error')
				сообщение = Default_ajax_error_message
				
			if (сообщение === 'abort')
				if (page.navigating_away)
					return
			
			if (error_handler)
			{
				if ($.isFunction(error_handler))
				{
					if (data)
						if (web_page_still_loading())
							if (data.показать !== false)
								error(сообщение, { sticky: true })
				
					return error_handler(сообщение, data)
				}
				else if (typeof error_handler === 'string')
					return error(error_handler)
			}
			
			error(text(сообщение))
		}
		
		result.abort = function() { ajax.abort() }
		
		result.ok = function(ok)
		{
			var on_ok = function(data)
			{
				if ($.isFunction(ok))
					ok(data)
				else if (typeof(ok) === 'string')
					info(ok)
				else
					error('Неправильная настройка ok: ' + ok)
			}
			
			ajax.success(function(data, textStatus)
			{
				if (result.expired())
					return
			
				if (!data)
					return console.log('No output for Ajax request')
			
				if (data.ошибка)
					data.error = data.ошибка
			
				if (data.error)
				{
					var сообщение = data.error
					if (сообщение == true)
						сообщение = Default_ajax_error_message
						
					if (сообщение.текст)
						сообщение = сообщение.текст
						
					if (data.error.уровень !== 'ничего страшного')
						report_error('ajax', data.debug || сообщение)
						
					return on_error(сообщение, data.error)
				}
				
				on_ok(data)
			})
			
			return result
		}
		
		result.ошибка = function(ошибка)
		{
			if (result.expired())
				return
			
			error_handler = ошибка
			
			ajax.error(function(jqXHR, textStatus, errorThrown)
			{
				on_error(errorThrown)
			})
			
			return result
		}
		
		return result
	}
}