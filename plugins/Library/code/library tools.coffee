читальня = {}

читальня.delete_category_recursive = (_id, пользователь, возврат) ->
	for подраздел in db('library_categories').find({ надраздел: _id })
		читальня.delete_category_recursive(подраздел, пользователь)

	for заметка in db('library_articles').find({ раздел: _id })
		читальня.delete_article(заметка, пользователь)
	
	читальня.delete_category(_id, пользователь)
			
читальня.delete_category = (_id, пользователь, возврат) ->
	раздел = null
	
	# если вместо _id дали раздел - не искать его второй раз
	if _id._id?
		раздел = _id
	else
		раздел = db('library_categories').get(_id)
	
	пути = db('library_paths').find({ раздел: _id })
	
	system_trash('раздел архива', { раздел: раздел, пути: пути }, пользователь)
	
	db('library_paths').remove({ раздел: _id })
	db('library_categories').remove({ _id: _id })
			
# пути разделов

читальня.путь_к_разделу = (_id) ->
	пути = db('library_paths').find({ раздел: _id }, { limit: 1, sort: [['_id', -1]] })
			
	if пути.пусто()
		throw 'Не найден путь к разделу'
			
	return пути[0].путь

читальня.создать_путь_к_разделу = (раздел, parent) ->
	путь = читальня.новый_путь_к_разделу(раздел, parent)
	читальня.записать_путь_к_разделу(раздел._id, путь)
	return путь
			
читальня.новый_путь_к_разделу = (раздел, parent) ->
	путь = снасти.escape_id(раздел.название)

	if not parent?
		return путь
	
	if typeof parent == 'string'?
		return parent + '/' + путь
	
	if parent._id?
		parent = parent._id

	return читальня.путь_к_разделу(parent) + '/' + путь
			
читальня.записать_путь_к_разделу = (раздел, путь) ->
	db('library_paths').remove({ путь: путь }, { safe: yes })
	return db('library_paths').add({ раздел: раздел, путь: путь }, { safe: yes })

# пути заметок

читальня.путь_к_заметке = (_id) ->
	пути = db('library_paths').find({ заметка: _id }, { limit: 1, sort: [['_id', -1]] })
			
	if пути.пусто()
		throw 'Не найден путь к заметке'
			
	return пути[0].путь
			
читальня.создать_путь_к_заметке = (заметка) ->
	путь = читальня.новый_путь_к_заметке(заметка)
	return читальня.записать_путь_к_заметке(заметка._id, путь)
			
читальня.новый_путь_к_заметке = (заметка) ->
	путь = снасти.escape_id(заметка.название)

	if not заметка.раздел?
		return путь
	
	return читальня.путь_к_разделу(заметка.раздел) + '/' + путь
			
читальня.записать_путь_к_заметке = (заметка, путь) ->
	db('library_paths').remove({ путь: путь }, { safe: yes })
	return  db('library_paths').add({ заметка: заметка, путь: путь }, { safe: yes })

#

читальня.обновить_пути = (раздел) ->
	путь = читальня.создать_путь_к_разделу(раздел, раздел.надраздел)
			
	for подраздел in db('library_categories').find({ надраздел: раздел._id })
		читальня.обновить_пути(подраздел)

	for заметка in db('library_articles').find({ раздел: раздел._id })
		читальня.создать_путь_к_заметке(заметка)
			
	return путь
			
читальня.rename_category = (раздел) ->
	db('library_categories').update({ _id: раздел._id }, { $set: { название: раздел.название } }, { safe: yes })
	читальня.обновить_пути(раздел)
			
читальня.delete_article = (_id, пользователь) ->
	заметка = null
	
	if _id._id?
		заметка = _id
		_id = _id._id
		
	if not заметка?
		заметка = db('library_articles').get(_id)
			
	пути = db('library_paths').find({ заметка: _id })
	
	system_trash('заметка архива', { заметка: заметка, пути: пути }, пользователь)
			
	db('library_paths').remove({ заметка: _id })
	db('library_articles').remove({ _id: _id })
			
#читальня.escape_path = (path) ->
#	return path.split('/').map((part) -> снасти.escape_id(part)).join('/')
			
global.читальня = читальня