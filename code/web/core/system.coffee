initialization_data = (ввод) ->
	data = {}
	
	data.invites = Options.Invites
		
	data.plugins = {}
	for plugin in Options.Plugins
		data.plugins[plugin] = Plugins[plugin] || {}
	 
	locales = require('./../tools/locale').list(ввод)
	locale = locales.best()
	
	if Options.Language?
		data.язык = Options.Language
		data.language_is_fixed = yes
	else
		data.язык = locale.language
		
	data.страна = locale.country
	
	data.языки = locales.languages()
	
	if Options.Host?
		data.host = Options.Host
	
	if Options.Port?
		data.port = Options.Port
	
	return data

user_data = (ввод) ->
	data = {}
	
	return data

http.get '/initialize', (ввод, вывод) ->
	data =
		site_version: Options.Version
		development: Options.Development
		optimize: Options.Optimize
		initialization_data: initialization_data(ввод)
	
	if пользовательское.пользователь_ли(ввод)
		try
			data.user_data = пользовательское.данные_пользователя(ввод, вывод)
		catch error
			console.error error
			data.user_data = { error: error }
		
	вывод.send(data)
	
http.get '/проверить ссылку', (ввод, вывод) ->
	options = require('url').parse(ввод.данные.url)
	
	options.method = 'HEAD'
	
	request = require('http').request options, (response) ->
		вывод.send('рабочая ссылка': yes, status: response.statusCode)
	
	request.on 'error', (error) ->
		console.log('Http request failed: ' + error.message)
		вывод.send('рабочая ссылка': no)
		
	request.end()