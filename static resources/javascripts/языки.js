var Url_map =
{
	'user settings': '/сеть/настройки',
	'registration': '/прописка'
}

var Язык
var Перевод

;(function()
{
	function load_translation(language, success, error)
	{
		$.ajax(add_version('/international/' + language + '/' + 'translation' + '.json'))
		.success(function(translation)
		{
			Перевод = JSON.parse(translation)
			Язык = language
			
			success(language)
		})
		.error(error)
	}
	
	function success(language)
	{
		initial_script_in_progress.finished('языки')
	
		if (language !== Configuration.Locale.Предпочитаемый_язык)
		{
			$(document).once_on('display_page', function()
			{
				var supported = []
				Configuration.Locale.Supported_languages.for_each(function()
				{
					supported.push(this.name)
				})
				
				info('Seems that your preferred language (code «' + Configuration.Locale.Предпочитаемый_язык + '») isn\'t supported. The supported languages are: ' + supported.join(', ') + '. ' + 'Defaulting to "' + get_language(language).name + '"')
			})
		}
		
		//console.log(Перевод)
	
		// test
		//alert(text('user language is not supported', { 'preferred language': 'es', 'current language': Язык }))
	}
	
	var языки = []
	Configuration.Locale.Предпочитаемые_языки.forEach(function(язык)
	{
		языки.push(язык)
	})
	
	function try_next_language()
	{
		// defaults
		var язык = Configuration.Locale.Default_language
		var on_error = function()
		{
			if (window.onerror)
				window.onerror('Error while loading page translation')
			else
				alert('Error while loading page translation')
		
			console.error('Internationalization not loaded')
		}
		
		if (!языки.is_empty())
		{
			язык = языки.shift()
			on_error = try_next_language
		}
		
		load_translation(язык, success, on_error)
	}
	
	try_next_language()
})()

// utilities

function get_language(id)
{
	var language
	
	Configuration.Locale.Supported_languages.for_each(function()
	{
		if (this.id === id)
			language = this
	})
	
	return language
}

function text(key, variables)
{
	var translation = Перевод
	
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
		if (Url_map[url])
			url = Url_map[url]
			
		url = url.replace_all('\'', '"')
		
		translation = translation.replace_all(found, '<a href=\'' + url + '\'>')
	}

	translation = translation.replace_all('[/link]', '</a>')
		
	return translation
}