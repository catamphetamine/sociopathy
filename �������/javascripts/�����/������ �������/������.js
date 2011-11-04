Article_editor.implement
({
	initialize_tools: function()
	{
		var editor = this.editor
	
		var tools = $('#article_editor_tools')
	
		var Tools = {}
		
		Tools.Error = function(message)
		{
			this.message = message
		}
		
		Tools.Subheading =
		{
			selector: '.subheading',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
				
				if (!editor.caret.has_container('p'))
					throw new Tools.Error('Подзаголовок можно помещать только в абзаце')
				
				var caret
				if (editor.caret.is_in_the_beginning_of_container('p'))
					caret = editor.caret.move_to_container_start('p')
				else if (editor.caret.is_in_the_end_of_container('p'))
					caret = editor.caret.move_to_container_end('p')
				else
				{
					throw new Tools.Error('Подзаголовок можно поместить только в начале или в конце абзаца')
					return
				}
				
				var subheading = $('<h2/>')
				return editor.insert(subheading)
			},
			
			on_success: function(subheading)
			{
				editor.caret.move_to(subheading)
			}
		}
		
		Tools.Citation =
		{
			selector: '.citation',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
		
				var citation = $('<div/>')
				citation.addClass('citation')
				
				var text = $('<span/>')
				text.addClass('text')
				text.text('It is said that if you know your enemies and know yourself, you will not be imperiled in a hundred battles; if you do not know your enemies but do know yourself, you will win one and lose one; if you do not know your enemies nor yourself, you will be imperiled in every single battle.'.trim_trailing_comma())
				
				text.appendTo(citation)

				var author = $('<div/>')
				author.addClass('author')
				author.text('Sun Tzu, The Art of War. Ch. 3, the last sentence.'.trim_trailing_comma())
				
				author.appendTo(citation)
				
				return editor.insert(citation)
			},
			
			on_success: function(citation)
			{
				//editor.caret.move_to(citation)
			}
		}
		
		Tools.List =
		{
			button: new image_button(tools.find('.list span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
		
				var list = $('<ul/>')
				$('<li/>').text('123').appendTo(list)
				return editor.insert(list)
			},
			
			on_success: function(list)
			{
				//editor.caret.move_to(list)
			}
		}
		
		Tools.Picture =
		{
			button: new image_button(tools.find('.picture span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
				
				var picture = $('<img/>')
				picture.addClass('picture')
				picture.css
				({
					'background-image': "url('/картинки/temporary/картинка с личной карточки.jpg')",
					width: '120px',
					height: '120px'
				})
				
				return editor.insert(picture)
			},
			
			on_success: function(picture)
			{
				editor.caret.position_after(picture)
			}
		}
		
		Tools.Undo =
		{
			button: new image_button(tools.find('.undo span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
				
				if (!editor.time_machine.undo())
					info('Это самая ранняя версия заметки')
			},
			
			on_success: function()
			{
			}
		}
		
		Tools.Redo =
		{
			button: new image_button(tools.find('.redo span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Tools.Error('Не нужно ничего выделять')
				
				if (!editor.time_machine.redo())
					info('Это самая поздняя версия заметки')
			},
			
			on_success: function()
			{
			}
		}
		
		Object.each(Tools, function(tool, key)
		{
			var element
			if (tool.selector)
				element = tools.find(tool.selector)
			else if (tools.button)
				element = tool.button.$element
			
			var on_success = tool.on_success || $.noop
			tool.on_success = function(result)
			{
				if ($.browser.mozilla)
					editor.content.focus()
					
				on_success(result)
			}
			
			if (!tool.on_error)
			{
				tool.on_error = function(error)
				{
					info(error.message)
					
					//if ($.browser.mozilla)
						//editor.content.focus()
				}
			}
				
			var action = function()
			{
				try
				{
					tool.on_success(tool.apply())
				}
				catch (error)
				{
					if (error instanceof Tools.Error)
						tool.on_error(error)
					else
						throw error
				}
			}
					
			if (tool.selector)
			{
				element.bind('click', function(event)
				{
					event.preventDefault()
					action()
				})
			}
			else if (tool.button)
			{
				tool.button.does(action)
			}
			
			tool.disable = function()
			{
				element.addClass('disabled')
			}
			
			tool.enable = function()
			{
				element.removeClass('disabled')
			}
		})
		
		this.Tools = Tools
	}
})