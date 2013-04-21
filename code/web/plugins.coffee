disk = require 'fs'

plugins_path = __dirname + '/../../plugins'
plugins_statics_path = __dirname + '/../../static resources/plugins'

#if disk.existsSync(plugin_path)
	
global.Plugins = {}
	
for plugin in Options.Plugins
	console.log 'Loading plugin: ' + plugin
	
	plugin_path = plugins_path + '/' + plugin
	path_to = (what) -> plugin_path + '/' + what
		
	plugin_statics_path = plugins_statics_path + '/' + plugin
	path_to_static = (what) -> plugin_statics_path + '/' + what
		
	info = JSON.parse(disk_tools.read(path_to('info.json')))
	info.title = plugin
	
	if info.code?
		require(path_to('code/' + info.code))
	
	info.client_scripts = disk_tools.map_files(path_to_static('client scripts'), { type: 'js' })
	info.templates = disk_tools.list_files(path_to_static('templates'), { type: 'html' })
	info.pages = disk_tools.list_files(path_to_static('pages'), { type: 'html' })
	info.translation = disk_tools.list_files(path_to_static('translation'), { type: 'json' })
	
	global.Plugins[plugin] = info