get_session_id = (ввод) ->
	ввод.cookies.user
	
module.exports = (request, response, next) ->
	# self-awareness
	if request.session?
		throw 'Session already exists'

	id = get_session_id(request)
	if not id?
		return next()

	request.session =
		id: id
		get: (key, возврат) ->
			global.session.get(id, key, возврат)
		set: (extra_data, возврат) ->
			global.session.set(id, extra_data, возврат)
		'delete': (возврат) ->
			global.session.delete(id, возврат)
		
	next()