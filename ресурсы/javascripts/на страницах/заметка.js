(function()
{
	var право_на_правку_получено = false
	
	Режим.пообещать('правка')
	
	var acquiring_edit_lock
	
	var заметка = page.data.заметка
		
	var visual_editor
		
	page.load = function()
	{
		Подсказки.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в <a href=\'/помощь/режимы\'>режим правки</a>.')
		Подсказки.ещё_подсказка('Во время правки, для того, чтобы вернуться в режим набора обычного текста, нажмите Shift + Пробел.')
		
		var link = '/читальня'
		var crumbs = [{ title: 'Читальня', link: link }]
		
		page.data.путь_к_заметке.split('/').forEach(function(раздел_или_заметка)
		{
			link += '/' + раздел_или_заметка
			crumbs.push({ title: раздел_или_заметка , link: link })
		})
		
		var conditional = initialize_conditional($('.main_conditional'))
		
		breadcrumbs
		(crumbs,
		function()
		{
			new Data_templater
			({
				template_url: '/страницы/кусочки/заметка читальни.html',
				item_container: content.find('div[type=ok]'),
				conditional: conditional
			},
			new  Data_loader
			({
				url: '/приложение/читальня/заметка',
				parameters: { _id: page.data.заметка },
				get_data: function(data)
				{
					title(data.заметка.название)
	
					return data.заметка
				},
				before_done_output: article_loaded
			}))
		},
		function() { conditional.callback('Не удалось получить данные') })
	}
	
	page.unload = function()
	{
		$('#article_edit_mode_actions').remove()
		if (visual_editor)
			visual_editor.unload()
	}
	
	function article_loaded()
	{
		$(document).trigger('page_initialized')
		
		var main_header = $('article h1')
		
		visual_editor = new Visual_editor('#content > article section')
		
		// изначально в режиме просмотра - отключить снасти
		visual_editor.unbind()
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		visual_editor.can_edit = function() { return Режим.правка_ли() }
		
		visual_editor.on_break = function()
		{
			visual_editor.new_paragraph()
		}
		
		var default_on_breaking_space = visual_editor.on_breaking_space
		visual_editor.on_breaking_space = function(container_tag)
		{
			if (container_tag.tagName.toLowerCase() === 'p')
				return visual_editor.editor.insert(' ')
			
			default_on_breaking_space()
		}
		
		visual_editor.enter_pressed_in_container = function()
		{
			var new_paragraph = $('<p/>')
			new_paragraph.addClass('hint')
			new_paragraph.text('Введите текст абзаца')
			visual_editor.editor.insert(new_paragraph)
			visual_editor.editor.caret.move_to(new_paragraph)
		}
		
		initialize_editor()
		initialize_actions()
	
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
					
				switch (event.which)
				{
					case Клавиши.Enter:
						event.preventDefault()
						visual_editor.editor.move_caret_to(visual_editor.editor.content.find('p:first'))
						break
				}
			})
		}
		
		function get_title()
		{
			return visual_editor.editor.content.parent().find('> h1').text()
		}
		
		function set_title(title)
		{
			return visual_editor.editor.content.parent().find('> h1').text(title)
		}
		
		var edit_mode_actions
		function initialize_actions()
		{
			edit_mode_actions = $('#article_edit_mode_actions')
			edit_mode_actions.appendTo($('body')).move_out_downwards().disableTextSelect()
		
			save_button = text_button.new(edit_mode_actions.find('.done'), { 'prevent double submission': true })
			.does(function()
			{
				var loading = loading_indicator.show()
				page.Ajax.put('/приложение/читальня/заметка',
				{
					_id: заметка._id,
					title: get_title(),
					content: visual_editor.editor.content.html()
				})
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
					info('Правки сохранены')
				})
			})
			
			cancel_button = text_button.new(edit_mode_actions.find('.cancel'), { 'prevent double submission': true })
			.does(function()
			{
				var loading = loading_indicator.show()
				page.Ajax.delete('/приложение/черновик,
				{
					что: "заметка",
					_id: заметка._id
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
					
					visual_editor.editor.load_content(заметка.содержимое)
					set_title(заметка.название)
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
			
			/*
			visual_editor.editor.content.find('[type="video"]').on('mouseover.режим_правка', function(event)
			{
				function get_embedded_youtube_video_id(url)
				{
					return /http:\/\/www.youtube-nocookie.com\/embed\/([0-9a-zA-Z\-\_]+)?rel=0&wmode=transparent/i.exec(url)[0]
				}
	
				event.preventDefault()
				var url = $(this).attr('src')
				url = Youtube.Video.url(get_embedded_youtube_video_id(url))
				alert(url)
				visual_editor.Tools.Video.open_dialog_window({ url: url }, { element: $(this) })
			})
			*/
		})
	}
	
	function acquire_edit_lock(режим)
	{
		page.Ajax.post('/приложение/получить_право_на_правку_заметки', { _id: заметка._id })
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
})()