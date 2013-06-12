disk = require 'fs'

disk_tools = {}

remove_empty_objects = (map) ->
	for key, value of map
		if typeof map[key] == 'object'
			if Object.пусто(map[key])
				delete map[key]
				continue
			remove_empty_objects(map[key])
			
file_map = (path, options) ->
	if typeof path == 'object'
		options = path
		path = options.path
	
	map = {}
	
	for entry in disk.readdirSync(path)
		if options.exclude? && options.exclude.has((path + '/' + entry).after(options.path).substring(1))
			continue
		
		if disk.statSync(path + '/' + entry).isDirectory()
			if map[entry]?
				throw 'Both file and folder are named «' + entry + '»'
			map[entry] = file_map(path + '/' + entry, options)
		else
			dot_position = entry.lastIndexOf('.')
			
			if dot_position < 0
				continue
			
			title = entry.substring(0, dot_position)
			extension = entry.substring(dot_position + 1)
			
			if extension + '' == options.type + ''
				if map[title]?
					throw 'Both file and folder are named «' + title + '»'
				map[title] = yes
	
	return map
			
flatten = (map) ->	
	flat = []
	
	flatten_recursive = (map, path) ->
		path_to = (file) ->
			if not path?
				return file
			return path + '/' + file
				
		for key, value of map
			if typeof map[key] == 'object'
				flatten_recursive(map[key], path_to(key))
			else
				flat.add(path_to(key))
	
	flatten_recursive(map)
	
	flat

disk_tools.list_files = (path, options) ->
	if not disk.existsSync(path)
		return []

	options.path = path
	flatten(file_map(options))

map_to_array_map = (map) ->
	array = []
		
	for key, value of map
		if typeof value == 'object'
			array.add({ key: map_to_array_map(value) })
		else if value == yes
			array.add(key)
			
	return array

disk_tools.map_files = (path, options) ->
	if not disk.existsSync(path)
		return []

	options.path = path
	map_to_array_map(file_map(options))

disk_tools.read = (file) ->
	disk.readFileSync(file, 'utf8')

disk_tools.write = (file, content) ->
	disk.writeFileSync(file, content, 'utf8')

disk_tools.exists = (file) ->
	disk.existsSync(file)
	
disk_tools.new_folder = (folder) ->
	disk.mkdirSync(folder)
	
module.exports = disk_tools