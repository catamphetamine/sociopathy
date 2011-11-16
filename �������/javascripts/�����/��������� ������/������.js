Visual_editor.implement
({
	initialize_tool_elements: function()
	{
		var tools = $('.visual_editor_tools')
		tools.disableTextSelect()
		
		this.tools_element = tools
	
		var tools_container = tools.parent()
	
		//var tools_wrapper = $('<div/>')
		//tools_wrapper.addClass('visual_editor_tools_wrapper')
		//tools.wrapAll(tools_wrapper)
	
		tools_container.bind('disappearing_upwards.scroller', function(event, initialization)
		{
			tools.addClass('sticky')
			event.stopPropagation()
		})
		
		tools_container.bind('fully_appeared_on_top.scroller', function(event, initialization)
		{
			tools.css({ top: 0 }).removeClass('sticky')
			event.stopPropagation()
		})
		
		прокрутчик.watch(tools_container, 0)
		
		// toolbar

		this.editor.bind('content_changed.editor', (function(событие, options)
		{
			this.set_proper_tools_state()
		})
		.bind(this))
	},

	set_proper_tools_state: function()
	{
		if (!this.editor.was_content_changed())
		{
			this.Tools.Undo.disable('Вы ещё не правили эту заметку')
			this.Tools.Redo.disable('Вы ещё не правили эту заметку')
		}
		else
		{
			if (this.editor.time_machine.can_undo())
				this.Tools.Undo.enable()
			else
				this.Tools.Undo.disable('Это самая ранняя версия заметки')
			
			if (this.editor.time_machine.can_redo())
				this.Tools.Redo.enable()
			else
				this.Tools.Redo.disable('Это самая поздняя версия заметки')
		}		
	},
	
	show_tools: function()
	{
		var tools = this.tools_element
		
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
	},
	
	hide_tools: function()
	{
		var tools = this.tools_element
	
		if (tools.hasClass('sticky'))
			tools.opaque().slide_out_upwards()
		else
			tools.css({ top: 0 }).fade_out(0.3)
			
		$('#edit_mode_actions').slide_out_downwards()
	},
	
	disable_tools: function()
	{
		Object.each(this.Tools, function(tool)
		{
			tool.disable()
		})
	},
	
	enable_tools: function()
	{
		Object.each(this.Tools, function(tool)
		{
			tool.enable()
		})
		
		this.set_proper_tools_state()
	},
	
	initialize_tools: function()
	{
		var editor = this.editor
	
		var tools = $('.visual_editor_tools')
	
		var Tools = {}
		
		var Error = function(message)
		{
			this.message = message
		}
		
		Tools.Subheading =
		{
			selector: '.subheading',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
				
				if (!editor.caret.has_container('p'))
					throw new Error('Подзаголовок можно помещать только в абзаце')
				
				var caret
				if (editor.caret.is_in_the_beginning_of_container('p'))
					caret = editor.caret.move_to_container_start('p')
				else if (editor.caret.is_in_the_end_of_container('p'))
					caret = editor.caret.move_to_container_end('p')
				else
				{
					throw new Error('Подзаголовок можно поместить только в начале или в конце абзаца')
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

		Tools.Link =
		{
			selector: '.link',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
					// на самом деле - брать выделенное и переводить в ссылку
				
				var link = 'http://google.ru'
				
				var element = $('<a/>')
				element.attr('href', correct_uri(link))
				element.text('one two three')
				
				return editor.insert(element)
			},
			
			on_success: function(link)
			{
				editor.caret.move_to(link)
			}
		}
						
		Tools.Citation =
		{
			selector: '.citation',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
		
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
					throw new Error('Не нужно ничего выделять')
		
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
					throw new Error('Не нужно ничего выделять')
				
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
				editor.caret.move_to(picture)
			}
		}
		
		Tools.Undo =
		{
			button: new image_button(tools.find('.undo span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
				
				if (!editor.time_machine.undo())
					info('Это самая ранняя версия заметки')
			}
		}
		
		Tools.Redo =
		{
			button: new image_button(tools.find('.redo span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
				
				if (!editor.time_machine.redo())
					info('Это самая поздняя версия заметки')
			}
		}
	
		// additional tools
		
		Tools.Formula =
		{
			selector: '.formula',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
				
				var formula = '\\[ f(x,y,z) = 3y^2 z \\left( 3 + \\frac{7x+5}{1 + y^2} \\right).\\]'
				var picture = $('<img/>')
				picture.attr('src', 'http://chart.apis.google.com/chart?cht=tx&chl=' + encodeURIComponent(formula))
				
				return editor.insert(picture)
			},
			
			on_success: function(picture)
			{
				editor.caret.move_to(picture)
			}
		}
		
		Tools.Subscript =
		{
			selector: '.subscript',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
					// на самом деле - брать выделенное и переводить его в регистр
				
				var subscript = $('<sub/>')
				subscript.text('y')
				
				return editor.insert(subscript)
			},
			
			on_success: function(subscript)
			{
				editor.caret.move_to(subscript)
			}
		}
		
		Tools.Superscript =
		{
			selector: '.superscript',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
					// на самом деле - брать выделенное и переводить его в регистр
				
				var superscript = $('<sup/>')
				superscript.text('y')
				
				return editor.insert(superscript)
			},
			
			on_success: function(superscript)
			{
				editor.caret.move_to(superscript)
			}
		}
		
		Tools.Code =
		{
			selector: '.code',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Не нужно ничего выделять')
					// на самом деле - брать выделенное и переводить в код
				
				var code = 'var x = y(z)'
				var tag
				
				if (code.is_multiline())
					tag = 'pre'
				else
					tag = 'code'
				
				var element = $('<' + tag + '/>')
				element.text(code)
				
				return editor.insert(element)
			},
			
			on_success: function(code)
			{
				editor.caret.move_to(code)
			}
		}
		
		// helpers
		
		Object.each(Tools, function(tool, key)
		{
			var element
			if (tool.selector)
				element = tools.find(tool.selector)
			else if (tool.button)
				element = tool.button.$element.parent()
			
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
					if (error instanceof Error)
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
			
			if (!tool.disable)
				tool.disable = function(reason)
				{
					element.addClass('disabled')
					
					if (tool.button)
						tool.button.disable(reason)
				}
			
			if (!tool.enable)
				tool.enable = function()
				{
					element.removeClass('disabled')
					
					if (tool.button)
						tool.button.enable()
				}
		})
		
		this.Tools = Tools
	}
})

