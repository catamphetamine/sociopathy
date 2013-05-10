var Режим = (function()
{
	var режим

	var режимы = []
	var обещания
	
	var разрешённые_режимы

	var проверки_перехода
	
	var сообщение_о_выключенной_правке = 'Сейчас здесь нечего править'

	var переходы_разрешены
	var запреты_переходов
	
	function destroy_context_menus()
	{
		(Режим.data('context_menus') || []).for_each(function()
		{
			this.destroy()
		})
	}
	
	сбросить()
	
	function сбросить()
	{
		$('body > .edit_mode_actions.destroyable').remove()

		if (режим)
		{
			destroy_context_menus()
			перейти_в_режим('обычный')
		}
		else
		{
			режим = 'обычный'
			$('body').attr('mode', режим)
		}
		
		проверки_перехода = []
		
		разрешённые_режимы = { обычный: true }
		запреты_переходов = []
		обещания = {}
		
		if (actions)
			actions.remove()
	}
	
	режимы.push
	({
		название: 'обычный',
		заголовок: text('modes.view'),
		перейти: function(из)
		{
		}
	})
	
	режимы.push
	({
		название: 'правка',
		заголовок: text('modes.edit'),
		перейти: function(из)
		{
//			$('[editable=true]').attr('contenteditable', true)
		}
	})
	
	/*
	режимы.push
	({
		название: 'действия',
		заголовок: text('modes.action'),
		перейти: function(из)
		{
			//$('[editable=true]').attr('contenteditable', true)
		}
	})
	*/
	
	function возможен_ли_переход(из, в)
	{
		if (из === в)
			return false
			
		if ($('.dialog_window_veil[destroying!=true]').exists())
		{
			info('Перед переходом в другой режим нужно закрыть все всплывающие окошки')
			return false
		}
			
		if (!переходы_разрешены())
		{
			//console.log('из ' + из + ' в ' + в)
			info(text('modes.switching is frozen'))
			return false
		}
		
		if (!разрешённые_режимы[в])
		{
			var описание_режима = найти_описание_режима(в)
			
			if (обещания[в])
				info(text('modes.unavailable before page loads', { mode: описание_режима.заголовок }))
			else
				info(text('modes.unavailable', { mode: описание_режима.заголовок }))
				
			return false
		}
		
		if (в === 'правка' && !пользователь)
		{
			var options =
			{
				postprocess: function()
				{
					this.find('.enter').on('click', function(event)
					{
						event.preventDefault()
						
						if (!пользователь)
							enter_window.open()
					})
				}
			}
			info(text('modes.log in to edit'), options)
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
		
		destroy_context_menus()
		
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
					$(this).fade_out(0)
			})
			
		$('[mode=' + mode + ']').each(function(element)
			{
				if (this.tagName.toLowerCase() !== 'body')
					$(this).fade_in(0.1)
			})
		
		var описание_режима = найти_описание_режима(mode)
		описание_режима.перейти(режим)
		
		$('body').attr('mode', описание_режима.название)
		
		$(document).trigger('смена_режима', [режим, mode, options])
	
		$('*').unbind('.режим_' + режим)
	
		page.data.режим = {}
	
		режим = mode
		
		if (режим === 'правка')
		{
			$('[editable=true]').each(function()
			{
				var editable = $(this)
				
				if (editable.attr('multiline'))
					return
				
				editable
					.attr('contenteditable', true)
					.on_page('keydown.режим_правка', function(event)
					{
						if (Клавиши.is('Enter', event))
							return false
					})
			})
		}
		
		$(document).trigger('режим', mode)
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
		
		$(document).on_page('смена_режима', function(event, из, в, options)
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
	
	result.on = function(режим, action)
	{
		$(document).on_page('режим', function(event, mode)
		{
			if (mode === режим)
				action()
		})
	}
	
	result.initialize_page = function()
	{
		режимы.forEach(function(описание_режима)
		{
			if (описание_режима.название !==  режим)
				$('[mode=' + описание_режима.название + ']').fade_out(0)
		})
	}
	
	переходы_разрешены = function()
	{
		return запреты_переходов.пусто()
	}
	
	result.заморозить_переходы = function()
	{
		var запрет =
		{
			разморозить: function()
			{
				запреты_переходов.remove(запрет)
			}
		}
		
		запреты_переходов.push(запрет)
		
		return запрет
	}
	
	result.разрешить_переходы = function()
	{
		запреты_переходов = []
	}
	
	var actions
	var save_changes_button
	var cancel_changes_button
	
	result.изменения_сохранены = function()
	{
		$(document).trigger('режим_изменения_сохранены')
		
		перейти_в_режим('обычный', { saved: true })
		actions.slide_out_downwards(300, function()
		{
			$('footer').height(0)
				
			save_changes_button.unlock()
		})
		
		$('body').removeClass('with_actions_on_bottom')
	}
	
	result.изменения_отменены = function()
	{
		$(document).trigger('режим_изменения_отменены')
			
		перейти_в_режим('обычный', { discarded: true })
		actions.slide_out_downwards(300, function()
		{
			cancel_changes_button.unlock()
		})
		
		$('body').removeClass('with_actions_on_bottom')
	}
	
	result.ошибка_правки = function()
	{
		cancel_changes_button.unlock()
		save_changes_button.unlock()
	}
	
	result.activate_edit_actions = function(options)
	{
		var on_save = options.on_save || $.noop
		var on_discard = options.on_discard || function()
		{
			//var загрузка = loading_indicator.show()
			reload_page()
		}
	
		actions = $('.edit_mode_actions').clone().addClass('destroyable')
		actions.appendTo($('body')).move_out_downwards().disableTextSelect()
		
		var actions_height = actions.outerHeight()
		$('footer').height(0)
		
		save_changes_button = text_button.new(actions.find('.done'), { 'prevent double submission': true })
		.does(function()
		{
			page.unsaved_changes = false
			
			on_save()
		})
		
		cancel_changes_button = text_button.new(actions.find('.cancel'), { 'prevent double submission': true })
		.does(function()
		{
			page.unsaved_changes = false
			
			on_discard()
			Режим.изменения_отменены()
		})
		
		$(document).on('смена_режима', function(event, из, в)
		{
			if (в === 'правка')
			{
				actions.slide_in_from_bottom()
				
				$('footer').height(actions_height)
				
				$('body').addClass('with_actions_on_bottom')
				
				page.unsaved_changes = true
			}
		})
	}
	
	result.разрешить = function(название)
	{
		разрешённые_режимы[название] = true
	}
	
	result.запретить = function(название)
	{
		разрешённые_режимы[название] = false
		обещания[название] = false
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
		{
			if (!options.anything_changed.bind(options.data)())
			{
				if (options.continues)
				{
					if (options.ok)
						options.ok(options.загрузка)
						
					return
				}
					
				if (options.загрузка)
				{
					options.загрузка.hide()
					
					Режим.разрешить_переходы()
					Режим.изменения_сохранены()
					
					if (options.ok)
						options.ok(options.загрузка)
						
					return
				}
				
				info('Вы не внесли никаких правок')
				return Режим.изменения_сохранены()
			}
		}

		if (options.validate)
		{
			try
			{
				options.validate.bind(options.data)()
			}
			catch (ошибка)
			{
				if (options.загрузка)
				{
					options.загрузка.hide()
					Режим.разрешить_переходы()
				}
				
				Режим.ошибка_правки()
					
				if (typeof ошибка === 'object')
				{
					if (ошибка.level === 'warning')
						return warning(ошибка.error)
					
					return error(ошибка.error)
				}
				
				return error(ошибка)
			}
		}			
			
		Режим.заморозить_переходы()
		var загрузка = options.загрузка || loading_indicator.show()
			
		Object.for_each(options.data, function(key, value)
		{
			if (typeof value === 'object' || value instanceof Array)
				options.data[key] = JSON.stringify(value)
		})
			
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
		.ok(function(data)
		{
			if (options.ok)
			{
				if (options.continues)
				{
					if (options.ok(загрузка, data) === false)
					{
						загрузка.hide()
						Режим.разрешить_переходы()
						return Режим.ошибка_правки()
					}
					
					return
				}
					
				загрузка.hide()
				Режим.разрешить_переходы()
				
				if (options.ok(data) === false)
					return Режим.ошибка_правки()
			}
			
			загрузка.hide()
			Режим.разрешить_переходы()
			
			Режим.изменения_сохранены()
		})
	}
	
	result.перейти_в_режим = перейти_в_режим

	result.режимы = режимы
	
	result.data = function(key, value, options)
	{
		options = options || {}
		
		var store = page.data.режим
		
		if (typeof value === 'undefined')
			return store[key]
		
		if (options.add)
		{
			if (typeof store[key] === 'undefined')
				return store[key] = [value]
			
			if (!(store[key] instanceof Array))
				store[key] = [store[key]]
				
			return store[key].push(value)
		}
		
		store[key] = value
	}
	
	return result
})()

$(document).on('page_loaded', function() 
{
	if (!first_time_page_loading)
		return
	
	$(document).on('keydown', function(event) 
	{
		Режим.режимы.forEach(function(режим)
		{
			if (Клавиши.поймано(Настройки.Клавиши.Режимы[режим.название.capitalize()], event))
			{
				return Режим.перейти_в_режим(режим.название)
			}
		})
	})
})