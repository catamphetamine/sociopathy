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
				if (container.is('li') && container.is_empty())
				{
					var list = container.parent()
					
					var next_paragraph = list.next('p')
					
					container.remove()
					
					if (list.is_empty())
						list.remove()
					
					if (next_paragraph.exists())
						return this.editor.caret.move_to(next_paragraph)
					
					return visual_editor.new_paragraph()
				}
				
				var list_item = $('<li/>')
				this.hint(list_item, '…')
				
				this.editor.mark(list_item)
				container.after(list_item)				
				this.editor.caret.move_to(this.editor.unmark())
			},
			'pre': function()
			{
				this.editor.insert('\n')
			},
			'a': function(container)
			{
				if (this.editor.caret.is_in_the_beginning_of_container())
				{
					return visual_editor.new_paragraph({ before: true })
				}
				
				visual_editor.new_paragraph()
			},
			'h1, h2, h3, h4, h5, h6': function(container)
			{
				if (this.editor.caret.is_in_the_beginning_of_container())
				{
					var new_paragraph = this.create_paragraph()
					container.before(new_paragraph)
					this.editor.caret.move_to(new_paragraph)
					return
				}
				
				if (this.editor.caret.is_in_the_end_of_container())
				{
					var new_paragraph = this.create_paragraph()
					container.after(new_paragraph)
					this.editor.caret.move_to(new_paragraph)
					return
				}
			},
			'p': function(container)
			{
				var trim_paragraph = trim_element
				
				if (this.editor.caret.is_in_the_beginning_of_container())
				{
					visual_editor.new_paragraph({ before: true })
					return trim_paragraph(container)
				}
				
				if (this.editor.caret.is_in_the_end_of_container())
				{
					visual_editor.new_paragraph()
					return trim_paragraph(container)
				}
				
				this.editor.insert_html('</p><p ' + this.editor.get_marker_html() + '>')
				var next_paragraph = this.editor.unmark()
				this.editor.caret.move_to(next_paragraph)
			},
			'.author': function(container)
			{
				if (container.parent().is('.citation'))
					this.editor.insert('\n ')
				//	this.editor.insert($('<br/>'))
			},
			'.text': function(container)
			{
				if (container.parent().is('.citation'))
					this.editor.insert('\n ')
			}
		}
	},
	
	insert_line_break_on_enter: function()
	{
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keypress', function(event)
		{
			if (!visual_editor.can_edit())
				return
			
			if (!Клавиши.has('Enter', event))
				return
		
			event.preventDefault()
			event.stopPropagation()
			
			/*
			if (!Клавиши.has('Shift', event))
				if (visual_editor.intercept_enter)
					if (visual_editor.intercept_enter() !== false)
						return
			*/
			
			var container = editor.caret.container()
			
			var container_tag = container.node().tagName.toLowerCase()
			
			var process_enter_key = function()
			{
				var captured = false
				Object.each(visual_editor.line_break_handlers, function(action, selector)
				{
					if (captured)
						return
						
					if (container.is(selector))
					{
						action.bind(visual_editor)(container)
						captured = true
						
						visual_editor.editor.sanitize()
					}
				})
				
				return { captured: captured }
			}
			
			if (container.node() === editor.content.node())
			{
				if (Клавиши.is('Enter', event))
					return visual_editor.enter_pressed_in_container()
			}
			
			var result = process_enter_key()
			
			if (!result.captured)
				visual_editor.enter_pressed(result)
		})
		
		editor.on('keydown', function(event)
		{
			if (visual_editor.is_submission_key_combination(event))
			{
				if (visual_editor.submit)
					return visual_editor.submit()
			}
		})
	},
	
	add_global_hotkey: function()
	{
		var visual_editor = this
		
		$(document).on('keydown.global_hotkey', function(event)
		{
			if (event.target instanceof HTMLInputElement
				|| event.target instanceof HTMLTextAreaElement)
				return
			
			if (!event.target)
				return
			
			if (is_node_editable(event.target))
				return
			
			if (!Клавиши.поймано(Настройки.Клавиши.Писарь.Показать, event))
				return
			
			event.preventDefault()
			event.stopPropagation()
			event.stopImmediatePropagation()
			
			$(document).trigger('show_visual_editor')
			
			//visual_editor.shown = true
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
		
		editor.on('keydown.editor_special_keys', function(event)
		{
			if (!visual_editor.can_edit())
				return
			
			if (Клавиши.is('Delete', event))
			{
				var focused = editor.caret.container()
				
				if (focused.exists() && focused.hasClass('hint'))
				{
					focused.removeClass('hint').text('')
					return false
				}
				
				return
			}
			
			if (Клавиши.is('Backspace', event))
			{
				var focused = editor.caret.container()
				
				if (focused.exists() && focused.hasClass('hint'))
				{
					var previous = focused.prev()
					var next = focused.next()
						
					if (!previous.exists() && !next.exists())
					{
						focused.remove()
						//editor.caret.move_to(focused)
					}
					else
					{
						focused.remove()
						
						if (previous.exists())
							editor.caret.move_to_the_end_of(previous)
						else
							editor.caret.move_to(next)
					}
					
					return false
				}
					
				return
			}
		})
	},
	
	capture_characters: function()
	{
		var visual_editor = this
		var editor = this.editor
		
		editor.on('keydown.editor_characters', function(event)
		{
			if (Клавиши.поймано(Настройки.Клавиши.Писарь.Разрывный_пробел, event))
			{
				if (editor.caret.container().is('.author') && editor.caret.container().parent().is('.citation'))
					return visual_editor.on_break()
				
				if (editor.caret.container().is('li'))
					return visual_editor.on_break()
			
				return visual_editor.on_breaking_space(editor.caret.node().parentNode)
			}
	
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
		
		editor.on('keypress', (function(event)
		{
			// disable editing keys and audio_playes
			if (editor.caret.container('.tex').exists() || editor.caret.container('.audio_player').exists())
			{
				if (!Клавиши.navigating(event))
				{
					if (event)
					{
						event.preventDefault()
						return
					}
				}
			}
			
			if (!visual_editor.can_edit())
				return
				
			if (Клавиши.is('Delete', event) || Клавиши.is('Backspace', event))
			{
				editor.time_machine.snapshot()
				return editor.checkpoint()
			}
			
			var character_code =  event.charCode
			
			if (!character_code)
				return
			
			if (event.altKey || event.ctrlKey)
				return
	
			event.preventDefault()
		
			if (editor.selection.exists())
				editor.selection.cut()
			
			var options = {}
			
			// delete leading <br/> (browser bug)
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
				}
			}
			else if (character === '"')
			{
				var left_quotes = editor.content.html().count('«')
				var right_quotes = editor.content.html().count('»')
				
				var left = editor.caret.left_symbol()
				var right = editor.caret.right_symbol()
				
				if (!left || left === ' ')
					character = '«'
				else if (left && (!right || right.in(')', ',', '.', ':', ';', '!', '*', '-', '+', '=', '/', '\\')))
					character = '»'
				else if (!right || right === ' ')
					character = '»'
				else if (left_quotes === 0)
					character = '«'
				else if (left_quotes === right_quotes)
					character = '«'
				else if (left_quotes === right_quotes + 1)
					character = '»'
				else
					alert('Quote parser error')
				
				return editor.insert(character, options)
			}
			
			editor.insert(character, options)
		})
		.bind(this))
		
		// if you start loading the page, and then alt+tab,
		// and then alt+tab after it's loaded, no keypress event fires
		// (should unbind when unloading)
		//$(document).on('focused', function()
		//{
			//if (!editor.was_content_changed())
			//	editor.focus()
		//})
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
