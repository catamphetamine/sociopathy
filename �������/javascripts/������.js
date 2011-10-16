var Ajax = 
{
	get: function(url, data, options)
	{
		if (!options)
		{
			options = data
			data = undefined
		}
		
		this.request('GET', url, data, options);
	},
	
	post: function(url, data, options)
	{
		this.request('POST', url, data, options);
	},
	
	put: function(url, data, options)
	{
		this.request('POST', url, Object.merge(data, { _method: 'put' }), options);
	},
	
	request: function(method, url, data, options)
	{
		options.type = options.type || 'json'
		
		options.ошибка = options.ошибка || 'Ошибка связи с сервером'
		options.error = options.error || function(message) { error(message) }
		
		$.ajax
		({
			url: url, 
			type: method,
			cache: false,
			data: data, 
			success: function(json, textStatus)
			{
				if (json.ошибка)
				{
					options.error(json.ошибка)
					return
				}

				if (typeof(options.ok) === 'function')
					options.ok(json)
				else if (typeof(options.ok) === 'string')
					info(options.ok)
				else
					error('Неправильная настройка ok: ' + ok)
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				options.error(options.ошибка)
			},
			dataType: options.type,
			
			beforeSend: function() { disable_links() },
			complete: function() { enable_links() },
			timeout: 15000
		})
	}
}

function disable_links()
{
	$('a').each(function()
	{
		if ($(this).attr('href'))
			$(this).data('href', $(this).attr('href')).removeAttr('href');
	})
}

function enable_links()
{
	$('a').each(function()
	{
		$(this).attr('href', $(this).data('href'));
	})
}

function get_highest_z_index(top_z)
{
	if (!top_z)
		top_z = 0
		
	$('body *').each(function() 
	{
		var z_index = parseInt($(this).css('z-index'))
		if (z_index)
			if (top_z < z_index)
				top_z = z_index
	})
	
	return top_z
}

function получить_настройку_запроса(name, url)
{
	if (!url)
		url = decodeURI(window.location.href)

	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
	var regexS = "[\\?&]"+name+"=([^&#]*)"
	var regex = new RegExp( regexS )
	var results = regex.exec(url)
	
	if (results == null)
		return null
		
	return decodeURIComponent(results[1])
}