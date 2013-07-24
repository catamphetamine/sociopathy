(function()
{
	page.needs_to_load_content = false
	
	page.load = function()
	{
		Communication_types.for_each(function()
		{
			if (page.data.общение == text('pages.' + this.type + '.communication type'))
			{
				page.data.communication_type = this
				title(text('pages.' + this.type + '.new'))
			}
		})
		
		page.подсказка('отправка нового общения', 'После того, как вы заполните название и текст, нажимите клавиши «Ctrl + Enter»')

		var visual_editor = new Visual_editor('#content > .compose_message > article')

		Клавиши.on(page.get('form .title'), 'Enter', function()
		{
			visual_editor.focus()
		})
				
		var hint = $('<p/>').appendTo(visual_editor.editor.content)
		visual_editor.hint(hint, ' ')
	
		visual_editor.keep_cursor_on_screen()
	
		visual_editor.submit = function()
		{
			var title = page.get('form .title').val().trim()
			
			if (!title)
				return info(text('pages.new communication.title is absent'))
			
			Wiki_processor.parse_and_validate(visual_editor.editor.html(), function(message)
			{
				if (!message)
					return info(text('pages.new communication.message is absent'))
					
				page.Ajax.put('/сеть/' + page.data.communication_type.options['new communication type'],
				{
					название: title,
					сообщение: message,
					кому: page.data.кому
				})
				.ok(function(data)
				{
					go_to(link_to('communication', page.data.communication_type.type, data.id))
				})
			})
		}
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		visual_editor.show_tools()
		
		page.get('form .title').focus()
	}
})()