Visual_editor.implement
({
	unload_tools: function()
	{
		if (!this.tools_element)
			return
			
		this.tools_element.floating_top_bar('unload')
		//this.tools_element.appendTo(this.tools_element_parent)
	},
	
	initialize_tools_container: function()
	{
		var tools = this.tools_element
		//this.tools_element_parent = tools.parent()
		
		var сontainer = $('.visual_editor_tools_container')
		
		tools.disableTextSelect()
		tools.appendTo(сontainer)
		tools.parent().show()
		
		//this.tools_element = tools
			
		// toolbar

		this.editor.on('content_changed.editor', (function(событие, options)
		{
			this.set_proper_tools_state()
		})
		.bind(this))
		
		this.initialize_more_less_tools()
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
	
	show_tools: function(options)
	{
		this.tools_element.floating_top_bar('show', options)
	},
	
	hide_tools: function(options)
	{
		this.tools_element.floating_top_bar('hide', options)
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
	
		var original = $('.visual_editor_tools')
		var tools = original.clone().appendTo('body')
		this.tools_element = tools
	
		var Tools = {}
		
		var Error = function(message)
		{
			this.message = message
		}
		
		var activate_all_toolable_elements = function()
		{
			Object.for_each(Tools, function(key)
			{
				this.activate_all()
			})
		}
		
		visual_editor.activate_all_toolable_elements = activate_all_toolable_elements
		
		Tools.Text_align_left =
		{
			button: new image_button(tools.find('.text_align_left > *')),
			
			apply: function()
			{
				this.backup_caret()
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					throw new Error('Снимите выделение: этот инструмент применяется ко всему абзацу сразу')
				}
				
				var paragraph = editor.caret.container('p')
				
				if (!paragraph.exists())
				{
					throw new Error('Встаньте внутрь абзаца, чтобы воспользоваться этим инструментом')
				}
				
				paragraph.css('text-align', 'left')
				
				this.restore_caret()
			}
		}
		
		Tools.Text_align_center =
		{
			button: new image_button(tools.find('.text_align_center > *')),
			
			apply: function()
			{
				this.backup_caret()
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					throw new Error('Снимите выделение: этот инструмент применяется ко всему абзацу сразу')
				}
				
				var paragraph = editor.caret.container('p')
				
				if (!paragraph.exists())
				{
					throw new Error('Встаньте внутрь абзаца, чтобы воспользоваться этим инструментом')
				}
				
				paragraph.css('text-align', 'center')
				
				this.restore_caret()
			}
		}
		
		Tools.Text_align_right =
		{
			button: new image_button(tools.find('.text_align_right > *')),
			
			apply: function()
			{
				this.backup_caret()
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					throw new Error('Снимите выделение: этот инструмент применяется ко всему абзацу сразу')
				}
				
				var paragraph = editor.caret.container('p')
				
				if (!paragraph.exists())
				{
					throw new Error('Встаньте внутрь абзаца, чтобы воспользоваться этим инструментом')
				}
				
				paragraph.css('text-align', 'right')
				
				this.restore_caret()
			}
		}
		
		Tools.Text_align_justify =
		{
			button: new image_button(tools.find('.text_align_justify > *')),
			
			apply: function()
			{
				this.backup_caret()
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					throw new Error('Снимите выделение: этот инструмент применяется ко всему абзацу сразу')
				}
				
				var paragraph = editor.caret.container('p')
				
				if (!paragraph.exists())
				{
					throw new Error('Встаньте внутрь абзаца, чтобы воспользоваться этим инструментом')
				}
				
				paragraph.css('text-align', 'justify')
				
				this.restore_caret()
			}
		}
		
		Tools.Subheading =
		{
			selector: '.subheading',
			
			apply: function()
			{
				this.backup_caret()
				
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{
					this.restore_caret()
					throw new Error('Подзаголовок можно помещать только в отдельном абзаце')
				}
				
				var subheading = $('<h2/>')
				
				// если выделено - сделать подзаголовком
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					subheading.text(editor.selection.text())
					editor.selection.cut()
					
					this.restore_caret()
					subheading = editor.insert(subheading, { break_container: true })
					editor.caret.move_to(subheading.next())
					
					return
				}
				
				visual_editor.hint(subheading, 'Введите текст подзаголовка')
				
				this.restore_caret()
				subheading = editor.insert(subheading, { break_container: true })
				editor.caret.move_to(subheading)
			},
			
			on_success: function(subheading)
			{
			}
		}

		Tools.Bold =
		{
			selector: '.bold',
			
			apply: function(callback)
			{
				this.backup_caret()
				
				if (!editor.selection.exists() && editor.selection.is_valid())
				{
					this.restore_caret()
					throw new Error('Выделите текст')
				}
								
				return callback(editor.selection.wrap($('<b/>')))
			},
			
			on_success: function(element)
			{
				editor.caret.move_to_the_next_element(element)
			}
		}

		Tools.Italic =
		{
			selector: '.italic',
			
			apply: function(callback)
			{
				this.backup_caret()
				
				if (!editor.selection.exists() && editor.selection.is_valid())
				{
					this.restore_caret()
					throw new Error('Выделите текст')
				}
								
				return callback(editor.selection.wrap($('<i/>')))
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
				
				this.dialog_window = Visual_editor.tool_windows.Link
				({
					ok: function(url)
					{
						if (tool.dialog_window.state.element)
						{
							tool.dialog_window.state.element.attr('href', url)
							return editor.caret.restore()
						}
						
						var link = $('<a/>')
						link.attr('href', url)
						
						editor.selection.restore()
						
						if (editor.selection.exists() && editor.selection.is_valid())
						{
							link.text(editor.selection.text())
							editor.selection.cut()
						}
						else
							visual_editor.hint(link, 'Введите текст ссылки')
						
						tool.mark_type(link)
						
						editor.caret.restore()
						
						var element = editor.insert(link)
						
						tool.on_success(element)
					},
					
					open: function()
					{
						editor.caret.store()
					},
					
					cancel: function()
					{
						editor.caret.restore()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists() && editor.selection.is_valid())
					editor.selection.store()
				
				this.open_dialog_window()
			},
			
			on_success: function(link)
			{
				activate_all_toolable_elements()
				//this.activate(link)
				
				// иначе в хроме будет курсор в начале, но как бы перед самой ссылкой
				if ($.browser.webkit)
					return editor.caret.move_to(link, 1)
				
				editor.caret.move_to(link)
			},
			
			on_element_click: function()
			{
				var url = decodeURI($(this).attr('href'))
				Tools.Link.open_dialog_window({ url: url }, { element: $(this) })
				return false
			}
		}
						
		Tools.Citation =
		{
			selector: '.citation',
			
			apply: function(callback)
			{
				this.backup_caret()
				
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{	
					this.restore_caret()
					
					throw new Error('Выдержку можно помещать только в отдельном абзаце')
				}
				
				var citation = $('<div/>')
				citation.addClass('citation')
				
				var text = $('<span/>')
				text.addClass('text')
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					text.text(editor.selection.text())
					editor.selection.cut()
				}
				else		
					visual_editor.hint(text, 'Введите текст выдержки')
					
				//text.text('It is said that if you know your enemies and know yourself, you will not be imperiled in a hundred battles; if you do not know your enemies but do know yourself, you will win one and lose one; if you do not know your enemies nor yourself, you will be imperiled in every single battle.'.trim_trailing_comma())
				
				text.appendTo(citation)

				var author = $('<div/>')
				author.addClass('author')
				visual_editor.hint(author, 'Укажите здесь источник')
				//author.text('Sun Tzu, The Art of War. Ch. 3, the last sentence.'.trim_trailing_comma())
				
				author.appendTo(citation)
				
				return callback(editor.insert(citation, { break_container: true }))
			},
			
			on_success: function(citation)
			{
				editor.caret.move_to(citation)
			}
		}
		
		Tools.List =
		{
			button: new image_button(tools.find('.list > *')),
			
			apply: function(callback)
			{
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{
					throw new Error('Список можно помещать только в отдельном абзаце')
				}
				
				var list = $('<ul/>')
				var list_item = $('<li/>')
				
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					list_item.text(editor.selection.text())
					editor.selection.cut()
				}
				else
					visual_editor.hint(list_item, 'Введите текст')
					
				list_item.appendTo(list)
				
				return callback(editor.insert(list, { break_container: true }))
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
				
				this.dialog_window = Visual_editor.tool_windows.Picture
				({
					ok: function(data)
					{
						var url = data.url
						
						Visual_editor.tool_helpers.Picture.get_picture_size(url, function(size)
						{
							if (!size)
								return editor.caret.restore()
						
							if (tool.dialog_window.state.element)
							{
								tool.dialog_window.state.element.attr
								({
									src: url,
									width: size.width,
									height: size.height
								})
							
								tool.dialog_window.state.element.css('float', data.float)
							
								return editor.caret.restore()
							}
							
							var picture = $('<img/>')
							picture.attr
							({
								src: url,
								width: size.width,
								height: size.height
							})
							
							picture.css('float', data.float)
							
							tool.mark_type(picture)
							
							editor.caret.restore()
							
							tool.on_success(editor.insert(picture))
						})
					},
					
					open: function()
					{
						page.подсказка('быстрая вставка картинки', 'Также вы можете вставлять картинки «быстрым» способом — просто скопировав и вставив ссылку на картинку прямо в сообщении')

						editor.caret.store()
					},
					
					cancel: function()
					{
						editor.caret.restore()
					}
				})
			},
			
			apply: function()
			{
				if (editor.selection.exists() && editor.selection.is_valid())
					throw new Error('Снимите выделение')
				
				this.dialog_window.content.find('.float > [value="none"]').click()
			
				this.open_dialog_window()
			},
			
			on_success: function(picture)
			{
				activate_all_toolable_elements()
				//this.activate(picture)
				editor.caret.move_to(picture, { after: true })
			},
			
			on_element_click: function()
			{
				var url = decodeURIComponent($(this).attr('src'))
				Tools.Picture.open_dialog_window({ url: url, float: $(this).css('float') }, { element: $(this) })
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
				
				this.dialog_window = Visual_editor.tool_windows.Formula
				({
					ok: function(data)
					{
						tool.insert_formula(data, { element: tool.dialog_window.state.element, append_whitespace: true })
					},
					open: function()
					{
						if (this.state && this.state.element)
						{
							var display = this.content.find('.display').hide()
							var input = display.prev('input').hide()
							var label = input.prev('label').hide()
							
							input.val(this.state.element.css('display'))
						}
						else
						{
							var display = this.content.find('.display').show()
							var input = display.prev('input').show()
							var label = input.prev('label').show()
						}
						
						editor.caret.store()
					},
					cancel: function()
					{
						editor.caret.restore()
					}
				})
			},
	
			insert_formula: function(data, options)
			{
				var formula = data.formula
				var inline = data.display === 'inline'
				
				options = options || {}
			
				var html
						
				if (inline)
					html = delimit_formula(formula, 'inline')
				else
					html = delimit_formula(formula, 'block')
					
				if (options.element)
				{
					options.element.attr('formula', formula).html(html)
										
					if (!editor.caret.move_to_the_next_element(options.element, editor.caret.container()))
						this.restore_caret()
					
					refresh_formulae({ wait_for_load: true, what: options.element, formula: formula })
					return this.on_success()
				}
				
				var element = $('<span/>').addClass('tex')
				
				element.attr('formula', formula).html(html)
				element.css('display', data.display)
				
				this.mark_type(element)
				
				this.restore_caret()
				
				if (inline)
					element = editor.insert(element)
				else
					element = editor.insert(element, { break_container: true })
					
				var add_whitespace = function()
				{
					var text = Dom_tools.append_text_next_to(element, ' ')
					editor.caret.move_to(text)
				}
				
				if (inline)
				{
					if (options.append_whitespace)
					{
						add_whitespace()
					}
					else
					{
						if (!editor.caret.move_to_the_next_element(element, editor.content.node()))
							add_whitespace()
					}
				}
				else
				{
					if (!editor.caret.move_to_the_next_element(element, editor.content.node()))
					{
						// for a div formula
						var paragraph = visual_editor.create_paragraph()
						paragraph.appendTo(editor.content)
						editor.caret.move_to(paragraph)
					}
				}
				
				refresh_formulae({ wait_for_load: true, what: element, formula: html })
				
				this.on_success(element)
			},
	
			apply: function()
			{
				this.backup_caret()
					
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{	
					this.restore_caret()
					
					throw new Error('Формулу можно помещать только среди обычного текста')
				}
				
				// если выделено - формулу из выделения
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					var text = editor.selection.text()
					editor.selection.cut()
					this.insert_formula(text)
					
					return
				}
				
				this.dialog_window.content.find('.display > [value="inline"]').click()
				
				this.open_dialog_window()
					
				//var formula = '\\[ f(x,y,z) = 3y^2 z \\left( 3 + \\frac{7x+5}{1 + y^2} \\right).\\]'
				// \[ \left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right) \]
			},
			
			on_success: function(picture)
			{
				activate_all_toolable_elements()
				//this.activate(picture)
				//editor.caret.move_to(picture)
			},
			
			on_element_click: function()
			{
				var formula = $(this).attr('formula')
				var display = $(this).css('display')
				Tools.Formula.open_dialog_window({ formula: formula, display: display }, { element: $(this) })
				return false
			}
		}
		
		Tools.Subscript =
		{
			selector: '.subscript',
			
			apply: function()
			{
				var element = $('<sub/>')
				
				// если выделено - нижний индекс из выделения
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					element.text(editor.selection.text())
					editor.selection.cut()
					
					element = editor.insert(element)
						
					var text = Dom_tools.append_text_next_to(element, ' ')
					editor.caret.move_to_the_end(text)
					
					return
				}
				
				visual_editor.hint(element, 'Введите текст')
				element = editor.insert(element)
			
				// иначе в хроме будет курсор в начале, но как бы перед самим элементом
				if ($.browser.webkit)
					return editor.caret.move_to(element, 1)
				
				return editor.caret.move_to(element)
			},
			
			on_success: function(subscript)
			{
			}
		}
		
		Tools.Superscript =
		{
			selector: '.superscript',
			
			apply: function()
			{
				var element = $('<sup/>')
				
				// если выделено - верхний индекс из выделения
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					element.text(editor.selection.text())
					editor.selection.cut()
					
					element = editor.insert(element)
						
					var text = Dom_tools.append_text_next_to(element, ' ')
					editor.caret.move_to_the_end(text)
					
					return
				}
			
				visual_editor.hint(element, 'Введите текст')
				element = editor.insert(element)
			
				// иначе в хроме будет курсор в начале, но как бы перед самим элементом
				if ($.browser.webkit)
					return editor.caret.move_to(element, 1)
				
				return editor.caret.move_to(element)
			},
			
			on_success: function(superscript)
			{
			}
		}
		
		Tools.Code =
		{
			selector: '.code',
			
			apply: function()
			{
				var element = $('<code/>')
				
				// если выделено - код из выделенного
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					element.text(editor.selection.text())
					editor.selection.cut()
					
					element = editor.insert(element, { break_container: true })
						
					var text = Dom_tools.append_text_next_to(element, ' ')
					editor.caret.move_to_the_end(text)
					
					return
				}
				
				visual_editor.hint(element, 'Введите код')
				element = editor.insert(element, { break_container: true })
			
				// иначе в хроме будет курсор в начале, но как бы перед самим элементом
				if ($.browser.webkit)
					return editor.caret.move_to(element, 1)
				
				return editor.caret.move_to(element)	
			},
			
			on_success: function(result)
			{
			}
		}
		
		Tools.Multiline_code =
		{
			selector: '.multiline_code',
			
			apply: function()
			{
				this.backup_caret()
					
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{	
					this.restore_caret()
					
					throw new Error('Многострочный код можно помещать только в отдельном абзаце')
				}
				
				var element = $('<pre/>')
				
				// если выделено - многострочный код из выделенного
				if (editor.selection.exists() && editor.selection.is_valid())
				{
					element.text(editor.selection.text())
					editor.selection.cut()
					element = editor.insert(element)
					editor.caret.move_to_the_next_element(element)
				}
			
				visual_editor.hint(element, 'Введите код')	
				element = editor.insert(element)
				return editor.caret.move_to(element)
			},
			
			on_success: function(result)
			{
			}
		}
		
		Tools.Video =
		{
			button: new image_button(tools.find('.video > *')),
			
			type_attribute: 'video',
			
			initialize: function()
			{
				var tool = this
				
				this.dialog_window = simple_value_dialog_window
				({
					class: 'visual_editor_video_window',
					title: 'Видео',
					fields:
					[{
						id: 'url',
						description: 'Ссылка на видео (YouTube или Vimeo)',
						validation: 'наглядный_писарь.видео'
					}],
					ok: function(url)
					{
						url = url.collapse_lines()
						
						var video_player = $('<div/>').addClass('video_player')
						
						var video
					
						if (Youtube.Video.id(url))
						{
							video_player.attr('hosting', 'youtube')
							video = $(Youtube.Video.embed_code(Youtube.Video.id(url)))
						}
						else if (Vimeo.Video.id(url))
						{
							video_player.attr('hosting', 'vimeo')
							video = $(Vimeo.Video.embed_code(Vimeo.Video.id(url)))
						}
						else
							return error ('Хостинг видео не поддерживается: ' + value)
					
						tool.mark_type(video)
						
						tool.restore_caret()
						
						video_player.append(video)
					
						video_player = editor.insert(video_player, { break_container: true })
						
						if (!editor.caret.move_to_the_next_element(video_player, editor.content.node()))
						{
							var paragraph = visual_editor.create_paragraph()
							paragraph.appendTo(editor.content)
							editor.caret.move_to(paragraph)
						}
				
						tool.on_success()
					},
					on_open: function()
					{
						page.подсказка('быстрая вставка видеозаписи', 'Также вы можете вставлять видеозаписи «быстрым» способом — просто скопировав и вставив ссылку на видеозапись прямо в сообщении')

						editor.caret.store()
					},
					on_cancel: function()
					{
						editor.caret.restore()
					}
				})
				.window
			},
			
			apply: function()
			{
				this.backup_caret()
					
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{	
					this.restore_caret()
							
					throw new Error('Видео можно помещать только в отдельном абзаце')
				}
				
				if (editor.selection.exists() && editor.selection.is_valid())
					throw new Error('Снимите выделение')
				
				this.open_dialog_window()
			},
			
			on_success: function()
			{
			}
		}
		
		Tools.Audio =
		{
			button: new image_button(tools.find('.audio > *')),
			
			type_attribute: 'audio',
			activation_element: function(element) { return element.audio_player('title_element') },
			
			initialize: function()
			{
				var tool = this
				
				this.dialog_window = Visual_editor.tool_windows.Audio
				({
					class: 'visual_editor_audio_window',
					title: 'Аудиозапись',
					fields:
					[{
						id: 'url',
						description: 'Ссылка на аудиозапись',
						validation: 'наглядный_писарь.аудиозапись.ссылка'
					},
					{
						id: 'title',
						description: 'Название',
						validation: 'наглядный_писарь.аудиозапись.название'
					}],
					ok: function(data)
					{
						if (tool.dialog_window.state.element)
						{
							var audio = tool.dialog_window.state.element
							
							Visual_editor.tool_helpers.Audio.refresh_player(audio, data)
							
							activate_all_toolable_elements()
				
							return editor.caret.restore()
						}
						
						var audio = $('<div/>').addClass('audio_player')
						
						var file = audio.audio_player('link', { url: data.url, title: data.title })
						file.appendTo(audio)
										
						tool.mark_type(audio)
					
						editor.caret.restore()
						
						audio = editor.insert(audio, { break_container: true })
						
						if (!editor.caret.move_to_the_next_element(audio, editor.content.node()))
						{
							var paragraph = visual_editor.create_paragraph()
							paragraph.appendTo(editor.content)
							editor.caret.move_to(paragraph)
						}
						
						tool.on_success(audio)
					},
					open: function()
					{
						editor.caret.store()
					},
					cancel: function()
					{
						editor.caret.restore()
					}
				})
			},
			
			apply: function()
			{
				if (!editor.caret.root() && !editor.caret.container().is('p'))
				{
					this.restore_caret()
					throw new Error('Аудиозапись можно помещать только в отдельном абзаце')
				}
				
				if (editor.selection.exists() && editor.selection.is_valid())
					throw new Error('Снимите выделение')
				
				this.open_dialog_window()
			},
			
			on_success: function(element)
			{
				element.audio_player()
				
				activate_all_toolable_elements()
			},
			
			on_element_click: function(event)
			{
				var clicked = $(event.target)
				
				if (clicked.audio_player('is_control'))
				{
					return
				}
				
				event.preventDefault()
				event.stopPropagation()
				
				var player = clicked.find_parent('.audio_player')
				
				var url = player.audio_player('url')
				var title = player.audio_player('title')
				
				var url = decodeURI(url)
				Tools.Audio.open_dialog_window({ url: url, title: title }, { element: player })
				return false
			}
		}
		
		Tools.Source =
		{
			selector: '.source',
			
			initialize: function()
			{
				var tool = this
				
				this.dialog_window = simple_value_dialog_window
				({
					class: 'visual_editor_edit_source_window',
					title: 'Правка исходника',
					icon: false,
					maximized: { margin: 20 },
					fields:
					[{
						id: 'source',
						validation: 'наглядный_писарь.source',
						multiline: true
					}],
					before_ok: function()
					{
						this.xml_editor.save()
					},
					when_closed: function()
					{
						this.xml_editor.toTextArea()
					},
					ok: function(xml)
					{
						editor.load_content(Wiki_processor.decorate(xml))
						postprocess_rich_content(editor.content)
						tool.on_success() //this.xml_editor.getValue())))
					},
					on_open: function()
					{
						editor.caret.store()
					},
					on_cancel: function()
					{
						editor.caret.restore()
					}
				})
				.window
				
				this.dialog_window.content.find('textarea').wrap($('<div class="xml_editor"/>'))
			},
			
			apply: function()
			{
				if (editor.selection.exists() && editor.selection.is_valid())
					throw new Error('Снимите выделение')
				
				Wiki_processor.parse(editor.get_content().html(), (function(source)
				{
					this.open_dialog_window({ source: source })
					
					//this.dialog_window.content.appendTo('#page')
	
					this.dialog_window.xml_editor = CodeMirror.fromTextArea(this.dialog_window.content.find('textarea').node(),
					{
						mode: { name: 'xml', alignCDATA: true },
						indentWithTabs: true,
						lineWrapping: true
					})
				})
				.bind(this))
			},
			
			on_success: function()
			{
				editor.caret.restore()
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
					tool.apply(function(result)
					{
						if (result)
							tool.on_success(result)
					})
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
			
			if (tool.dialog_window)
				page.register_dialog_window(tool.dialog_window)
			
			tool.activate_all = function()
			{
				if (!this.type_attribute)
					return
				
				var element = editor.content.find('[type="' + this.type_attribute + '"]')
				
				if (this.activation_element)
					element = this.activation_element(element)
					
				this.activate(element)
			}
			
			tool.activate = function(selector)
			{
				if (typeof(selector) !== 'string')
					return this.activate_element(selector)
		
				var tool = this
				editor.on_event(selector, 'click.visual_editor', function(event)
				{
					return tool.on_element_click.bind(this)(event)
				})
			}
			
			// may not work as 'live'
			tool.activate_element = function(element)
			{
				/*
				Object.for_each(visual_editor.Tools, function(key, tool)
				{
					tools.activate_all()
				})
				return
				*/
				
				var tool = this
				element.on('click.visual_editor', function(event)
				{
					return tool.on_element_click.bind(this)(event)
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
						if (tool.dialog_window.form.field_setter(name))
							tool.dialog_window.form.field_setter(name).bind(tool.dialog_window)(value)
						else
							tool.dialog_window.form.field(name).val(value)
					})
				}
				
				tool.dialog_window.open({ state: state })
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
					
					if ($(this).hasClass('disabled'))
						return
					
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
	},
	
	// more tools / less tools
	initialize_more_less_tools: function()
	{
		var tools = this.tools_element
		var main_tools = tools.find('.main_tools')
		var additional_tools = tools.find('.additional_tools')
		
		var main_tools_height = main_tools.height()
	
		var editor = this.editor
	
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
})

