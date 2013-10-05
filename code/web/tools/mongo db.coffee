mongoskin = require 'mongoskin'
mongodb = require 'mongodb'

global.db = (collection) ->
	mongo = хранилище.collection(collection)
	
	api = {}
	
	api.find_one = (query, options) ->
		query = query || {}
		options = options || {}
		
		if typeof query == 'string'
			query = { _id: mongo.id(query) }
		else if query.toHexString?
			query = { _id: query }
		
		mongo.findOne.fiberize(mongo)(query, options)
	
	api.find_just_one = (query, options) ->
		query = query || {}
		options = options || {}
		
		options.limit = 1
		
		found = api.find(query, options)
		if not found.пусто()
			return found[0]
	
	api.count = mongo.count.fiberize(mongo)
	
	api.find = (query, options) ->
		query = query || {}
		options = options || {}
		
		object = mongo.find(query, options)
		object.toArray.fiberize(object)()

	api.update = (query, data, options) ->
		query = query || {}
		data = data || {}
		options = options || {}
		
		if not options.safe?
			options.safe = yes
			
		if query.toHexString?
			query = { _id: query._id }
		
		mongo.update.fiberize(mongo)(query, data, options)
		
	api.save = (data, options) ->
		data = data || {}
		options = options || {}
		
		if not options.safe?
			options.safe = yes
		
		mongo.save.fiberize(mongo)(data, options)
		
	api.insert = api.save
	
	api.remove = (object) ->
		if object._id?
			return mongo.remove.fiberize(mongo)(_id: object._id)
		return mongo.remove.fiberize(mongo)(object)
		
	api.drop = mongo.drop.fiberize(mongo)
	api.index = mongo.ensureIndex.fiberize(mongo)
	
	mongo._ = api
	mongo

mongoskin.SkinCollection.prototype.exists = ->
	db = @skinDb
	find = db.collectionNames.fiberize(db)
	collection = @collectionName	
	return not find(collection).пусто()
				
exports.open = (options) ->
	server = new mongodb.Server(options.server.host, options.server.port, options.server)

	skin_server = new mongoskin.SkinServer(server)
	
	db = new mongodb.Db(options.database.name, server, options.database)
	store = new mongoskin.SkinDb(db, options.database.username, options.database.password)
	
	store.create_collection = (name, options) ->
		if store.collection(name).exists()
			return
		
		options = options || {}
		
		if options instanceof Array
			options = { indexes: options }
				
		#try
		#	db(name)._.drop()
		#catch ошибка
		#	if ошибка.message != 'ns not found'
		#		console.error ошибка
		#		throw ошибка
			
		store.create(name, options.options)
	
		if options.indexes?
			for pair in options.indexes
				global.db(name)._.index(pair[0], pair[1])

	return store