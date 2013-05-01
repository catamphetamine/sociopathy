var Url_map = {}

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
	
	// testing english translation
	//языки = ['en']
	
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
			
			cookie('language', language)
		
			Object.for_each(Перевод.url, function(key, url)
			{
				if (typeof url === 'string')
				{
					if (url.starts_with('function('))
						url = eval(url)
						
					Url_map[key] = url
				}
			})
			
			add_some_standard_url_keys()

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

function has_text(key)
{
	var translation = Перевод
	
	var path = key.split('.')
	while (!path.is_empty())
	{
		translation = translation[path.shift()]
		if (!translation)
			return false
	}
	
	return true
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
		var parameters
		
		if (url.ends_with(')'))
		{
			var code = url
			var opening = code.indexOf('(')
			
			url = code.substring(0, opening)
			parameters = variables[code.substring(opening + 1, code.length - 1)]
		}
		
		var url = link_to(url, parameters)
		
		url = url.replace_all('\'', encodeURIComponent('\''))
		
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

function link_to(key)
{
	var url = key
	
	var parameters = Array.prototype.slice.call(arguments)
	parameters.shift()
	
	if (Url_map[key])
	{
		if (!parameters.пусто())
			url = Url_map[key].apply(this, parameters)
		else
			url = Url_map[key]
	}
	
	return url
}

function add_some_standard_url_keys()
{
	Url_map['user.avatar.small'] = function(user_id) { return text('url.uploaded') + text('pages.people.url') + '/' + user_id + '/' + text('url.user avatar') + '/' + text('url.user avatars.small') + '.jpg' }
	Url_map['user'] = function(id) { return text('pages.people.url') + '/' + id }
	Url_map['new communication'] = function(type) { return text('url.network') + '/' + text('url.new communication') + '/' + type }
	Url_map['communication'] = function(type, id) { return text('url.network') + '/' + text('pages.' + type + '.url section') + '/' + id }
}