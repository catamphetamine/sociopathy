class Цепь
	constructor: ->
		@действия = []
		@номер_действия = 0
		
		process.nextTick =>
			@дальше()
	
	возврат: (откуда) =>
		(ошибка) =>
			if ошибка?
				ловушка = @найти_ловушку откуда
				if ловушка?
					return ловушка.алгоритм ошибка
				console.error "Error:"
				return console.error ошибка
		
			переменные = [].slice.call arguments, 1
			
			действие = @действия[откуда - 1]
			
			#console.log 'возврат из'
			#console.log действие
			#console.log 'переменные'
			#console.log переменные
			
			if not @накапливать()
				return @дальше переменные
			
			if not @переменные?
				@переменные = []
				
			переменные.forEach (переменная) =>
				@переменные[откуда] = переменная
			@сколько_накапливать--
			
			if @выполняются_одновременно > 0
				@выполняются_одновременно--
		
			if not @накапливать()
				переменные = @переменные.trim()
				@переменные = []
				return @дальше переменные
		
	накапливать: () ->
		@сколько_накапливать > 0
	
	следующее_действие: ->
		действие = @действия[@номер_действия + 1 - 1]
		
		if @выполняются_одновременно > 0
			if действие.вид != 'одновременно'
				return
				
		@номер_действия++
		действие
	
	ещё_одно_одновременное: ->
		if not @выполняются_одновременно?
			@выполняются_одновременно = 0
		@выполняются_одновременно++
		
		if not @сколько_накапливать?
			@сколько_накапливать = 0
		@сколько_накапливать++
	
	дальше: (переменные) ->
		действие = @следующее_действие()
		if not действие
			return
		
		#console.log 'выполняем'
		#console.log действие
		#console.log 'переменные'
		#console.log переменные
			
		switch действие.вид
			when 'последовательно'
				действие.алгоритм.apply null, переменные
			when 'одновременно'
				@ещё_одно_одновременное()
				действие.алгоритм.apply null, переменные
				@дальше переменные
			when 'каждый одновременно'
				@сколько_накапливать[откуда] = переменные.length
				переменные.forEach (переменная) ->
					действие.алгоритм.call null, переменная
			when 'каждый последовательно'
				throw 'not implemented'
			when 'ошибка'
				@дальше переменные
		
	найти_ловушку: (номер_действия) ->
		номер_действия++
		while номер_действия <= @действия.length
			действие = @действия[номер_действия - 1]
			if действие.вид == 'ошибка'
				return действие
			номер_действия++
	
	ошибка: (обработчик) ->
		@действия.push { алгоритм: обработчик, вид: 'ошибка' }
		@
		
	сделать: (что) ->
		@добавить_действие что, 'последовательно'

	делать: (что) ->
		@добавить_действие что, 'одновременно'

	все_вместе: (что) ->
		@добавить_действие что, 'каждый одновременно'

	каждый: (что) ->
		@добавить_действие что, 'каждый последовательно'
	
	добавить_действие: (что, вид) ->
		@действия.push { алгоритм: что.bind(@возврат(@действия.length + 1)), вид: вид }
		@
		
module.exports = -> new Цепь