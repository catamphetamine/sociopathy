var право_на_правку_получено = false

function initialize_page()
{
	Подсказки.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в <a href=\'/помощь/режимы\'>режим правки</a>.')
	Подсказки.ещё_подсказка('Во время правки, для того, чтобы вернуться в режим набора обычного текста, нажмите Shift + Пробел.')

	var main_header = $('article h1')
	
	var article_editor = new Visual_editor('#content > article section')
	
	article_editor.initialize_tool_elements()
	
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
		$(document).bind('режим.правка', function(event)
		{
			article_editor.show_tools()
			
			if ($.browser.mozilla)
				article_editor.editor.content.focus()
			
			article_editor.editor.caret.move_to(article_editor.editor.content.find('p:first').get(0).firstChild)
		})
		
		$(document).bind('режим.переход', function(event, из, в)
		{
			if (из === 'правка')
				article_editor.hide_tools()
		})
		
		// при нажатии Ввода на основном заголовке - перейти к первому абзацу
		main_header.bind('keypress', function(event)
		{
			if (!Режим.правка_ли())
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					article_editor.editor.move_caret_to(article_editor.editor.content.find('p:first'))
					break
			}
		})
	}
	
	function initialize_actions()
	{
		var actions = $('#article_edit_mode_actions')
		actions.appendTo($('body')).move_out_downwards().disableTextSelect()
		
		/*
		cancel_button = activate_button(actions.find('.cancel'), { 'prevent double submission': true })
		.does(function()
		{
			info('Здесь удалять черновик')
			actions.slide_out_downwards(300, function()
			{
				cancel_button.unlock()
			})
			save_button.unlock()
			Режим.обычный()
		})
		*/
	
		save_button = activate_button(actions.find('.done'), { 'prevent double submission': true })
		.does(function()
		{
			loading_indicator.show()
			Ajax.post('/приложение/заметка/сохранить', { _id: заметка._id, content: article_editor.editor.content.html() },
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
					
					actions.slide_out_downwards(300, function()
					{
						save_button.unlock()
					})
					Режим.обычный()
					info('Правки сохранены')
				}
			})
		})
		
		$(document).on('режим.переход', function(event, из, в)
		{
			if (в === 'правка')	
				actions.slide_in_from_bottom()
		})
	}
	
	function activate_hyperlinks($elements)
	{
		$elements.on('click.режим_правка', function(event)
		{
			event.preventDefault()
			var url = decodeURIComponent($(this).attr('href'))
			article_editor.Tools.Link.open_dialog_window({ url: url }, { element: $(this) })
		})
	}
	
	function activate_pictures($elements)
	{
		$elements.on('click.режим_правка', function(event)
		{
			event.preventDefault()
			var url = decodeURIComponent($(this).attr('src'))
			article_editor.Tools.Picture.open_dialog_window({ url: url }, { element: $(this) })
		})
	}
	
	function activate_formulas($elements)
	{
		$elements.on('click.режим_правка', function(event)
		{
			event.preventDefault()
			var formula = decodeURIComponent(parseUri($(this).attr('src')).queryKey.chl)
			article_editor.Tools.Formula.open_dialog_window({ formula: formula }, { element: $(this) })
		})
	}
	
	article_editor.Tools.Link.activate = activate_hyperlinks
	article_editor.Tools.Picture.activate = activate_pictures
	article_editor.Tools.Formula.activate = activate_formulas
	
	$(document).bind('режим.правка', function(event)
	{
		activate_hyperlinks(article_editor.editor.content.find('[type="hyperlink"]'))
		activate_pictures(article_editor.editor.content.find('[type="picture"]'))
		activate_formulas(article_editor.editor.content.find('[type="formula"]'))
		
		/*
		article_editor.editor.content.find('[type="video"]').on('mouseover.режим_правка', function(event)
		{
			event.preventDefault()
			var url = $(this).attr('src')
			url = get_youtube_video_url_from_id(get_embedded_youtube_video_id(url))
			alert(url)
			article_editor.Tools.Video.open_dialog_window({ url: url }, { element: $(this) })
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
				//return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил' : 'она сохранила') + ' внесённые правки (либо ' + (кто_правит.пол === 'мужской' ? 'удалил' : 'удалила') + ' черновик), \n и тогда эта заметка снова станет доступной для правки.')
				return warning('<a href=\'/люди/' + кто_правит['адресное имя'] + '\'>' + кто_правит.имя + '</a> уже правит эту заметку. Можете написать ' + (кто_правит.пол === 'мужской' ? 'ему' : 'ей') + ', чтобы ' + (кто_правит.пол === 'мужской' ? 'он сохранил' : 'она сохранила') + ' внесённые правки, \n и тогда эта заметка снова станет доступной для правки.')
			
			право_на_правку_получено = true
			Режим.разрешить_переходы()
			Режим.перейти(режим)
		}
	})
}