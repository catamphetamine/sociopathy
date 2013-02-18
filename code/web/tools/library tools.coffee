читальня = {}

читальня.delete_category_recursive = (_id, пользователь, возврат) ->
	for подраздел in db('library_categories')._.find({ надраздел: _id })
		читальня.delete_category_recursive(подраздел, пользователь)

	for заметка in db('library_articles')._.find({ раздел: _id })
		читальня.delete_article(заметка, пользователь)
	
	читальня.delete_category(_id, пользователь)
			
читальня.delete_category = (_id, пользователь, возврат) ->
	раздел = null
	
	# если вместо _id дали раздел - не искать его второй раз
	if _id._id?
		раздел = _id
	else
		раздел = db('library_categories')._.find_one({ _id: _id })
	
	пути = db('library_paths')._.find({ раздел: _id })
	
	system_trash('раздел читальни', { раздел: раздел, пути: пути }, пользователь)
	
	db('library_paths')._.remove({ раздел: _id })
	db('library_categories')._.remove({ _id: _id })
			
# пути разделов

читальня.путь_к_разделу = (_id) ->
	пути = db('library_paths')._.find({ раздел: _id }, { limit: 1, sort: [['_id', -1]] })
			
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
	db('library_paths')._.remove({ путь: путь }, { safe: yes })
	return db('library_paths')._.save({ раздел: раздел, путь: путь }, { safe: yes })

# пути заметок

читальня.путь_к_заметке = (_id) ->
	пути = db('library_paths')._.find({ заметка: _id }, { limit: 1, sort: [['_id', -1]] })
			
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
	db('library_paths')._.remove({ путь: путь }, { safe: yes })
	return  db('library_paths')._.save({ заметка: заметка, путь: путь }, { safe: yes })

#

читальня.обновить_пути = (раздел) ->
			
	console.log(раздел)
	путь = читальня.создать_путь_к_разделу(раздел, раздел.надраздел)
			
	console.log(путь)
			
	for подраздел in db('library_categories')._.find({ надраздел: раздел._id })
		console.log('подраздел')
		console.log(подраздел)
		читальня.обновить_пути(подраздел)

	for заметка in db('library_articles')._.find({ раздел: раздел._id })
		читальня.создать_путь_к_заметке(заметка)
			
	return путь
			
читальня.rename_category = (раздел) ->
	db('library_categories')._.update({ _id: раздел._id }, { $set: { название: раздел.название } }, { safe: yes })
	читальня.обновить_пути(раздел)
			
читальня.delete_article = (_id, пользователь) ->
	заметка = null
	
	if _id._id?
		заметка = _id
		_id = _id._id
		
	if not заметка?
		заметка = db('library_articles')._.find_one({ _id: _id })
			
	пути = db('library_paths')._.find({ заметка: _id })
	
	system_trash('заметка читальни', { заметка: заметка, пути: пути }, пользователь)
			
	db('library_paths')._.remove({ заметка: _id })
	db('library_articles')._.remove({ _id: _id })
			
module.exports = читальня