(function()
{
	title(text('pages.library.new article.title'))

	page.load = function()
	{
		if (!page.data.раздел)
		{
			return page_error('Нельзя создавать заметки в корне читальни')
			//return error()
		}
		
		var visual_editor = new Visual_editor('#content > .compose_message > article')
		
		var hint = $('<p/>').appendTo(visual_editor.editor.content)
		visual_editor.hint(hint, ' ')
	
		visual_editor.keep_cursor_on_screen()
	
		visual_editor.submit = function()
		{
			Wiki_processor.parse_and_validate(visual_editor.editor.html(), function(content)
			{			
				if (!content)
					return
					
				page.Ajax.put('/приложение/сеть/читальня/заметка',
				{
					название: page.get('form .title').val(),
					содержимое: content,
					раздел: page.data.раздел
				})
				.ok(function(data)
				{
					go_to('/читальня/' + data.путь)
				})
			})
		}
	
		text_button.new(page.get('.save .button')).does(visual_editor.submit)
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		visual_editor.show_tools()
		
		page.get('form .title').focus()
		
		page.get('.save').fade_in(0.3)
	}
	
	page.needs_to_load_content = false
})()