class Цепь
	debug: no

	именованные_переменные: {}
	
	остановлена: no
	
	constructor: (вид) ->
		снасти = require ('./tools')

		@действия = []
		@номер_действия = 0
		
		@обработчик_ошибок_по_умолчанию = (ошибка) ->
			ошибка = снасти.ошибка(ошибка)
			console.error ошибка
			
		if вид?
			if typeof вид == 'function'
				@callback = вид
				@обработчик_ошибок_по_умолчанию = (ошибка) =>
					@callback(снасти.ошибка(ошибка))
			else
				switch вид
					when 'web'
						вывод = arguments[1]
						if not вывод?
							console.error 'no web output'
							[].where_am_i()
							throw 'no web output'
						@обработчик_ошибок_по_умолчанию = (ошибка) ->
							if ошибка.display_this_error?
								console.error ошибка.error
								вывод.send ошибка: ошибка.error
							else
								ошибка = снасти.ошибка(ошибка)
								console.error ошибка
								вывод.send ошибка: yes
					when 'websocket'
						соединение = arguments[1]
						@обработчик_ошибок_по_умолчанию = (ошибка) ->
							ошибка = снасти.ошибка(ошибка)
							console.error ошибка
							соединение.emit 'ошибка', ошибка: yes
					else
						@обработчик_ошибок_по_умолчанию = (ошибка) ->
							ошибка = снасти.ошибка(ошибка)
							console.error ошибка
						
		process.nextTick =>
			if @обработчик_ошибок_по_умолчанию?
				@ошибка @обработчик_ошибок_по_умолчанию
			@дальше()
	
	возврат: (откуда, из_какого_поддействия) =>
		функция_возврата = (ошибка) =>
			if @debug
				console.log '==================='
				
			if (@остановлена)
				console.error 'The conveyor is shut down'
				return
			
			if ошибка?
				if @debug
					console.log "Произошла ошибка: #{ошибка}"
					
				ловушка = @найти_ловушку откуда
				
				if ловушка?
					result = ловушка.алгоритм ошибка
					if result != no
						@остановлена = yes
						return
				else
					console.error "Error:"
					return console.error ошибка
		
			переменные = [].slice.call arguments, 1
			данные = переменные[0]
			
			действие = @действия[откуда - 1]
			
			if @debug
				console.log "Действие #{действие.номер} завершено."
				console.log 'Данные, возвращённые действием:'
				console.log данные
			
			if функция_возврата.имя_переменной?
				@именованные_переменные[функция_возврата.имя_переменной] =  данные
		
			if not @накапливать()
				return @дальше данные
			
			if not @переменные?
				@переменные = []
			
			индекс = null
			if из_какого_поддействия?
				индекс = из_какого_поддействия
			else
				индекс = откуда
			
			if @debug
				console.log 'Добавляем к накопленным: '
				console.log  данные
				
			@переменные[индекс] = данные
			@сколько_накапливать--
			
			if @выполняются_одновременно > 0
				@выполняются_одновременно--
		
			if not @накапливать()
				данные = @переменные.trim()
				@переменные = []
				
				if @debug
					console.log 'Накопление завершено.'
					
				return @дальше данные
				
		функция_возврата.в = (имя) =>
			функция_возврата.имя_переменной = имя
			функция_возврата
			
		функция_возврата.переменная = (имя) =>
			@именованные_переменные[имя]
			
		функция_возврата.done = (result) =>
			if @callback?
				return @callback(null, result)
			функция_возврата(null, result)
		
		функция_возврата.error = (error) =>
			if @callback?
				return @callback(error)
			функция_возврата({ error: error, display_this_error: true })
		
		функция_возврата
		
	накапливать: ->
		@сколько_накапливать > 0
	
	добавить_следующим: (действие) ->
		индекс = @номер_действия + 1 - 1
		описание_действия = @действие(действие, 'последовательно')
		описание_действия.номер = @номер_действия
		@действия.splice(индекс, 0, описание_действия)
		индекс++
		while индекс < @действия.length
			if @действия[индекс].номер?
				@действия[индекс].номер++
			индекс++
	
	следующее_действие: ->
		if @остановлена
			return
			
		действие = @действия[@номер_действия + 1 - 1]
			
		if @выполняются_одновременно > 0
			if действие.вид != 'одновременно'
				return
				
		@номер_действия++
		действие
	
	ещё_одно_одновременное: (действие) ->
		@вид_накапливаемого_действия = 'одновременно'
	
		if not @выполняются_одновременно?
			@выполняются_одновременно = 0
		@выполняются_одновременно++
		
		if not @сколько_накапливать?
			@сколько_накапливать = 0
		@сколько_накапливать++
		
		if not @одновременные_действия?
			@одновременные_действия = []
			
		@одновременные_действия.push действие
	
	вид_предыдущего_действия: null,
	
	попробовать_выполнить: (действие) ->
		try
			действие()
		catch ошибка
			@остановлена = yes
			@обработчик_ошибок_по_умолчанию(ошибка)
	
	дальше: (переменные) ->
		действие = @следующее_действие()
		
		if @debug
			console.log '==================='
			if действие?
				if действие.номер > 1
					console.log 'Выполняем действия дальше.'
				else
					console.log 'Начинаем выполнять действия.'
				console.log 'Вид действия: ' + действие.вид
				console.log 'Номер действия: ' + действие.номер
				console.log действие.алгоритм + ''
				console.log 'Переменные, переданные действию:'
				console.log переменные
			else
				console.log 'Действия закончились'
			
		if @накапливать()
			if @вид_предыдущего_действия == 'одновременно' and ((not действие?) or действие.вид != 'одновременно')
				@одновременные_действия.forEach (действие) =>
					@попробовать_выполнить () ->
						действие.привязать()(переменные)
				@одновременные_действия = []

		if not действие?
			return
	
		вид_предыдущего_действия = @вид_предыдущего_действия
		@вид_предыдущего_действия = действие.вид
			
		switch действие.вид
			when 'последовательно'
				if вид_предыдущего_действия == 'одновременно'
					@попробовать_выполнить () ->
						действие.привязать().apply(null, переменные)
				else
					@попробовать_выполнить () ->
						действие.привязать()(переменные)
			when 'одновременно'
				@ещё_одно_одновременное(действие)
				@дальше переменные
			when 'каждый одновременно'
				if переменные.length == 0
					return @дальше переменные
				@сколько_накапливать = переменные.length
				@вид_накапливаемого_действия = 'каждый одновременно'
				переменные.forEach (переменная, индекс) =>
					if @debug
						console.log '==================='
						console.log "Выполняем поддействие #{индекс + 1} с переменной:"
						console.log переменная
					@попробовать_выполнить () =>
						действие.алгоритм.bind(@возврат(действие.номер, индекс + 1))(переменная)
			when 'каждый последовательно'
				действие = действие.привязать()
				for переменная in переменные.reverse()
					do (переменная) =>
						@добавить_следующим () -> действие(переменная)
				@дальше []
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

	действие: (что, вид) ->
		действие = 
			алгоритм: что
			привязать: () => действие.алгоритм.bind(@возврат(действие.номер))
			номер: @действия.length + 1
			вид: вид
				
	добавить_действие: (что, вид) ->
		@действия.push @действие(что, вид)
		@
		
module.exports = Цепь