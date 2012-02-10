var право_на_правку_получено = false

Режим.пообещать('правка')

function initialize_page()
{	
	Подсказки.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в <a href=\'/помощь/режимы\'>режим правки</a>.')
	Подсказки.ещё_подсказка('Во время правки, для того, чтобы вернуться в режим набора обычного текста, нажмите Shift + Пробел.')

	var main_header = $('article h1')
	
	var visual_editor = new Visual_editor('#content > article section')
	
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
		if (в === 'правка' || в === 'глубокая_правка')
		{
			if (право_на_правку_получено)
				return		
				
			Режим.заморозить_переходы()
			loading_indicator.show()
			acquire_edit_lock(в)
			return false
		}
	})
	
	Режим.разрешить('правка')
		
	function initialize_editor()
	{
		$(document).on('режим.правка', function(event)
		{
			visual_editor.show_tools()
			
			if ($.browser.mozilla)
				visual_editor.editor.content.focus()
			
			visual_editor.editor.caret.move_to(visual_editor.editor.content.find('> *:first'))
		})
		
		$(document).on('режим.переход', function(event, из, в)
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
	
		save_button = activate_button(edit_mode_actions.find('.done'), { 'prevent double submission': true })
		.does(function()
		{
			loading_indicator.show()
			Ajax.post('/приложение/заметка/сохранить',
			{
				_id: заметка._id,
				title: get_title(),
				content: visual_editor.editor.content.html()
			},
			{
				ошибка: function(ошибка)
				{
					loading_indicator.hide()
					право_на_правку_получено = false
					
					error(ошибка)
					save_button.unlock()
				},
				ok: function()
				{
					loading_indicator.hide()
					право_на_правку_получено = false
					
					edit_mode_actions.slide_out_downwards(300, function()
					{
						save_button.unlock()
					})
					Режим.обычный()
					info('Правки сохранены')
				}
			})
		})
		
		cancel_button = activate_button(edit_mode_actions.find('.cancel'), { 'prevent double submission': true })
		.does(function()
		{
			loading_indicator.show()
			Ajax.delete('/приложение/заметка/черновик/удалить',
			{
				_id: заметка._id
			},
			{
				ошибка: function(ошибка)
				{
					loading_indicator.hide()
					право_на_правку_получено = false
					
					error(ошибка)
					save_button.unlock()
				},
				ok: function(data)
				{
					loading_indicator.hide()
					право_на_правку_получено = false
					
					edit_mode_actions.slide_out_downwards(300, function()
					{
						cancel_button.unlock()
					})
					Режим.обычный()
					
					visual_editor.editor.load_content(заметка.содержимое)
					set_title(заметка.название)
				}
			})
		})
		
		$(document).on('режим.переход', function(event, из, в)
		{
			if (из === 'правка')
			{
				visual_editor.unbind()
				visual_editor.editor.content.removeAttr('contenteditable')
			}
		})
	}
	
	$(document).on('режим.правка', function(event)
	{
		edit_mode_actions.slide_in_from_bottom()
		visual_editor.activate_tools_inside_content()
		visual_editor.editor.content.attr('contenteditable', true)
		
		/*
		visual_editor.editor.content.find('[type="video"]').on('mouseover.режим_правка', function(event)
		{
			event.preventDefault()
			var url = $(this).attr('src')
			url = get_youtube_video_url_from_id(get_embedded_youtube_video_id(url))
			alert(url)
			visual_editor.Tools.Video.open_dialog_window({ url: url }, { element: $(this) })
		})
		*/
	})
}

function acquire_edit_lock(режим)
{
	Ajax.post('/приложение/получить_право_на_правку_заметки', { _id: заметка._id },
	{
		ошибка: function(ошибка)
		{
			loading_indicator.hide()
			Режим.разрешить_переходы()
			error(ошибка)
		},
		ok: function(data)
		{
			loading_indicator.hide()
			
			var кто_правит = data['кто правит']
			if (кто_правит)
			{
				Режим.разрешить_переходы()
				//return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил' : 'она сохранила') + ' внесённые правки (либо ' + (кто_правит.пол === 'мужской' ? 'удалил' : 'удалила') + ' черновик), \n и тогда эта заметка снова станет доступной для правки.')
				return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил (или отменил)' : 'она сохранила (или отменила)') + ' внесённые правки, \n и тогда эта заметка снова станет доступной для правки.')
			}
			
			право_на_правку_получено = true
			Режим.разрешить_переходы()
			Режим.перейти(режим)
		}
	})
}