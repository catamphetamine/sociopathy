mongoskin = require 'mongoskin'
mongodb = require 'mongodb'

global.db = (collection) ->
	mongo = хранилище.collection(collection)
	
	api = {}
	
	api.find_one = (query, options) ->
		query = query || {}
		options = options || {}
		
		mongo.findOne.bind_await(mongo)(query, options)
	
	api.find_just_one = (query, options) ->
		query = query || {}
		options = options || {}
		
		options.limit = 1
		
		found = api.find(query, options)
		if not found.пусто()
			return found[0]
	
	api.count = mongo.count.bind_await(mongo)
	
	api.find = (query, options) ->
		query = query || {}
		options = options || {}
		
		object = mongo.find(query, options)
		object.toArray.bind_await(object)()

	api.update = (query, options) ->
		query = query || {}
		options = options || {}
		
		mongo.update.bind_await(mongo)(query, options)
		
	api.save = (query, options) ->
		query = query || {}
		options = options || {}
		
		mongo.save.bind_await(mongo)(query, options)
		
	api.remove = mongo.remove.bind_await(mongo)
	api.drop = mongo.drop.bind_await(mongo)
	api.index = mongo.ensureIndex.bind_await(mongo)
	
	mongo._ = api
	mongo
	
exports.open = (options) ->
	server = new mongodb.Server(options.server.host, options.server.port, options.server)

	skin_server = new mongoskin.SkinServer(server)
	
	db = new mongodb.Db(options.database.name, server, options.database)
	return new mongoskin.SkinDb(db, options.database.username, options.database.password)