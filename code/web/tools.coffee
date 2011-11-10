адрес = require 'url'

снасти = {}

снасти.получить_настройки = (ввод) ->
	настройки = адрес.parse(ввод.url, true).query
	
	for ключ, значение of настройки
		if (typeof значение is 'string')
			if "#{parseInt(значение)}" == значение
				настройки[ключ] = parseInt(значение)
			else if "#{parseFloat(значение)}" == значение
				настройки[ключ] = parseFloat(значение)

	настройки
	
module.exports = снасти

Array.prototype.is_empty = () ->
	@length == 0
	
Array.prototype.trim = () ->
	array = []
	@forEach (element) ->
		if element?
			array.push element
	array
	
Object.prototype.where_am_i = () ->
	try
		this_variable_doesnt_exist['you are here'] += 0
	catch error
		console.log error.stack