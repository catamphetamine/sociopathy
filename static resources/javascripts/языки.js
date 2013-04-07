var Url_map = {}

Url_map['registration'] = '/прописка'

var Язык
var Перевод

function load_relevant_translation(path, options)
{
	function load_translation(language, success, error)
	{
		var settings = {}
		
		if (window.development_mode)
			settings.cache = false
			
		$.ajax(add_version(path.replace('${language}', language), settings))
		.success(function(translation)
		{
			success(language, JSON.parse(translation))
		})
		.error(error)
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
		var on_error = options.no_translation
		
		if (!языки.is_empty())
		{
			язык = языки.shift()
			on_error = try_next_language
		}
		
		load_translation(язык, options.ok, on_error)
	}
	
	try_next_language()
}

;(function()
{
	load_relevant_translation('/international/${language}/translation.json',
	{
		ok: function(language, translation)
		{
			Перевод = translation
			Язык = language
		
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
					
					info('Seems that your preferred language (code «' + Configuration.Locale.Предпочитаемый_язык + '») isn\'t supported. The supported languages are: ' + supported.join(', ') + '. ' + 'Defaulting to «' + get_language(language).name + '»')
				})
			}
		},
		no_translation: function()
		{
			if (window.onerror)
				window.onerror('Error while loading page translation')
			else
				alert('Error while loading page translation')
		
			console.error('Internationalization not loaded')
		}
	})
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
		
		var key = url
		if (key.ends_with(')'))
		{
			var code = key
			var opening = code.indexOf('(')
			
			key = code.substring(0, opening)
			parameter = variables[code.substring(opening + 1, code.length - 1)]
		}
		
		if (Url_map[key])
		{
			if (typeof parameter !== 'undefined')
				url = Url_map[key](parameter)
			else
				url = Url_map[key]
		}
			
		url = url.replace_all('\'', '"')
		
		translation = translation.replace_all(found, '<a href=\'' + url + '\'>')
	}

	translation = translation.replace_all('[/link]', '</a>')
		
	return translation
}

function подгрузить_перевод(перевод, куда)
{
	if (!куда)
		куда = Перевод
		
	Object.for_each(перевод, function(key, translation)
	{
		if (typeof куда[key] === 'undefined')
			куда[key] = translation
		else if (typeof куда[key] === 'object')
			подгрузить_перевод(translation, куда[key])
	})
}