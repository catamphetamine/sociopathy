initialization_data = (ввод) ->
	data = {}
	
	data.invites = Options.Invites
		
	data.plugins = {}
	for plugin in Options.Plugins
		data.plugins[plugin] = Plugins[plugin] || {}
	 
	locales = require('./../tools/locale').list(ввод)
	locale = locales.best()
	
	data.язык = locale.language
	data.страна = locale.country
	
	data.языки = locales.languages()
	
	return data

user_data = (ввод) ->
	data = {}
	
	return data

http.get '/initialize', (ввод, вывод) ->
	data =
		site_version: Options.Version
		development: Options.Development
		initialization_data: initialization_data(ввод)
	
	try
		data.user_data = пользовательское.данные_пользователя(ввод, вывод)
	catch error
		console.error error
		data.user_data = { error: error }
		
	вывод.send(data)