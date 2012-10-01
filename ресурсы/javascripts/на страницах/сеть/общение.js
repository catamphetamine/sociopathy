(function()
{
	function общение_во_множественном_числе()
	{
		switch (page.data.общение)
		{
			case 'беседа':
				return 'беседы'
			
			case 'обсуждение':
				return 'обсуждения'
		}
	}
	
	page.load = function()
	{
		var visual_editor = new Visual_editor('#content > .compose_message > article')
		
		var hint = $('<p/>').appendTo(visual_editor.editor.content)
		visual_editor.hint(hint, 'Вводите сообщение здесь')
	
		visual_editor.keep_cursor_on_screen()
	
		visual_editor.ctrl_enter_pressed_in_container = function()
		{
			var message = Wiki_processor.parse_and_validate(visual_editor.editor.html())
			
			if (!message)
				return
				
			page.Ajax.put('/приложение/сеть/' + page.data.общение,
			{
				название: page.get('form .title').val(),
				сообщение: message,
				кому: page.data.кому
			})
			.ok(function(data)
			{
				go_to('/сеть/' + общение_во_множественном_числе() + '/' + data.id)
			})
		}
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		visual_editor.show_tools()
		
		page.get('form .title').focus()
	}
})()