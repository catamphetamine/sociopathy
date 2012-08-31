var Режим = (function()
{
	var режим

	var режимы = []
	var обещания
	
	var разрешённые_режимы

	var проверки_перехода
	
	var сообщение_о_выключенной_правке = 'Сейчас здесь нечего править'

	var переходы_разрешены
	
	сбросить()
	
	function сбросить()
	{
		проверки_перехода = []
		
		if (режим)
			перейти_в_режим('обычный')
		else
			режим = 'обычный'
			
		разрешённые_режимы = { обычный: true }
		переходы_разрешены = true
		обещания = {}
		
		if (actions)
			actions.remove()
	}
	
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
		заголовок: 'Правка',
		перейти: function(из)
		{
//			$('[editable=true]').attr('contenteditable', true)
		}
	})
	
	режимы.push
	({
		название: 'действия',
		заголовок: 'Действия',
		перейти: function(из)
		{
			//$('[editable=true]').attr('contenteditable', true)
		}
	})
	
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
			var options =
			{
				process: function(element)
				{
					element.find('.enter').on('click', function(event)
					{
						event.preventDefault()
						
						if (!пользователь)
							enter_window.open()
					})
				}
			}
			info('Вы не можете сейчас ничего править, так как вы не вошли в нашу сеть. Если вы являетесь членом нашей сети, <a href=\'#войти\'  class=\'enter\'>войдите</a>. Если же вы не являетесь членом нашей сети, вы можете попробовать <a href=\'http://localhost:8081/прописка\'>прописаться</a>.', options)
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
	
	function перейти_в_режим(mode, options)
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
		
		$(document).trigger('режим.переход', [режим, mode, options])
		$(document).trigger('режим.' + mode)
	
		$('*').unbind('.режим_' + режим)
	
		режим = mode
		
		if (режим === 'правка')
		{
			$('[editable=true]').each(function()
			{
				$(this)
					.attr('contenteditable', true)
					.on_page('keypress.режим_правка', function(event)
					{
						if (Клавиши.is('Enter', event))
							return false
					})
			})
		}
		
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
		$(document).on('keydown', function(event) 
		{
			if (Клавиши.is('Alt', 'Shift', '1', event))
				return перейти_в_режим('обычный')
				
			if (Клавиши.is('Alt', 'Shift', '2', event))
				return перейти_в_режим('правка')
				
			if (Клавиши.is('Alt', 'Shift', '3', event))
				return перейти_в_режим('действия')
		})
	})
	
	var при_переходе_в_режим = function(из_какого, в_какой, действие)
	{
		if ($.isFunction(из_какого))
		{
			действие = из_какого
			в_какой = null
			из_какого = null
		}
		else if ($.isFunction(в_какой))
		{
			действие = в_какой
			
			if (typeof из_какого === 'string')
			{
				в_какой = из_какого
				из_какого = null
			}
			else
			{
				в_какой = из_какого.в
				из_какого = из_какого.из
			}
		}
		
		$(document).on_page('режим.переход', function(event, из, в, options)
		{
			if (в_какой)
				if (в_какой !== в)
					return
					
			if (из_какого)
				if (из_какого !== из)
					return
					
			options = options || {}
					
			options.из = из
			options.в = в
			
			действие(options)
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
	var cancel_changes_button
	
	result.изменения_сохранены = function()
	{
		$(document).trigger('режим.изменения_сохранены')
		
		перейти_в_режим('обычный', { saved: true })
		actions.slide_out_downwards(300, function()
		{
			save_changes_button.unlock()
		})
	}
	
	result.изменения_отменены = function()
	{
		$(document).trigger('режим.изменения_отменены')
		
		перейти_в_режим('обычный', { discarded: true })
		actions.slide_out_downwards(300, function()
		{
			cancel_changes_button.unlock()
		})
	}
	
	result.ошибка_правки = function()
	{
		cancel_changes_button.unlock()
		save_changes_button.unlock()
	}
	
	result.activate_edit_actions = function(options)
	{
		var on_save = options.on_save
		var on_cancel = options.on_cancel || function()
		{	
			//var загрузка = loading_indicator.show()
			Режим.изменения_отменены()
			reload_page()
		}
	
		actions = $('.edit_mode_actions').clone()
		actions.appendTo($('body')).move_out_downwards().disableTextSelect()

		save_changes_button = text_button.new(actions.find('.done'), { 'prevent double submission': true })
		.does(on_save)
		
		cancel_changes_button = text_button.new(actions.find('.cancel'), { 'prevent double submission': true })
		.does(on_cancel)
		
		$(document).on('режим.переход', function(event, из, в)
		{
			if (в === 'правка')	
				actions.slide_in_from_bottom()
		})
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
	
	result.сбросить = function()
	{
		сбросить()
	}
	
	result.при_переходе = при_переходе_в_режим
	
	result.save_changes_to_server = function(options)
	{
		if (options.anything_changed)
			if (!options.anything_changed())
			{
				if (options.загрузка)
				{
					options.загрузка.hide()
					Режим.разрешить_переходы()
				}
				
				return Режим.изменения_сохранены()
			}
			
		Режим.заморозить_переходы()
		var загрузка = options.загрузка || loading_indicator.show()
			
		page.Ajax[options.method || 'post'](options.url, options.data)
		.ошибка(function(ошибка)
		{
			загрузка.hide()
			Режим.разрешить_переходы()
			Режим.ошибка_правки()
			
			error(ошибка)
			
			if (options.error)
				options.error()
		})
		.ok(function()
		{
			if (options.continues !== false)
			{
				загрузка.hide()
				Режим.разрешить_переходы()
				Режим.изменения_сохранены()
			}
			
			if (options.ok)
				options.ok()
		})
	}
	
	return result
})()