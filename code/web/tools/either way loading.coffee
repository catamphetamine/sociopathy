module.exports = (ввод, options) ->
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

	$ = {}
				
	$.sort = sort
	
	if options.total? && not ввод.данные.всего?
		$.всего = db(options.collection)._.count(options.query)
			
	check_for_earlier_elements = no
			
	if с? || ввод.данные.пропустить?
		if настройки.направление == 'вперёд'
			check_for_earlier_elements = yes
	
	if not с? && not после?
		skip = ввод.данные.пропустить || 0
		$.data = db(options.collection)._.find(options.query, { limit: сколько, sort: [['_id', sort]], skip: skip })
	else
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
			
		$.data = db(options.collection)._.find(Object.merge_recursive({ _id: id_criteria }, options.query), { limit: сколько, sort: [['_id', sort]] })

	# check for more		
	if $.data.length >= сколько
		сравнение_id = null
		
		if sort == 1
			сравнение_id = '$gt'
		else
			сравнение_id = '$lt'
			
		more_id_criteria = {}
		more_id_criteria[сравнение_id] = $.data[$.data.length - 1]._id
		
		more = db(options.collection)._.find(Object.merge_recursive({ _id: more_id_criteria }, options.query), { limit: 1, sort: [['_id', sort]] })
	
		$['есть ещё?'] = more? && not more.пусто()

	# check for "earlier" elements
	if not $.data.пусто() && check_for_earlier_elements
		сравнение_id = null
		
		if sort == 1
			сравнение_id = '$lt'
		else
			сравнение_id = '$gt'
			
		earlier_id_criteria = {}
		earlier_id_criteria[сравнение_id] = $.data[0]._id
		
		earlier = db(options.collection)._.find(Object.merge_recursive({ _id: earlier_id_criteria }, options.query), { limit: 1, sort: [['_id', sort]] })

		$['есть ли предыдущие?'] = !earlier.пусто()
				
	return $