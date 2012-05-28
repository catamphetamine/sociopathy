Array.prototype.is_empty = () ->
	@length == 0
	
Array.prototype.пусто = () ->
	@is_empty()
	
Array.prototype.trim = () ->
	array = []
	@forEach (element) ->
		if element?
			array.push element
	array
	
Array.prototype.where_am_i = () ->
	try
		this_variable_doesnt_exist['you are here'] += 0
	catch error
		console.log error.stack
	
Array.prototype.has = (element) ->
	@indexOf(element) >= 0

RegExp.escape = (string) ->
	specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g")
	return string.replace(specials, "\\$&")

String.prototype.replace_all = (what, with_what) ->
	regexp = new RegExp(RegExp.escape(what), "g")
	return @replace(regexp, with_what)
	
String.prototype.escape_html = ->
	@replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
	
String.prototype.to_unix_path = ->
	@replace(/\\/g, '/')
	
String.prototype.to_unix_file_name = ->
	if @ == '.' || @ == '..'
		throw 'Invalid Unix file name: ' + @
	@replace(/\//g, encodeURIComponent('/'))
	#.replace(/\|/g, encodeURIComponent('|')).replace(/;/g, encodeURIComponent(';'))
	
Object.merge_recursive = (obj1, obj2) ->
	for ключ, значение of obj2
		#if obj2.hasOwnProperty(ключ)
		if typeof obj2[ключ] == 'object' && obj1[ключ]?
			obj1[ключ] = Object.merge_recursive(obj1[ключ], obj2[ключ])
		else
			obj1[ключ] = obj2[ключ]

	return obj1

Object.выбрать = (названия, object) ->
	if object instanceof Array
		i = 0
		while i < object.length
			object[i] = Object.выбрать(названия, object[i])
			i++
		return object
		
	поля = {}
	for название in названия
		поля[название] = object[название]
	поля
	
Object.get_keys = (object) ->
	keys = []
	for key, value of object
		if object.hasOwnProperty(key)
			keys.push(key)
	keys
	
RegExp.escape = (string) ->
	specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", 'g')
	new String(string).replace(specials, "\\$&")
	
String.prototype.starts_with = (substring) ->
	@indexOf(substring) == 0

String.prototype.ends_with = (substring) ->
	index = @lastIndexOf(substring)
	index >= 0 && index == @length - substring.length
	
Array.prototype.last = () ->
	return if @пусто()
	@[@length - 1]
	
Array.prototype.map_to = (mapper) ->
	result = []
	@forEach (element) ->
		result.push(mapper.bind(element)())
	result
	
Array.prototype.zip = (array) ->
	if array.length != @length
		throw 'Zipped array lengths don\'t match'
		
	result = []
		
	i = 0
	while i < @length
		result.push [@[i], array[i]]
		i++
		
	result