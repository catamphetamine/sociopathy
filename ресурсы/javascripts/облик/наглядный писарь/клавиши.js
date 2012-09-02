Visual_editor.implement
({
	disable_context_menu: function()
	{
		var visual_editor = this
		this.editor.on('contextmenu', function(event)
		{
			if (visual_editor.can_edit())
				event.preventDefault()
		})
	},
	
	disable_tab: function()
	{
		this.editor.on('keypress', function(event)
		{
			if (event.which === Клавиши.Tab)
				event.preventDefault()
		})
	},
	
	initialize_line_break_handlers: function()
	{
		var visual_editor = this
		
		this.line_break_handlers =
		{
			'li': function(container)
			{
				var list_item = $('<li/>')
				this.hint(list_item, 'Введите текст')
				
				this.editor.mark(list_item)
				container.after(list_item)				
				this.editor.caret.move_to(this.editor.unmark())
			},
			'pre': function()
			{
				this.editor.insert('\n')
			},
			'h1, h2, h3, h4, h5, h6': function(container)
			{
				if (this.editor.caret.is_in_the_beginning_of_container())
				{
					var new_paragraph = $('<p/>')
					container.before(new_paragraph)
					new_paragraph.addClass('hint')
					new_paragraph.text('Введите текст абзаца')
					this.editor.caret.move_to(new_paragraph)
					return
				}
				
				if (this.editor.caret.is_in_the_end_of_container())
				{
					var new_paragraph = $('<p/>')
					container.after(new_paragraph)
					new_paragraph.addClass('hint')
					new_paragraph.text('Введите текст абзаца')
					this.editor.caret.move_to(new_paragraph)
					return
				}
			},
			'p': function(container)
			{
				if (this.editor.caret.is_in_the_end_of_container())
				{
					return visual_editor.new_paragraph()
				}
				
				this.editor.insert_html('</p><p ' + this.editor.get_marker_html() + '>')
				var next_paragraph = this.editor.unmark()
				this.editor.caret.move_to(next_paragraph)
			}
		}
	},
	
	insert_line_break_on_enter: function()
	{
		var tags_with_prohibited_line_break = ['a']
		// , 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
		
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keydown', function(event)
		{
			if (!visual_editor.can_edit())
				return
				
			if (!Клавиши.is('Ctrl', 'Enter', event))
				return
			
			var container = editor.caret.container()
			
			if (container[0] === editor.content[0])
			{
				event.preventDefault()
				return visual_editor.ctrl_enter_pressed_in_container()
			}
		})
			
		editor.on('keypress', function(event)
		{
			if (!visual_editor.can_edit())
				return
			
			if (!Клавиши.has('Enter', event))
				return
			
			//if (!event.which !== Клавиши.Enter)
			//	return
		
			event.preventDefault()
			
			if (Клавиши.is('Shift', 'Enter', event))
				return visual_editor.on_break()
			
			var container = editor.caret.container()
			var container_tag = container[0].tagName.toLowerCase()
			
			var process_enter_key = function()
			{
				var error
				
				var i = 0
				while (i < tags_with_prohibited_line_break.length)
				{
					if (tags_with_prohibited_line_break[i] === container_tag)
					{
						if (container_tag === 'a')
							error = 'Нельзя вставлять разрывы строк в ссылках'
						return { prohibited: error }
					}
					i++
				}
				
				var captured = false
				Object.each(visual_editor.line_break_handlers, function(action, selector)
				{
					if (captured)
						return
						
					if (container.is(selector))
					{
						action.bind(visual_editor)(container)
						captured = true
					}
				})
				
				return { captured: captured }
			}
			
			if (container[0] === editor.content[0])
			{
				if (Клавиши.is('Enter', event))
					return visual_editor.enter_pressed_in_container()
			}
		
			if (Клавиши.is('Ctrl', 'Enter', event))
				return visual_editor.ctrl_enter_pressed_in_container()
				
			var result = process_enter_key()
			
			if (!result.captured)
				visual_editor.enter_pressed(result)
		})
	},
	
	add_global_hotkey: function()
	{
		function is_node_editable(node)
		{
			if (node.getAttribute('contenteditable') == 'true')
				return true
			
			if (node instanceof HTMLDocument)
				return false
			
			if (!(node.parentNode instanceof HTMLDocument))
				return is_node_editable(node.parentNode)
		}
		
		var visual_editor = this
		
		$(document).on('keypress', function(event)
		{
			if (!Клавиши.is(' ', event))
				return
			
			if (!event.target)
				return
			
			if (event.target instanceof HTMLInputElement
				|| event.target instanceof HTMLTextAreaElement)
				return
			
			if (is_node_editable(event.target))
				return
			
			event.preventDefault()
			event.stopPropagation()
			
			$(document).trigger('show_visual_editor')
		})
	},
	
	remap_editing_hotkeys: function()
	{
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keypress', (function(event)
		{
			if (!visual_editor.can_edit())
				return
			
			// можно добавить command z, command c, command v, command x			
			
			// в Хроме не ловится
			if (Клавиши.is('Ctrl', 'z', event))
			{
				this.Tools.Undo.apply()
				return false
			}
			
			// в Хроме не ловится
			if (Клавиши.is('Ctrl', 'Shift', 'z', event) || Клавиши.is('Ctrl', 'y', event))
			{
				this.Tools.Redo.apply()
				return false
			}
			
			/*
			if (Клавиши.is('Ctrl', 'x', event))
				return event.preventDefault()
			
			if (Клавиши.is('Ctrl', 'v', event) || Клавиши.is('Shift', 'Insert', event))
				return event.preventDefault()
			*/
		})
		.bind(this))
	},
		
	capture_special_hotkeys: function()
	{
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keydown', function(event)
		{
			if (!visual_editor.can_edit())
				return
		})
	},
	
	capture_characters: function()
	{
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keydown', function(event)
		{
			if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
				return
			
			visual_editor.store_content()
			
			var keyCode = event.which
			
			if (keyCode === Клавиши.Dot)
			{
				if (editor.caret.text().ends_with('..'))
				{
					editor.caret.collapse_recent_characters(3, '…')
					editor.caret.move()
					return false
				}
				
				editor.insert('.')
				return false
			}
		})
		
		var keypress_happened = false
		
		editor.on('keyup', function(event)
		{
			if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
				return
				
			// if you start loading the page, and then alt+tab,
			// and then alt+tab after it's loaded, no keypress event fires
			if (!keypress_happened)
			{
				visual_editor.restore_content()
				visual_editor.focus()
				//return event.preventDefault()
			}
		})
		
		editor.on('keypress', (function(event)
		{
			keypress_happened = true
			
			if (!visual_editor.can_edit())
				return
				
			if (Клавиши.is('Delete', event) || Клавиши.is('Backspace', event))
			{
				editor.time_machine.snapshot()
				return editor.checkpoint()
			}
			
			var character_code = event.charCode // || event.which
			
			if (!character_code)
				return
				
			if (event.altKey || event.ctrlKey)
				return
				
			//if (Клавиши.is('Shift', 'Space', event))
			//	return
		
			event.preventDefault()
			
			if (editor.selection.exists())
				editor.selection.cut()
					
			var options = {}
			
			if (editor.content[0].firstChild)
				if (editor.content[0].firstChild.tagName)
					if (editor.content[0].firstChild.tagName.toLowerCase() === 'br')
						editor.content[0].removeChild(editor.content[0].firstChild)
			
			var character = String.fromCharCode(character_code)

			if (character === ' ')
			{
				var text = editor.caret.text()
				if (text)
				{
					if (text.ends_with(' -'))
						return editor.caret.collapse_recent_characters(2, ' — ')
					else if (text.ends_with(' '))
						return visual_editor.on_breaking_space(editor.caret.node().parentNode)
				}
			}
			else if (character === '"')
			{
				var left_quotes = editor.content.html().count('«')
				var right_quotes = editor.content.html().count('»')
				if (left_quotes === 0)
					character = '«'
				else if (left_quotes === right_quotes)
					character = '«'
				else if (left_quotes === right_quotes + 1)
					character = '»'
				else alert('Quote parser error')
				
				return editor.insert(character, options)
			}
			
			editor.insert(character, options)
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