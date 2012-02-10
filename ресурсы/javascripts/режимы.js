var Режим = (function()
{
	var режим = 'обычный'

	var режимы = []
	var обещания = {}
	
	var разрешённые_режимы = { обычный: true }
	
	режимы.push
	({
		название: 'обычный',
		заголовок: 'Обычный',
		перейти: function(из)
		{
		}
	})
	
	режимы.push
	({
		название: 'правка',
		заголовок: 'Правка поверх',
		перейти: function(из)
		{
//			$('[editable=true]').attr('contenteditable', true)
		}
	})
	
	режимы.push
	({
		название: 'глубокая_правка',
		заголовок: 'Глубокая правка',
		перейти: function(из)
		{
			//$('[editable=true]').attr('contenteditable', true)
		}
	})
	
	var проверки_перехода = []
	
	var сообщение_о_выключенной_правке = 'Сейчас здесь нечего править'
	
	function возможен_ли_переход(из, в)
	{
		if (из === в)
			return false
			
		if ($('.dialog_window_veil[destroying!=true]').exists())
		{
			info('Перед переходом в другой режим нужно закрыть все всплывающие окошки')
			return false
		}
			
		if (!переходы_разрешены)
		{
			info('Здесь и сейчас переходы между режимами заморожены')
			return false
		}
		
		if (!разрешённые_режимы[в])
		{
			var описание_режима = найти_описание_режима(в)
			
			if (обещания[в])
				info('Переход в режим «' + описание_режима.заголовок + '» будет доступен после загрузки страницы')
			else
				info('Переход в режим «' + описание_режима.заголовок + '» здесь и сейчас не разрешён')
				
			return false
		}
		
		if (в === 'правка' && !пользователь)
		{
			info('Вы не можете сейчас ничего править, так как вы не вошли в нашу сеть. Если вы являетесь членом нашей сети, <a href=\'#войти\'  class=\'enter\'>войдите</a>. Если же вы не являетесь членом нашей сети, вы можете попробовать <a href=\'http://localhost:8081/прописка\'>прописаться</a>.')
			return false
		}

		var index = 0
		while (index < проверки_перехода.length)
		{
			var result = проверки_перехода[index](из, в)
			if (result === false)
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
	
	$(function() 
	{
		$(document).keydown(function(event) 
		{
			if (Клавиши.is('Ctrl', 'Shift', 'Digit_1', event))
				return перейти_в_режим('обычный')
				
			if (Клавиши.is('Ctrl', 'Shift', 'Digit_2', event))
				return перейти_в_режим('правка')
				
			if (Клавиши.is('Ctrl', 'Shift', 'Digit_3', event))
				return перейти_в_режим('глубокая_правка')
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
		
		$(document).on('режим.переход', function(event, из, в)
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
	
	var result =
	{
		текущий: function() { return режим },
		
		добавить_проверку_перехода: function(проверка)
		{
			проверки_перехода.push(проверка)
		}
	}
	
	режимы.forEach(function(режим)
	{
		result[режим.название + '_ли'] = function()
		{
			return result.текущий() === режим.название
		}
	})
	
	режимы.forEach(function(режим)
	{
		result[режим.название] = function()
		{
			перейти_в_режим(режим.название)
		}
	})
	
	var переходы_разрешены = true
	
	result.заморозить_переходы = function()
	{
		переходы_разрешены = false
	}
	
	result.разрешить_переходы = function()
	{
		переходы_разрешены = true
	}
	
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
	
	result.activate_edit_actions = function(options) //, on_cancel
	{
		var on_save = options.on_save
	
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
	
	result.разрешить = function(название)
	{
		разрешённые_режимы[название] = true
	}
	
	result.перейти = function(в)
	{
		перейти_в_режим(в)
	}
	
	result.пообещать = function(в)
	{
		обещания[в] = true
	}
	
	return result
})()