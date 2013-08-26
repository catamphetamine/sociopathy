Translator =
{
	has_text: function(key)
	{
		var translation = Translator.translation
		
		var path = key.split('.')
		while (!path.is_empty())
		{
			translation = translation[path.shift()]
			if (!translation)
				return false
		}
		
		return true
	},
	
	text: function(key, variables)
	{
		var translation = Translator.translation
		
		var path = key.split('.')
		while (!path.is_empty())
		{
			translation = translation[path.shift()]
			if (!translation)
				return key
		}
		
		if (variables)
			Object.for_each(variables, function(key, value)
			{
				translation = translation.replace_all('{' + key + '}', value)
			})
		
		while (true)
		{
			var found = /\[link to ([^\]])+\]/.exec(translation)
			
			if (!found)
				break
	
			found = found[0]
				
			var url = found.substring('[link to '.length, found.length - 1)
			var parameters
			
			if (url.ends_with(')'))
			{
				var code = url
				var opening = code.indexOf('(')
				
				url = code.substring(0, opening)
				parameters = variables[code.substring(opening + 1, code.length - 1)]
			}
			
			var url = Translator.link_to(url, parameters)
			
			url = url.replace_all('\'', encodeURIComponent('\''))
			
			translation = translation.replace_all(found, '<a href=\'' + url + '\'>')
		}
	
		translation = translation.replace_all('[/link]', '</a>')
			
		return translation
	},
	
	link_to: function(key)
	{
		var url = key
		
		var parameters = Array.prototype.slice.call(arguments).clean()
		
		parameters.shift()
		
		if (Url_map[key])
		{
			if (typeof Url_map[key] === 'function')
				url = Url_map[key].apply(this, parameters)
			else
				url = Url_map[key]
		}
		
		return url
	}
}