// disable on blur / enable on focus
$(document).on('page_initialized', function()
{
	if (!first_time_page_loading)
		return
	
	/*
	// с этим кодом, если фокус уходит на visual_editor_tools, то они перестают работать
	$(document).on('focusout', function(event)
	{
		if (!page.data.visual_editors)
			return
			
		page.data.visual_editors.forEach(function(visual_editor)
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
		if (!page.data.visual_editors)
			return
			
		// disable all the other editors
		page.data.visual_editors.forEach(function(visual_editor)
		{
			//visual_editor.editor.caret.restore()
			if (event.target !== visual_editor.editor.content.get(0))
				visual_editor.disable_tools()
		})
		
		// enable this editor
		page.data.visual_editors.forEach(function(visual_editor)
		{
			if (event.target === visual_editor.editor.content.get(0))
				visual_editor.enable_tools()
		})
	})
})

Visual_editor.tool_windows =
{
	Formula: function(options)
	{
		return simple_value_dialog_window
		({
			class: 'visual_editor_formula_window',
			title: 'Вставить формулу (TeX)',
			fields:
			[{
				id: 'formula',
				//description: 'Введите формулу (в формате TeX)',
				multiline: true,
				validation: 'наглядный_писарь.формула'
			},
			{
				id: 'display',
				description: 'Положение в тексте',
				choice: true,
				postprocess: function(input)
				{
					var chooser = $('<div/>').addClass('display')
					
					this.chooser = chooser
					
					var inline = $('<div/>').attr('value', 'inline').appendTo(chooser)
					var block = $('<div/>').attr('value', 'block').appendTo(chooser)
					
					chooser.disableTextSelect()
					input.after(chooser)
					
					new image_chooser(chooser, { target: input })
				},
				setter: function(value)
				{
					this.content.find('.display > [value="' + value + '"]').click()
				}
			}],
			ok: function(data)
			{
				data.formula = data.formula.trim()
				options.ok(data)
			},
			on_open: function()
			{
				if (options.open)
					options.open.bind(this)()
			},
			on_cancel: function()
			{
				if (options.cancel)
					options.cancel()
			}
		})
		.window
	},
	
	Picture: function(options)
	{
		return simple_value_dialog_window
		({
			class: 'visual_editor_image_source_window',
			title: 'Вставить картинку',
			fields:
			[{
				id: 'url',
				description: 'Адрес картинки',
				validation: 'наглядный_писарь.картинка'
			},
			{
				id: 'float',
				description: 'Положение в тексте',
				choice: true,
				postprocess: function(input)
				{
					var chooser = $('<div/>').addClass('float')
					
					var left = $('<div/>').attr('value', 'left').appendTo(chooser)
					var none = $('<div/>').attr('value', 'none').appendTo(chooser)
					var right = $('<div/>').attr('value', 'right').appendTo(chooser)
					
					chooser.disableTextSelect()
					input.after(chooser)
					
					new image_chooser(chooser, { target: input })
				},
				setter: function(value)
				{
					this.content.find('.float > [value="' + value + '"]').click()
				}
			}],
			ok: function(data)
			{
				data.url = data.url.collapse_lines()
				options.ok(data)
			},
			on_open: function()
			{
				if (options.open)
					options.open.bind(this)()
			},
			on_cancel: function()
			{
				if (options.cancel)
					options.cancel()
			}
		})
		.window
	},
	
	Link: function(options)
	{
		return simple_value_dialog_window
		({
			class: 'visual_editor_hyperlink_window',
			title: 'Ссылка',
			fields:
			[{
				id: 'url',
				description: 'Укажите адрес ссылки',
				validation: 'наглядный_писарь.ссылка'
			}],
			ok: function(url)
			{
				options.ok(Uri.correct(url))
			},
			on_open: function()
			{	
				if (options.open)
					options.open()
			},
			on_cancel: function()
			{
				if (options.cancel)
					options.cancel()
			}
		})
		.window
	},
	
	Audio: function(options)
	{
		return simple_value_dialog_window
		({
			class: 'visual_editor_audio_window',
			title: 'Аудиозапись',
			fields:
			[{
				id: 'url',
				description: 'Ссылка на аудиозапись',
				validation: 'наглядный_писарь.аудиозапись.ссылка'
			},
			{
				id: 'title',
				description: 'Название',
				validation: 'наглядный_писарь.аудиозапись.название'
			}],
			ok: function(data)
			{
				data.url = Uri.correct(data.url.collapse_lines())
				options.ok(data)
			},
			on_open: function()
			{	
				if (options.open)
					options.open()
			},
			on_cancel: function()
			{
				if (options.cancel)
					options.cancel()
			}
		})
		.window
	}
}

Visual_editor.tool_helpers =
{
	Picture:
	{
		get_picture_size: function(url, callback)
		{
			var loading = loading_indicator.show()
			get_image_size(url, function(size)
			{
				loading.hide()
				
				if (size.error)
				{
					error('Не удалось загрузить картинку. Можете попробовать ещё раз.')
					return callback()
				}
				
				callback(size)
			})
		}
	},
	Audio:
	{
		refresh_player: function(where, data)
		{
			where.empty()
			
			var file = where.audio_player('link', { url: data.url, title: data.title })
			file.appendTo(where)
			
			where.audio_player()
		}
	}
}