Visual_editor.implement
({
	disable_context_menu: function()
	{
		this.editor.bind('contextmenu', function(event)
		{
			if (Режим.правка_ли())
				event.preventDefault()
		})
	},
	
	disable_tab: function()
	{
		this.editor.bind('keypress', function(event)
		{
			if (event.which === Клавиши.Tab)
				event.preventDefault()
		})
	},
	
	insert_line_break_on_enter: function()
	{
		var tags_with_prohibited_line_break = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
		
		var visual_editor = this
		var editor = this.editor
		
		editor.bind('keypress', function(event)
		{
			if (!Режим.правка_ли())
				return
				
			if (event.which !== Клавиши.Enter)
				return
		
			event.preventDefault()
			
			var container = editor.caret.container()
			
			if (container.is('li'))
			{
				var list_item = $('<li/>')
				visual_editor.hint(list_item, 'Введите текст')
				
				editor.mark(list_item)
				container.after(list_item)				
				editor.caret.move_to(editor.unmark())
				return
			}
			
			if (container.is('pre'))
			{
				editor.insert('\n')
				return
			}
			
			//
			
			if (editor.caret.is_in_the_beginning_of_container())
			{
				var containing_paragraph = container.search_upwards('p')
				
				if (Dom_tools.is_first_element(container, containing_paragraph))
				{
					var new_paragraph = $('<p/>')
					container.before(new_paragraph)
					new_paragraph.text(1)
					editor.caret.move_to(new_paragraph)
				}
				
				return
			}
			
			if (editor.caret.is_in_the_end_of_container())
			{
				var containing_paragraph = container.search_upwards('p')
				if (Dom_tools.is_last_element(container, containing_paragraph))
				{
					var new_paragraph = $('<p/>')
					container.after(new_paragraph)
					new_paragraph.text(1)
					editor.caret.move_to(new_paragraph)
				}
				
				return
			}
			
			tags_with_prohibited_line_break.forEach(function(tag)
			{
				if (container.is(tag))
					return
			})
			
			if (!container.is('p'))
				return
				
			editor.insert_html('</p><p ' + editor.get_marker_html() + '>')

			var next_paragraph = editor.unmark()
			editor.caret.move_to(next_paragraph)
				
			editor.content.find('p').each(function()
			{
				paragraph = $(this)
				
				var html = paragraph.html()
				var trimmed_html = cut_off_whitespaces(html)
				
				if (html.length > trimmed_html.length)
					paragraph.html(trimmed_html)
			})
		})
	},
		
	remap_editing_hotkeys: function()
	{
		var editor = this.editor
		
		editor.bind('keypress', (function(event)
		{
			if (!Режим.правка_ли())
				return
				
			if (Клавиши.is('Ctrl', 'z', event))
			{
				this.Tools.Undo.apply()
				event.preventDefault()
			}
			
			if (Клавиши.is('Ctrl', 'Shift', 'z', event) || Клавиши.is('Ctrl', 'y', event))
			{
				this.Tools.Redo.apply()
				event.preventDefault()
			}
			
			if (Клавиши.is('Ctrl', 'x', event))
			{
				event.preventDefault()
			}
			
			if (Клавиши.is('Ctrl', 'v', event) || Клавиши.is('Shift', 'Insert', event))
			{
				event.preventDefault()
			}
		})
		.bind(this))
	},
		
	capture_breaking_space: function()
	{
		var editor = this.editor
		
		editor.bind('keypress', function(event)
		{
			if (!Режим.правка_ли())
				return
				
			if (Клавиши.is('Shift', 'Space', event))
			{
				event.preventDefault()
			
				var container = editor.caret.native_container()
				var container_tag = container.parentNode
				
				if (container_tag.tagName.toLowerCase() === 'p')
				{
					editor.insert(' ')
					return
				}
				
				var text_node = Dom_tools.append_text_next_to(container_tag, ' ')
				editor.caret.position(text_node, 1)
				return
			}
		})
	},
	
	capture_characters: function()
	{
		var editor = this.editor
		
		editor.bind('keypress', (function(event)
		{
			if (!Режим.правка_ли())
				return
				
			if (!event.charCode)
				return
				
			if (event.altKey || event.ctrlKey)
				return
				
			if (Клавиши.is('Shift', 'Space', event))
				return
		
			event.preventDefault()
			
			if (editor.selection.exists())
				editor.selection.cut()
					
			var options = {}
			
			var container = editor.caret.container()
			if (container.hasClass('hint'))
			{
				container.removeClass('hint')
				options.replace = true
			}
			
			editor.insert(String.fromCharCode(event.charCode), options)
		})
		.bind(this))
	}
})

function cut_off_whitespaces(original_text)
{
	var text = original_text

	text = text.replace(/^\s/g, '').replace(/\s$/g, '')
	text = text.replace(/^\n/g, '').replace(/\n$/g, '')
	text = text.replace(/^&nbsp;/g, '').replace(/&nbsp;$/g, '')
	
	if (text.length == original_text.length)
		return text
	else
		return cut_off_whitespaces(text)
}