function initialize_page()
{
	Режим.подсказка('Вы можете внести свои правки в эту заметку. Для этого потребуется перейти в режим правки.')

	var tools = $('#article_editor_tools')
	tools.disableTextSelect()
	
	var editor = new Editor($('#content > article'), 'section')
	
	var article_editor = new Article_editor(editor)
	
	article_editor.capture_characters()
	article_editor.remap_editing_hotkeys()
	article_editor.insert_line_break_on_enter()
	article_editor.disable_context_menu()
	article_editor.disable_tab()
	
	initialize_tools()
	initialize_editor()
	initialize_actions()
	
	function initialize_tools()
	{
		var tools_wrapper = $('#article_editor_tools_wrapper')
	
		tools_wrapper.bind('disappearing_upwards.scroller', function(event, initialization)
		{
			tools.addClass('sticky')
			event.stopPropagation()
		})
		
		tools_wrapper.bind('fully_appeared_on_top.scroller', function(event, initialization)
		{
			tools.css({ top: 0 }).removeClass('sticky')
			event.stopPropagation()
		})
		
		прокрутчик.watch(tools_wrapper, 0)
		
		// toolbar
		
		article_editor.Tools.Undo.button.disable('Вы ещё не правили эту заметку')
		article_editor.Tools.Redo.button.disable('Вы ещё не правили эту заметку')
		
		editor.bind('content_changed.editor', function(событие, options)
		{
			if (editor.time_machine.can_undo())
				article_editor.Tools.Undo.button.enable()
			else
				article_editor.Tools.Undo.button.disable('Это самая ранняя версия заметки')
			
			if (editor.time_machine.can_redo())
				article_editor.Tools.Redo.button.enable()
			else
				article_editor.Tools.Redo.button.disable('Это самая поздняя версия заметки')
		})
	}
		
	$(document).bind('режим.правка', function(event)
	{
		show_tools()
		
		if ($.browser.mozilla)
			editor.content.focus()
		
		editor.caret.move_to(editor.content.find('p:first').get(0).firstChild)
	})
	
	function initialize_editor()
	{
		$(document).bind('режим.переход', function(event, из, в)
		{
			if (из === 'правка')
				hide_tools()
		})
		
		// при нажатии Ввода на основном заголовке - перейти к первому абзацу
		$('article h1').bind('keypress', function(event)
		{
			if (!Режим.правка())
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					editor.move_caret_to(editor.content.find('p:first'))
					break
			}
		})
	}
	
	function show_tools()
	{
		if (tools.hasClass('sticky'))
		{
			tools.stop_animation()
		
			if (parseFloat(tools.css('top')) === 0)
				tools.move_out_upwards()
				
			tools.opaque().slide_in_from_top()
		}
		else
			tools.css({ top: 0 }).fade_in(0.3)
			
		$('#edit_mode_actions').slide_in_from_bottom()
	}
	
	function hide_tools()
	{
		if (tools.hasClass('sticky'))
			tools.opaque().slide_out_upwards()
		else
			tools.css({ top: 0 }).fade_out(0.3)
			
		$('#edit_mode_actions').slide_out_downwards()
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