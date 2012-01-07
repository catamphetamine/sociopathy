Visual_editor.implement
({
	initialize_tool_elements: function()
	{
		var tools = $('.visual_editor_tools')
		tools.disableTextSelect()
		
		this.tools_element = tools
		tools.floating_top_bar()
			
		// toolbar

		this.editor.bind('content_changed.editor', (function(событие, options)
		{
			this.set_proper_tools_state()
		})
		.bind(this))
		
		initialize_more_less_tools()
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
		this.tools_element.floating_top_bar('show')
	},
	
	hide_tools: function()
	{
		this.tools_element.floating_top_bar('hide')
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
		var visual_editor = this
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
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
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
				visual_editor.hint(subheading, 'Введите текст')
				
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
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.ссылка = function(value)
				{
					if (!value)
						throw new custom_error('Введите адрес ссылки')
				}
				
				this.dialog_window = simple_value_dialog_window
				({
					id: 'visual_editor_hyperlink_window',
					title: 'Ссылка',
					fields:
					[{
						id: 'url',
						description: 'Укажите адрес ссылки',
						validation: 'наглядный_писарь.ссылка'
					}],
					ok: function(url)
					{
						url = correct_uri(encodeURI(url))
						
						if (this.state.element)
						{
							this.state.element.attr('href', url)
							return tool.restore_caret()
						}
						
						var link = $('<a/>')
						link.attr('href', url)
						visual_editor.hint(link, 'Введите текст')
						link.attr('type', 'hyperlink')
						
						tool.restore_caret()
						tool.on_success(editor.insert(link))
					},
					cancel: function()
					{
						tool.restore_caret()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
				this.open_dialog_window()
				return false
			},
			
			on_success: function(link)
			{
				this.activate(link)
				editor.caret.move_to(link)
			}
		}
						
		Tools.Citation =
		{
			selector: '.citation',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
		
				var citation = $('<div/>')
				citation.addClass('citation')
				
				var text = $('<span/>')
				text.addClass('text')
				visual_editor.hint(text, 'Введите текст выдержки')
				//text.text('It is said that if you know your enemies and know yourself, you will not be imperiled in a hundred battles; if you do not know your enemies but do know yourself, you will win one and lose one; if you do not know your enemies nor yourself, you will be imperiled in every single battle.'.trim_trailing_comma())
				
				text.appendTo(citation)

				var author = $('<div/>')
				author.addClass('author')
				visual_editor.hint(author, 'Укажите здесь источник')
				//author.text('Sun Tzu, The Art of War. Ch. 3, the last sentence.'.trim_trailing_comma())
				
				author.appendTo(citation)
				
				return editor.insert(citation)
			},
			
			on_success: function(citation)
			{
				editor.caret.move_to(citation)
			}
		}
		
		Tools.List =
		{
			button: new image_button(tools.find('.list span')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
		
				if (!editor.caret.container().is('p'))
					throw new Error('Список можно поместить только внутри обычного текста')
		
				var list = $('<ul/>')
				var list_item = $('<li/>')
				visual_editor.hint(list_item, 'Введите текст')
				list_item.appendTo(list)
				
				editor.mark(list)
				editor.insert_html('</p>' + list.outer_html() + '<p>')
				return editor.unmark()
			},
			
			on_success: function(list)
			{
				editor.caret.move_to(list)
			}
		}
		
		Tools.Picture =
		{
			button: new image_button(tools.find('.picture span')),
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.картинка = function(value)
				{
					if (!value)
						throw new custom_error('Введите адрес картинки')
				}
				
				this.dialog_window = simple_value_dialog_window
				({
					id: 'visual_editor_image_source_window',
					title: 'Адрес картинки',
					fields:
					[{
						id: 'url',
						description: 'Укажите адрес картинки',
						validation: 'наглядный_писарь.картинка'
					}],
					ok: function(url)
					{
						url = encodeURI(url)
						
						if (this.state.element)
						{
							this.state.element.attr('src', url)
							return tool.restore_caret()
						}
					
						var picture = $('<img/>')
						picture.attr('src', url)
						picture.attr('type', 'picture')
						
						tool.restore_caret()
						tool.on_success(editor.insert(picture))
					},
					cancel: function()
					{
						tool.restore_caret()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
				this.open_dialog_window()
				return false
			},
			
			on_success: function(picture)
			{
				this.activate(picture)
				editor.caret.move_to(picture)
			}
		}
		
		Tools.Undo =
		{
			button: new image_button(tools.find('.undo span')),
			
			apply: function()
			{
				//if (editor.selection.exists())
				//	throw new Error('Выделение пока не поддерживается этим инструментом')
				
				if (!editor.time_machine.undo())
					info('Это самая ранняя версия заметки')
			}
		}
		
		Tools.Redo =
		{
			button: new image_button(tools.find('.redo span')),
			
			apply: function()
			{
				//if (editor.selection.exists())
				//	throw new Error('Выделение пока не поддерживается этим инструментом')
				
				if (!editor.time_machine.redo())
					info('Это самая поздняя версия заметки')
			}
		}
	
		// additional tools
		
		Tools.Formula =
		{
			selector: '.formula',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.формула = function(value)
				{
					if (!value)
						throw new custom_error('Введите код формулы в формате TeX')
				}
				
				this.dialog_window = simple_value_dialog_window
				({
					id: 'visual_editor_formula_window',
					title: 'Формула',
					fields:
					[{
						id: 'formula',
						description: 'Введите формулу (в формате TeX)',
						validation: 'наглядный_писарь.формула'
					}],
					ok: function(formula)
					{
						if (this.state.element)
						{
							this.state.element.attr('src', 'http://chart.apis.google.com/chart?cht=tx&chs=28&chl=' + encodeURIComponent(formula))
							return tool.restore_caret()
						}
						
						var picture = $('<img/>')
						picture.attr('src', 'http://chart.apis.google.com/chart?cht=tx&chs=28&chl=' + encodeURIComponent(formula))
						picture.attr('type', 'formula')
						
						tool.restore_caret()
						tool.on_success(editor.insert(picture))
					},
					cancel: function()
					{
						tool.restore_caret()
					}
				})
			},
	
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
				//var formula = '\\[ f(x,y,z) = 3y^2 z \\left( 3 + \\frac{7x+5}{1 + y^2} \\right).\\]'

				this.open_dialog_window()
				return false
			},
			
			on_success: function(picture)
			{
				this.activate(picture)
				editor.caret.move_to(picture)
			}
		}
		
		Tools.Subscript =
		{
			selector: '.subscript',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
					// на самом деле - брать выделенное и переводить его в регистр
				
				var subscript = $('<sub/>')
				visual_editor.hint(subscript, 'Введите текст')
				
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
					throw new Error('Выделение пока не поддерживается этим инструментом')
					// на самом деле - брать выделенное и переводить его в регистр
				
				var superscript = $('<sup/>')
				visual_editor.hint(superscript, 'Введите текст')
				
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
					throw new Error('Выделение пока не поддерживается этим инструментом')
					// на самом деле - брать выделенное и переводить в код
				
				var element = $('<code/>')
				visual_editor.hint(element, 'Введите код')
				
				return editor.insert(element)
			},
			
			on_success: function(code)
			{
				editor.caret.move_to(code)
			}
		}
		
		Tools.Multiline_code =
		{
			selector: '.multiline_code',
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
					// на самом деле - брать выделенное и переводить в код
				
				var element = $('<pre/>')
				visual_editor.hint(element, 'Введите код')
				
				return editor.insert(element)
			},
			
			on_success: function(code)
			{
				editor.caret.move_to(code)
			}
		}
		
		Tools.Video =
		{
			button: new image_button(tools.find('.video span')),
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.видео = function(value)
				{
					if (!value)
						throw new custom_error('Введите адрес видео на YouTube')
						
					if (!get_youtube_video_id(value))
						throw new custom_error('Неправильный адрес видео на YouTube')
				}
				
				this.dialog_window = simple_value_dialog_window
				({
					id: 'visual_editor_video_window',
					title: 'Видео',
					fields:
					[{
						id: 'url',
						description: 'Введите адрес видео на YouTube',
						validation: 'наглядный_писарь.видео'
					}],
					ok: function(url)
					{
						url = encodeURI(url)
						
						/*
						if (this.state.element)
						{
							this.state.element.attr('src', 'http://www.youtube-nocookie.com/embed/' + get_youtube_video_id(url) + '?rel=0')
							return tool.restore_caret()
						}
						*/
					
						var video = $('<iframe/>')
						video.attr('src', 'http://www.youtube-nocookie.com/embed/' + get_youtube_video_id(url) + '?rel=0')
						video.attr('width', 560)
						video.attr('height', 315)
						video.attr('frameborder', 0)
						video.attr('allowfullscreen', 'true')
						video.attr('type', 'video')
					
						tool.restore_caret()
						tool.on_success(editor.insert(video))
					},
					cancel: function()
					{
						tool.restore_caret()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
				this.open_dialog_window()
				return false
			},
			
			on_success: function(element)
			{
				editor.caret.move_to(element)
			}
		}
		
		Tools.Html =
		{
			selector: '.html',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.html = function(value)
				{
					if (!value)
						throw new custom_error('Введите код Html')
						
					try
					{
						value = $(value).outer_html()
						if (!value)
							throw null
					}
					catch (error)
					{
						throw new custom_error('Неправильный формат кода Html')
					}
				
					if (!value)
						throw new custom_error('Введите код Html')
						
					tool.dialog_window.$element.find('input[name="html"]').val(value)
				}
				
				this.dialog_window = simple_value_dialog_window
				({
					id: 'visual_editor_insert_html_window',
					title: 'Вставка Html',
					fields:
					[{
						id: 'html',
						description: 'Введите код Html',
						validation: 'наглядный_писарь.html'
					}],
					ok: function(html)
					{
						var element = $(html)
						
						tool.restore_caret()
						tool.on_success(editor.insert(element))
					},
					cancel: function()
					{
						tool.restore_caret()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
				
				this.open_dialog_window()
				return false
			},
			
			on_success: function(element)
			{
				editor.caret.move_to(element)
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
					
				on_success.bind(tool)(result)
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
					var result = tool.apply()
					if (result)
						tool.on_success(result)
				}
				catch (error)
				{
					if (error instanceof Error)
						tool.on_error(error)
					else
						throw error
				}
			}

			if (tool.initialize)
				tool.initialize()
			
			tool.open_dialog_window = function(values, state)
			{
				if (values)
				{	
					Object.each(values, function(value, name)
					{
						tool.dialog_window.form.field(name).val(value)
					})
				}
				
				this.backup_caret()
				this.dialog_window.open(state)
			}
			
			tool.backup_caret = function()
			{
				this.caret = editor.caret.get()			
			}
			
			tool.restore_caret = function()
			{
				editor.content.focus()
				editor.caret.set(this.caret)
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
function initialize_more_less_tools()
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
}