// disable on blur / enable on focus
$(function()
{
	$(document).bind('focusin', function(event)
	{
		if (!window.visual_editors)
			return
			
		window.visual_editors.forEach(function(visual_editor)
		{
			if (event.target !== visual_editor.editor.content.get(0))
				visual_editor.disable_tools()
		})
		
		window.visual_editors.forEach(function(visual_editor)
		{
			if (event.target === visual_editor.editor.content.get(0))
				visual_editor.enable_tools()
		})
	})
})

// more tools / less tools
$(function()
{
	var tools = $('.visual_editor_tools')
	var main_tools = tools.find('.main_tools')
	var additional_tools = tools.find('.additional_tools')
	
	var main_tools_height = main_tools.height()

	var show_all_tools = new image_button(tools.find('.more'), { 'auto unlock': false })
	show_all_tools.does(function()
	{
		additional_tools.slide_in_from_top()
		
		show_all_tools.element.fadeOut(function()
		{
			hide_additional_tools.element.fadeIn(function()
			{
				hide_additional_tools.unlock()
			})
		})
	})
	
	var hide_additional_tools = new image_button(tools.find('.less'), { 'auto unlock': false })
	hide_additional_tools.lock()
	hide_additional_tools.does(function()
	{
		additional_tools.slide_out_upwards()
		
		hide_additional_tools.element.fadeOut(function()
		{
			show_all_tools.element.fadeIn(function()
			{
				show_all_tools.unlock()
			})
		})
	})
})