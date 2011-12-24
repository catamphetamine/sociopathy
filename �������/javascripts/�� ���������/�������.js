function initialize_page()
{
	Режим.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в <a href=\'/помощь/режимы\'>режим правки</a>.')
	Режим.ещё_подсказка('Во время правки, для того, чтобы вернуться в режим набора обычного текста, нажмите Shift + Пробел.')

	var main_header = $('article h1')
	
	var article_editor = new Visual_editor('#content > article section')
	
	article_editor.initialize_tool_elements()
	
	initialize_editor()
	initialize_actions()
		
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
			if (!Режим.правка())
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
		$('#edit_mode_actions').appendTo($('body')).move_out_downwards().disableTextSelect()
		
		cancel_button = activate_button('#edit_mode_actions .cancel', { 'prevent double submission': true })
		.does(function() { info('cancel') })
	
		done_button = activate_button('#edit_mode_actions .done', { 'prevent double submission': true })
		.does(function() { info('save') })
	}
}