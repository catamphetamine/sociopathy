(function()
{
	var право_на_правку_получено = false
	
	Режим.пообещать('правка')
	
	var acquiring_edit_lock
	
	var заметка = page.data.заметка
	var неправленная_заметка
		
	var visual_editor
	
	page.load = function()
	{
		Подсказки.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в <a href=\'/помощь/режимы\'>режим правки</a>.')
		Подсказки.ещё_подсказка('Во время правки, для того, чтобы вернуться в режим набора обычного текста, нажмите Shift + Пробел.')
		
		function get_breadcrumbs()
		{
			var link = '/читальня'
			var crumbs = [{ title: 'Читальня', link: link }]
			
			page.data.путь_к_заметке.split('/').forEach(function(раздел_или_заметка)
			{
				link += '/' + раздел_или_заметка
				crumbs.push({ title: раздел_или_заметка , link: link })
			})
			
			return crumbs
		}

		breadcrumbs(get_breadcrumbs())
		
		var conditional = initialize_conditional($('.main_conditional'))
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/заметка читальни.html',
			container: page.get('.main_content'),
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/читальня/заметка',
			parameters: { _id: page.data.заметка },
			get_data: function(data)
			{
				title(data.заметка.название)
			   
				неправленная_заметка =
				{
					title: data.заметка.название,
					content: data.заметка.содержимое
				}

				return data.заметка
			},
			before_done: article_loaded
		}))
	}
	
	page.unload = function()
	{
		$('#article_edit_mode_actions').remove()
		
		if (visual_editor)
			visual_editor.unload()
	}
	
	function article_loaded()
	{
		postprocess_rich_content($('article'))
		
		$(document).trigger('page_initialized')
		
		var main_header = $('article h1')
		
		visual_editor = new Visual_editor('.main_content > article > section')
		
		// изначально в режиме просмотра - отключить снасти
		visual_editor.unbind()
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		visual_editor.can_edit = function() { return Режим.правка_ли() }
		
		visual_editor.paragraphed()
		
		initialize_editor()
		initialize_actions()
	
		function get_title()
		{
			return visual_editor.editor.content.parent().find('> h1').text()
		}
		
		function set_title(title)
		{
			return visual_editor.editor.content.parent().find('> h1').text(title)
		}
		
		Режим.добавить_проверку_перехода(function(из, в)
		{
			if (в === 'правка' || в === 'действия')
			{
				if (право_на_правку_получено)
					return		
					
				Режим.заморозить_переходы()
				acquiring_edit_lock = loading_indicator.show()
				acquire_edit_lock(в)
				return false
			}
		})
		
		Режим.разрешить('правка')
			
		function initialize_editor()
		{
			$(document).on_page('режим.правка', function(event)
			{
				visual_editor.show_tools()
				
				if ($.browser.mozilla)
					visual_editor.editor.content.focus()
				
				visual_editor.editor.caret.move_to(visual_editor.editor.content.find('> *:first'))
			})
			
			$(document).on_page('режим.переход', function(event, из, в)
			{
				if (из === 'правка')
					visual_editor.hide_tools()
			})
			
			// при нажатии Ввода на основном заголовке - перейти к первому абзацу
			main_header.on('keypress', function(event)
			{
				if (!Режим.правка_ли())
					return
					
				if (Клавиши.is('Enter', event))
				{
					event.preventDefault()
					visual_editor.editor.move_caret_to(visual_editor.editor.content.find('p:first'))
				}
			})
		}
		
		var edit_mode_actions
		function initialize_actions()
		{
			edit_mode_actions = $('#article_edit_mode_actions')
			edit_mode_actions.appendTo($('body')).move_out_downwards().disableTextSelect()
		
			save_button = text_button.new(edit_mode_actions.find('.done'), { 'prevent double submission': true })
			.does(function()
			{
				var data =
				{
					_id: заметка,
					title: get_title(),
					content: Wiki_processor.parse_and_validate(visual_editor.editor.content.html(),
					{
						process_element: function(wiki, decorated)
						{
							wiki.attr('author', decorated.attr('author') || пользователь._id)
						}
					})
				}
				
				var loading = loading_indicator.show()
				page.Ajax.put('/приложение/сеть/читальня/заметка', data)
				.ошибка(function(ошибка)
				{
					loading.hide()
					право_на_правку_получено = false
					
					error(ошибка)
					save_button.unlock()
				})
				.ok(function()
				{
					loading.hide()
					право_на_правку_получено = false
					
					edit_mode_actions.slide_out_downwards(300, function()
					{
						save_button.unlock()
					})
					Режим.обычный()
					//info('Правки сохранены')
					
					неправленная_заметка =
					{
						title: data.title,
						content: data.content
					}
				})
			})
			
			cancel_button = text_button.new(edit_mode_actions.find('.cancel'), { 'prevent double submission': true })
			.does(function()
			{
				var loading = loading_indicator.show()
				page.Ajax.delete('/приложение/сеть/черновик',
				{
					что: "заметка",
					_id: заметка
				})
				.ошибка(function(ошибка)
				{
					loading.hide()
					право_на_правку_получено = false
					
					error(ошибка)
					save_button.unlock()
				})
				.ok(function(data)
				{
					loading.hide()
					право_на_правку_получено = false
					
					edit_mode_actions.slide_out_downwards(300, function()
					{
						cancel_button.unlock()
					})
					
					Режим.обычный()
					
					visual_editor.editor.load_content(Wiki_processor.decorate(неправленная_заметка.content))
					
					postprocess_rich_content(visual_editor.editor.get_content())
					
					set_title(неправленная_заметка.title)
				})
			})
			
			$(document).on_page('режим.переход', function(event, из, в)
			{
				if (из === 'правка')
				{
					visual_editor.unbind()
					visual_editor.editor.content.removeAttr('contenteditable')
				}
			})
		}
		
		$(document).on_page('режим.правка', function(event)
		{
			edit_mode_actions.slide_in_from_bottom()
			visual_editor.activate_tools_inside_content()
			visual_editor.editor.content.attr('contenteditable', true)
		})
		
		function acquire_edit_lock(режим)
		{
			page.Ajax.post('/приложение/сеть/получить_право_на_правку_заметки', { _id: заметка })
			.ошибка(function(ошибка)
			{
				acquiring_edit_lock.hide()
				Режим.разрешить_переходы()
				error(ошибка)
			})
			.ok(function(data)
			{
				acquiring_edit_lock.hide()
				
				var кто_правит = data['кто правит']
				if (кто_правит)
				{
					Режим.разрешить_переходы()
					//return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил' : 'она сохранила') + ' внесённые правки (либо ' + (кто_правит.пол === 'мужской' ? 'удалил' : 'удалила') + ' черновик), \n и тогда эта заметка снова станет доступной для правки.')
					return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + /* дыра */ кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил (или отменил)' : 'она сохранила (или отменила)') + ' внесённые правки, \n и тогда эта заметка снова станет доступной для правки.')
				}
				
				право_на_правку_получено = true
				Режим.разрешить_переходы()
				Режим.перейти(режим)
			})
		}
	}
	
	page.needs_initializing = true
})()