Visual_editor.implement
({
	initialize_tools_container: function()
	{
		var tools = $('.visual_editor_tools')
		var сontainer = $('.visual_editor_tools_container')
		tools.disableTextSelect()
		tools.appendTo(сontainer)
		tools.parent().show()
		
		this.tools_element = tools
			
		// toolbar

		this.editor.on('content_changed.editor', (function(событие, options)
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
				this.backup_caret()
				
				if (editor.selection.exists())
				{
					this.restore_caret()
					throw new Error('Выделение пока не поддерживается этим инструментом')
				}
				
				if (!editor.caret.container().is('p'))
				{
					this.restore_caret()
					throw new Error('Подзаголовок можно помещать только непосредственно в абзаце')
				}
				
				var subheading = $('<h2/>')
				visual_editor.hint(subheading, 'Введите текст подзаголовка')
				
				return editor.insert(subheading, { break_container: true })
			},
			
			on_success: function(subheading)
			{
				editor.caret.move_to(subheading)
			}
		}

		Tools.Bold =
		{
			selector: '.bold',
			
			apply: function()
			{
				this.backup_caret()
				
				if (!editor.selection.exists())
				{
					this.restore_caret()
					throw new Error('Выделите текст')
				}
								
				return editor.selection.wrap($('<b/>'))
			},
			
			on_success: function(element)
			{
				editor.caret.move_to_the_next_element(element)
			}
		}

		Tools.Italic =
		{
			selector: '.italic',
			
			apply: function()
			{
				this.backup_caret()
				
				if (!editor.selection.exists())
				{
					this.restore_caret()
					throw new Error('Выделите текст')
				}
								
				return editor.selection.wrap($('<i/>'))
			},
			
			on_success: function(element)
			{
				editor.caret.move_to_the_next_element(element)
			}
		}

		Tools.Link =
		{
			selector: '.link',
			
			type_attribute: 'hyperlink',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.ссылка = function(value, callback)
				{
					if (!value)
						return callback({ error: 'Введите адрес ссылки' })
						
					callback()
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
						visual_editor.hint(link, 'Введите текст ссылки')
						tool.mark_type(link)
						
						tool.restore_caret()
						tool.on_success(editor.insert(link))
					},
					on_open: function()
					{	
						tool.backup_caret()
					},
					on_cancel: function()
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
				
				// иначе в хроме будет курсор в начале, но как бы перед самой ссылкой
				if ($.browser.webkit)
					return editor.caret.move_to(link, 1)
				editor.caret.move_to(link)
			},
			
			on_element_click: function()
			{
				var url = decodeURIComponent($(this).attr('href'))
				visual_editor.Tools.Link.open_dialog_window({ url: url }, { element: $(this) })
				return false
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
				
				return editor.insert(citation, { break_container: true })
			},
			
			on_success: function(citation)
			{
				editor.caret.move_to(citation)
			}
		}
		
		Tools.List =
		{
			button: new image_button(tools.find('.list > *')),
			
			apply: function()
			{
				if (editor.selection.exists())
					throw new Error('Выделение пока не поддерживается этим инструментом')
		
				if (!editor.caret.container().is('p') && editor.caret.container()[0] !== editor.content[0])
					throw new Error('Список можно поместить только внутри обычного текста')
		
				var list = $('<ul/>')
				var list_item = $('<li/>')
				visual_editor.hint(list_item, 'Введите текст')
				list_item.appendTo(list)
				
				return editor.insert(list, { break_container: true })
			},
			
			on_success: function(list)
			{
				editor.caret.move_to(list)
			}
		}
		
		Tools.Picture =
		{
			button: new image_button(tools.find('.picture > *')),
			
			type_attribute: 'picture',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.картинка = function(url, callback)
				{
					if (!url)
						return callback({ error: 'Введите адрес картинки' })
						
					image_exists(url, function(result)
					{
						if (result.error)
							return callback({ error: 'Картинка не найдена' })
						
						callback()
					})
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
						url = encodeURI(url.collapse_lines())
						
						if (this.state.element)
						{
							this.state.element.attr('src', url)
							return tool.restore_caret()
						}
					
						var loading = loading_indicator.show()
						get_image_size(url, function(size)
						{
							loading.hide()
							
							if (size.error)
							{
								error('Не удалось загрузить картинку. Можете попробовать ещё раз.')
								return tool.restore_caret()
							}
							
							var picture = $('<img/>')
							picture.attr('src', url)
							picture.attr('width', size.width)
							picture.attr('height', size.height)
							
							tool.mark_type(picture)
							
							tool.restore_caret()
							tool.on_success(editor.insert(picture))
						})
					},
					on_open: function()
					{	
						tool.backup_caret()
					},
					on_cancel: function()
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
			},
			
			on_element_click: function()
			{
				var url = decodeURIComponent($(this).attr('src'))
				this.open_dialog_window({ url: url }, { element: $(this) })
				return false
			}
		}
		
		Tools.Undo =
		{
			button: new image_button(tools.find('.undo > *')),
			
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
			button: new image_button(tools.find('.redo > *')),
			
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
			
			type_attribute: 'formula',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.формула = function(value, callback)
				{
					if (!value)
						return callback({ error: 'Введите код формулы в формате TeX' })
						
					callback()
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
						formula = encodeURIComponent(formula.collapse_lines())
						var url = 'http://chart.apis.google.com/chart?cht=tx&chs=28&chl=' + formula
					
						var loading = loading_indicator.show()
						
						var picture = this.state.element
						if (picture)
						{
							return get_image_size(url, function(size)
							{
								loading.hide()
								
								if (size.error)
								{
									error('Не удалось загрузить картинку. Можете попробовать ещё раз.')
									return tool.restore_caret()
								}
							
								picture.attr('src', url)
								picture.attr('width', size.width)
								picture.attr('height', size.height)
							
								tool.restore_caret()
							})
						}
						
						get_image_size(url, function(size)
						{
							loading.hide()
							
							if (size.error)
							{
								error('Не удалось загрузить картинку. Можете попробовать ещё раз.')
								return tool.restore_caret()
							}
							
							var picture = $('<img/>')
							picture.attr('src', url)
							picture.attr('width', size.width)
							picture.attr('height', size.height)
							
							tool.mark_type(picture)
							
							tool.restore_caret()
							tool.on_success(editor.insert(picture))
						})
					},
					on_open: function()
					{	
						tool.backup_caret()
					},
					on_cancel: function()
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
			},
			
			on_element_click: function()
			{
				var formula = decodeURIComponent(parseUri($(this).attr('src')).queryKey.chl)
				visual_editor.Tools.Formula.open_dialog_window({ formula: formula }, { element: $(this) })
				return false
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
				// иначе в хроме будет курсор в начале, но как бы перед самой ссылкой
				if ($.browser.webkit)
					return editor.caret.move_to(subscript, 1)
				
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
				// иначе в хроме будет курсор в начале, но как бы перед самой ссылкой
				if ($.browser.webkit)
					return editor.caret.move_to(superscript, 1)
				
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
			button: new image_button(tools.find('.video > *')),
			
			type_attribute: 'video',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.видео = function(value, callback)
				{
					if (!value)
						return callback({ error: 'Введите адрес видео на YouTube' })
						
					if (!Youtube.Video.id(value))
						return callback({ error: 'Неправильный адрес видео на YouTube' })
						
					callback()
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
						url = encodeURI(url.collapse_lines())
						
						/*
						if (this.state.element)
						{
							this.state.element.attr('src', 'http://www.youtube-nocookie.com/embed/' + Youtube.Video.id(url) + '?rel=0')
							return tool.restore_caret()
						}
						*/
					
						var video = $('<iframe/>')
						video.attr('src', 'http://www.youtube-nocookie.com/embed/' + Youtube.Video.id(url) + '?rel=0&wmode=transparent')
						video.attr('width', 560)
						video.attr('height', 315)
						video.attr('frameborder', 0)
						video.attr('allowfullscreen', 'true')
						tool.mark_type(video)
					
						tool.on_success(editor.insert(video))
					},
					on_open: function()
					{	
						tool.backup_caret()
					},
					on_cancel: function()
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
		
		/*
		Tools.Html =
		{
			selector: '.html',
			
			initialize: function()
			{
				var tool = this
				
				Validation.наглядный_писарь.html = function(value, callback)
				{
					if (!value)
						return callback({ error: Введите код Html (но потом всё обрежется)' })
						
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
						
					tool.dialog_window.content.find('input[name="html"]').val(value)
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
						
						tool.on_success(editor.insert(element))
					},
					on_open: function()
					{	
						tool.backup_caret()
					},
					on_cancel: function()
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
		*/
		
		// helpers
		
		Object.each(Tools, function(tool, key)
		{
			var element
			if (tool.selector)
				element = tools.find(tool.selector)
			else if (tool.button)
				element = tool.button.$element.parent()
			
			tool.turn_off = function()
			{
				element.remove()
			}
			
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
			
			tool.activate_all = function()
			{
				if (this.type_attribute)
					this.activate('[type="' + this.type_attribute + '"]')
			}
			
			tool.activate = function(selector)
			{
				if (typeof(selector) !== 'string')
					return this.activate_element(selector)
		
				var tool = this
				editor.on_event(selector, 'click.visual_editor', function(event)
				{
					return tool.on_element_click.bind(this)()
				})
			}
			
			tool.activate_element = function(element)
			{
				var tool = this
				element.on('click.visual_editor', function(event)
				{
					return tool.on_element_click.bind(this)()
				})
			}
			
			tool.mark_type = function(element)
			{
				element.attr('type', this.type_attribute)
			}
			
			tool.open_dialog_window = function(values, state)
			{
				if (values)
				{	
					Object.each(values, function(value, name)
					{
						tool.dialog_window.form.field(name).val(value)
					})
				}
				
				this.dialog_window.open(state)
			}
			
			tool.backup_caret = function()
			{
				this.caret = editor.caret.get()			
			}
			
			tool.restore_caret = function()
			{
				if ($.browser.mozilla)
					editor.content.focus()
				
				editor.caret.set(this.caret)
			}
			
			if (tool.selector)
			{
				element.on('click', function(event)
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
	/*
	// с этим кодом, если фокус уходит на visual_editor_tools, то они перестают работать
	$(document).on('focusout', function(event)
	{
		if (!window.visual_editors)
			return
			
		window.visual_editors.forEach(function(visual_editor)
		{
			// если бы можно было знать, куда приземляется фокус, то можно было бы поставить условие
			if (event.target === visual_editor.editor.content.get(0))
				visual_editor.disable_tools()
		})
	})
	
	// если поместить только tools и content в один контейнер, то тогда можно было бы на нём делать focusout
	*/
	
	$(document).on('focusin', function(event)
	{
		if (!window.visual_editors)
			return
			
		// disable all the other editors
		window.visual_editors.forEach(function(visual_editor)
		{
			if (event.target !== visual_editor.editor.content.get(0))
				visual_editor.disable_tools()
		})
		
		// enable this editor
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
				tools.trigger('more.visual_editor_tools')
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
				tools.trigger('less.visual_editor_tools')
			})
		})
	})
}