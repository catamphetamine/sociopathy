http.get '/initialize', (ввод, вывод) ->
	data =
		site_version: Options.Version
		development: Options.Development
		
	data.invites = Options.Invites
		
	data.old_plugins = {}
	for plugin in Options.Old_plugins
		data.old_plugins[plugin] = Old_plugins[plugin] || {}
		
	data.plugins = {}
	for plugin in Options.Plugins
		data.plugins[plugin] = Plugins[plugin] || {}
		
	locales = require('./../tools/locale').list(ввод)
	locale = locales.best()
	
	data.язык = locale.language
	data.страна = locale.country
	
	data.языки = locales.languages()

	вывод.send(data)