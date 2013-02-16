module.exports = (ввод, options, возврат) ->
	options.query = options.query || {}
	
	настройки =  {}
	настройки.прихватить_границу = no

	if ввод.данные.раньше == 'true'
		настройки.направление = 'назад'
	else
		настройки.направление = 'вперёд'
		
	if ввод.данные.задом_наперёд
		настройки.задом_наперёд = yes
		
	с = options.с
	после = ввод.данные.после
	сколько = ввод.данные.сколько
	
	if с?
		настройки.прихватить_границу = yes
	else if после?
		настройки.прихватить_границу = no
		
	sort = null

	if настройки.направление == 'вперёд'
		sort = 1
	else if настройки.направление == 'назад'
		sort = -1
		
	if настройки.задом_наперёд?
		sort = -sort
	
	цепь(возврат)
		.сделать ->
			if options.total? && not ввод.данные.всего?
				return db(options.collection).count(options.query, @.в 'всего')
			@.done()
			
		.сделать ->
			if с? || ввод.данные.пропустить?
				if настройки.направление == 'вперёд'
					@._.check_for_earlier_elements = yes

			if not с? && not после?
				skip = ввод.данные.пропустить || 0
				return db(options.collection).find(options.query, { limit: сколько, sort: [['_id', sort]], skip: skip }).toArray(@)

			сравнение_id = null
			
			if sort == 1
				сравнение_id = '$gte'
			else
				сравнение_id = '$lte'
		
			if настройки.прихватить_границу == no
				if сравнение_id == '$gte'
					сравнение_id = '$gt'
				else if сравнение_id == '$lte'
					сравнение_id = '$lt'
					
			id_criteria = {}
			
			boundary = с || после
			
			if typeof boundary == 'string'
				boundary = db(options.collection).id(boundary)
			
			id_criteria[сравнение_id] = boundary
				
			db(options.collection).find(Object.merge_recursive({ _id: id_criteria }, options.query), { limit: сколько, sort: [['_id', sort]] }).toArray(@)

		.сделать (data) ->
			@.$.data = data
			@.done(@.$.data)
			
		.сделать (data) ->
			# check for more
			
			return @.done() if data.length < сколько
			
			сравнение_id = null
			
			if sort == 1
				сравнение_id = '$gt'
			else
				сравнение_id = '$lt'
				
			more_id_criteria = {}
			more_id_criteria[сравнение_id] = data[data.length - 1]._id
			
			db(options.collection).find(Object.merge_recursive({ _id: more_id_criteria }, options.query), { limit: 1, sort: [['_id', sort]] }).toArray(@)
		
		.сделать (more) ->
			@.$['есть ещё?'] = more? && not more.пусто()
			@.done()
				
		.сделать ->
			destination = @.$
			data = @.$.data
				
			if not data.пусто() && @._.check_for_earlier_elements?
				return цепь(@)
					.сделать ->
						сравнение_id = null
						
						if sort == 1
							сравнение_id = '$lt'
						else
							сравнение_id = '$gt'
							
						earlier_id_criteria = {}
						earlier_id_criteria[сравнение_id] = data[0]._id
						
						db(options.collection).find(Object.merge_recursive({ _id: earlier_id_criteria }, options.query), { limit: 1, sort: [['_id', sort]] }).toArray(@)
						
					.сделать (earlier) ->
						destination['есть ли предыдущие?'] = !earlier.пусто()
						@.done()
			@.done()
					
		.сделать ->
			@.done(@.$)