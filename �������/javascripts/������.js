var Режим = (function()
{
	var режим

	var режимы = []

	$(function()
	{
		перейти_в_режим('обычный')
	})
	
	режимы.push
	({
		название: 'обычный',
		title: 'default',
		перейти: function(из)
		{
	//		if (из)
	//			info('Обычный режим')
		}
	})
	
	режимы.push
	({
		название: 'правка',
		title: 'edit',
		перейти: function(из)
		{
	//		if (из)
	//			info('Режим правки')
			
			$('[editable=true]').attr('contenteditable', true)
		}
	})
	
	режимы.push
	({
		название: 'помощь',
		title: 'help',
		перейти: function(из)
		{
	//		if (из)
	//			info('Режим помощи')
		}
	})
	
	var проверки_перехода = []
	
	var можно_править = false
	var сообщение_о_выключенной_правке = 'Сейчас здесь нечего править'
	
	function возможен_ли_переход(из, в)
	{
		if (из === в)
			return false

		if (в === 'правка' && !пользователь)
		{
			info('Вы не можете сейчас ничего править, так как вы не вошли в нашу сеть. Если вы являетесь членом нашей сети, <a href=\'#войти\'  class=\'enter\'>войдите</a>. Если же вы не являетесь членом нашей сети, вы можете попробовать <a href=\'http://localhost:8081/прописка\'>прописаться</a>.')
			return false
		}

		if (в === 'правка' && !можно_править)
		{
			info(сообщение_о_выключенной_правке)
			return false
		}
		
		var index = 0
		while (index < проверки_перехода.length)
		{
			if (!проверки_перехода[index](из, в))
				return false
				
			index++
		}
		
		return true
	}
	
	function перейти_в_режим(mode)
	{
		if (!возможен_ли_переход(режим, mode))
			return
								
		if (режим === 'правка')
		{
			if ($.browser.mozilla)
				Editor.deselect()
	
			$('[editable=true]').removeAttr('contenteditable')
		}
		
		if (режим)
			$('[mode=' + режим + ']').each(function()
			{
				if (this.tagName.toLowerCase() !== 'body')
					$(this).hide()
			})
			
		$('[mode=' + mode + ']').each(function(element)
			{
				if (this.tagName.toLowerCase() !== 'body')
					$(this).show()
			})
		
		var описание_режима = найти_описание_режима(mode)
		описание_режима.перейти(режим)
		
		$(document).trigger('режим.переход', [режим, mode])
		$(document).trigger('режим.' + mode)
	
		$('*').unbind('.режим_' + режим)
	
		режим = mode
		
		$('body').attr('mode', описание_режима.название)
	}
	
	function найти_описание_режима(название)
	{
		var найденное
		
		режимы.forEach(function(описание_режима)
		{
			if (описание_режима.название ===  название)
				найденное = описание_режима
		})
		
		return найденное
	}
	
	$(function()
	{
		режимы.forEach(function(описание_режима)
		{
			if (описание_режима.название !==  режим)
				$('[mode=' + описание_режима.название + ']').hide()
		})
	})
	
	$(document).ready(function() 
	{
		$(document).keydown(function(event) 
		{
			// alert(String.fromCharCode(event.which))
			
			if (event.altKey && !event.ctrlKey && event.shiftKey)
			{
				switch(event.keyCode)
				{ 
					case Клавиши.Digit_1:
						перейти_в_режим('обычный')
						break
					case Клавиши.Digit_2: 
						перейти_в_режим('правка')
						break
					case Клавиши.Digit_3: 
						перейти_в_режим('помощь')
						break
				}
			}
			
			/*
			if (!event.altKey && event.ctrlKey && event.shiftKey)
			{
				switch(event.keyCode)
				{ 
					case Клавиши.Spacebar:
						if (режим === 'правка')
							перейти_в_режим('обычный')
						else if (режим === 'обычный')
							перейти_в_режим('правка')
						break
				}
			}
			*/
		})
	})
	
	var переход_в_режим = function(в_какой, из_какого, действие)
	{
		if ($.isFunction(в_какой))
		{
			действие = в_какой
			в_какой = null
			из_какого = null
		}
		else if ($.isFunction(из_какого))
		{
			действие = из_какого
			из_какого = null
		}
		
		$(document).bind('режим.переход', function(event, из, в)
		{
			if (в_какой)
				if (в_какой !== в)
					return
					
			if (из_какого)
				if (из_какого !== из)
					return
					
			действие(в, из)
		})
	}
	
	var подсказка
	
	переход_в_режим('помощь', function()
	{
		if (подсказка)
			info(подсказка)
	})
	
	var назначить_подсказку = function(сообщение)
	{
		if (режим === 'помощь')
			if (сообщение)
				info(сообщение)

		var предыдущая_подсказка = подсказка
		подсказка = сообщение
		return предыдущая_подсказка
	}
	
	var дополнить_подсказку = function(дополнение)
	{
		подсказка += '\n\n' + дополнение
	}
	
	var запомненная_помощь = {}
	var запомнить_помощь = function(название)
	{
		запомненная_помощь[название] = подсказка
	}
	
	var возстановить_помощь = function(название)
	{
		return запомненная_помощь[название]
	}
	
	var result =
	{
		текущий: function() { return режим },
		
		подсказка: назначить_подсказку,
		ещё_подсказка: дополнить_подсказку,
		запомнить_помощь: запомнить_помощь,
		возстановить_помощь: возстановить_помощь,
		//переход_в_режим: переход_в_режим,
		
		добавить_проверку_перехода: function(проверка)
		{
			проверки_перехода.push(проверка)
		},
		
		включить_возможность_правки: function()
		{
			можно_править = true
		},
		
		выключить_возможность_правки: function()
		{
			можно_править = false
		},
		
		можно_будет_править_после_загрузки: function()
		{
			сообщение_о_выключенной_правке = 'Дождитесь загрузки страницы'
		}
	}
	
	режимы.forEach(function(режим)
	{
		result[режим.название] = function()
		{
			return result.текущий() === режим.название
		}
	})
	
	var actions
	var save_changes_button
	
	result.изменения_сохранены = function()
	{
		перейти_в_режим('обычный')
		actions.slide_out_downwards(300, function()
		{
			save_changes_button.unlock()
		})
	}
	
	result.activate_actions = function(on_save) //, on_cancel
	{
		actions = $('#edit_mode_actions')
		actions.appendTo($('body')).move_out_downwards().disableTextSelect()

		save_changes_button = activate_button(actions.find('.done'), { 'prevent double submission': true })
		.does(on_save)
		
		$(document).on('режим.переход', function(event, из, в)
		{
			if (в === 'правка')	
				actions.slide_in_from_bottom()
			//else if (из === 'правка')
			//	actions.slide_out_downwards()
		})
		
		//cancel_button = activate_button(actions.find('.cancel'), { 'prevent double submission': true })
		//.does(on_cancel)	
	}
	
	return result
})()