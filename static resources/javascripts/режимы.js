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
		if (режим)
			перейти_в_режим('обычный')
		else
			режим = 'обычный'
			
		проверки_перехода = []
		
		разрешённые_режимы = { обычный: true }
		переходы_разрешены = true
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
	
	режимы.push
	({
		название: 'действия',
		заголовок: text('modes.action'),
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
		
		$(document).trigger('смена_режима', [режим, mode, options])
	
		$('*').unbind('.режим_' + режим)
	
		page.data.режим = {}
	
		режим = mode
		
		if (режим === 'правка')
		{
			$('[editable=true]').each(function()
			{
				$(this)
					.attr('contenteditable', true)
					.on_page('keydown.режим_правка', function(event)
					{
						if (Клавиши.is('Enter', event))
							return false
					})
			})
		}
		
		$('body').attr('mode', описание_режима.название)
		
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
	
	result.initialize_page = function()
	{
		режимы.forEach(function(описание_режима)
		{
			if (описание_режима.название !==  режим)
				$('[mode=' + описание_режима.название + ']').fade_out(0)
		})
	}
	
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
		$(document).trigger('режим_изменения_сохранены')
		
		перейти_в_режим('обычный', { saved: true })
		actions.slide_out_downwards(300, function()
		{
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
		var on_save = options.on_save
		var on_discard = options.on_discard || function()
		{	
			//var загрузка = loading_indicator.show()
			reload_page()
		}
	
		actions = $('.edit_mode_actions').clone()
		actions.appendTo($('body')).move_out_downwards().disableTextSelect()
		
		save_changes_button = text_button.new(actions.find('.done'), { 'prevent double submission': true })
		.does(on_save)
		
		cancel_changes_button = text_button.new(actions.find('.cancel'), { 'prevent double submission': true })
		.does(function()
		{
			on_discard()
			Режим.изменения_отменены()
		})
		
		$(document).on('смена_режима', function(event, из, в)
		{
			if (в === 'правка')
			{
				actions.slide_in_from_bottom()
				
				$('body').addClass('with_actions_on_bottom')
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
					if (options.ok)
						return options.ok(options.загрузка)
					
				if (options.загрузка)
				{
					options.загрузка.hide()
					Режим.разрешить_переходы()
				}
				else
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
			if (!(store[key] instanceof Array))
				store[key] = [store[key]]
				
			return store[key].push(value)
		}
		
		store[key] = value
	}
	
	return result
})()

Режим.enable_in_place_editing_windows = function(container)
{
	Режим.при_переходе({ в: 'правка' }, function()
	{
		container.find('[type="formula"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Formula
			({
				ok: function(data)
				{
					var formula_html
					if (data.display === 'inline')
					{
						formula_html = delimit_formula(data.formula, 'inline')
					}
					else
					{
						formula_html = delimit_formula(data.formula, 'block')
					}
					
					element.attr('formula', data.formula).html(formula_html)
					element.css('display', data.display)
					
					refresh_formulae({ wait_for_load: true, what: element, formula: formula_html })
				},
				open: function()
				{
					var display = this.content.find('.display').hide()
					var input = display.prev('input').hide()
					var label = input.prev('label').hide()
					
					input.val(element.css('display'))
				}
			})
			
			window.form.field('formula').val(element.attr('formula'))
			//window.form.field_setter('display').bind(window)(element.css('display'))
			
			window.open()
		})
		
		container.find('[type="picture"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Picture
			({
				ok: function(data)
				{
					var url = data.url
					
					Visual_editor.tool_helpers.Picture.get_picture_size(url, function(size)
					{
						if (!size)
							return
						
						element.attr
						({
							src: url,
							width: size.width,
							height: size.height
						})
							
						element.css('float', data.float)
					})
				}
			})
			
			window.form.field('url').val(decodeURIComponent(element.attr('src')))
			window.form.field_setter('float').bind(window)(element.css('float'))
							
			window.open()
		})
		
		container.find('[type="hyperlink"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Link
			({
				ok: function(url)
				{
					element.attr('href', url)
				}
			})
			
			window.form.field('url').val(decodeURI(element.attr('href')))
							
			window.open()
		})
		
		function audio_click_handler(clicked, event)
		{
			if (!clicked.find_parent('[contenteditable=true]').exists())
				return
			
			if (clicked.audio_player('is_control'))
			{
				return
			}
			
			event.preventDefault()
			event.stopPropagation()
			
			var element = clicked.find_parent('.audio_player')
			
			var window = Visual_editor.tool_windows.Audio
			({
				ok: function(data)
				{
					Visual_editor.tool_helpers.Audio.refresh_player(element, data)
					element.audio_player('title_element').on('click.in_place_editing', function(event)
					{
						audio_click_handler($(this), event)
					})
				}
			})
			
			window.form.field('url').val(decodeURI(element.audio_player('url')))
			window.form.field('title').val(element.audio_player('title'))
			
			window.open()
		}
		
		container.find('[type="audio"]').audio_player('title_element').on('click.in_place_editing', function(event)
		{
			audio_click_handler($(this), event)
		})
	})
	
	Режим.при_переходе({ из: 'правка' }, function()
	{
		container.find('[type="formula"]').unbind('.in_place_editing')
		container.find('[type="picture"]').unbind('.in_place_editing')
		container.find('[type="hyperlink"]').unbind('.in_place_editing')
		container.find('[type="audio"]').unbind('.in_place_editing')
	})
}

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