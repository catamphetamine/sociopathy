disk = require 'fs'

languages_path = __dirname + '/../../static resources/international'

translations = disk_tools.list_files(languages_path, { type: 'json' })

global.Url_map = {}

for translation in translations
	texts = JSON.parse(disk_tools.read(languages_path + '/' + translation + '.json'))
	
	language = translation
	slash = language.indexOf('/')
	if slash >= 0
		language = language.substring(0, slash)
		
	global.Url_map[language] = texts.url