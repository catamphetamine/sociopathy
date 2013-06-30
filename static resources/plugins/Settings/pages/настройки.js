title(text('pages.settings.title'));

(function()
{
	Режим.пообещать('правка')
		
	page.query('.email', 'email')
	page.query('.shortcuts', 'shortcuts')
	page.query('.language', 'language')
	page.query('.language .id', 'language_id')
	
	var No_email_text
	var No_language_text
	
	page.load = function()
	{
		page.подсказка('изменение настроек', 'Вы можете изменить настройки, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a> (клавиша «' + Настройки.Клавиши.Режимы.Правка + '»)')
	
		No_email_text = page.email.text()
		No_language_text = page.language.find('.name').text()
	
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		load_content
		({
			url: '/приложение/сеть/пользователь/настройки',
			done: settings_loaded,
		})
	}
	
	function settings_loaded(настройки)
	{
		page.data.настройки = настройки[0]
		
		подготовить_режим_правки()
		
		Режим.разрешить('правка')
		
		page.content_ready()
	}
	
	function подготовить_режим_правки()
	{
		Режим.при_переходе({ в: 'правка' }, function(event)
		{
			page.data.старая_почта = get_email()
		})
	
		initialize_edit_mode_effects()	
	}
	
	function initialize_edit_mode_effects()
	{
		initialize_body_edit_mode_effects()
	}
	
	function get_email()
	{
		var mail = page.email.text()
		if (mail !== No_email_text)
			return mail
		return
	}
	
	function whats_the_language()
	{
		if (page.language_id.text())
			return page.language_id.text()
	}
	
	function считать_клавиши()
	{
		var новые_клавиши = {}
				
		var клавиша_не_опознана = false
		
		$('.shortcuts').find('> ul').each(function()
		{
			var category = $(this)
		
			var directory = новые_клавиши
			if (category.attr('path') != "Прочее")
			{
				новые_клавиши[category.attr('path')] = {}
				directory = directory[category.attr('path')]
			}
				
			category.find('> li[path]').each(function()
			{
				var key = $(this)
		
				var keys = key.find('> span').text().split(',')._map(function() { return this.trim() })
				
				directory[key.attr('path')] = keys
			})
		})
		
		return новые_клавиши
	}
	
	page.save = function(данные)
	{
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				return true
			},
			
			data:
			{
				почта: данные.почта,
				клавиши: JSON.stringify(данные.клавиши),
				язык: данные.язык
			},
			
			url: '/приложение/сеть/пользователь/настройки',
			
			ok: function()
			{		
				if (данные.язык !== Язык)
				{
					if (данные.язык)
						localStorage.language = данные.язык
						
					window.location = '/'
						
					//info('Для того, чтобы изменения языка \n вступили в силу, обновите страницу')
				}
				
				//if (данные.почта && данные.почта !== page.data.старая_почта)
				//	info('На ваш новый почтовый ящик (возможно) было отправлено письмо (а возможно и не было отправлено)')
			}
		})
	}
	
	page.Data_store.collect_edited = function()
	{
		var result = {}
		
		result.почта = get_email()
		result.клавиши = считать_клавиши()
		result.язык = whats_the_language()
		
		return result
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			if (data.почта)
				page.email.text(data.почта)
			
			if (data.язык)
			{
				page.language.find('.name').text(get_language(data.язык).name)
				page.language_id.text(data.язык)
			}
			else
			{
				page.language.find('.name').text(No_language_text)
				page.language_id.empty()
			}
				
			page.shortcuts.find('> ul').each(function()
			{
				var category = $(this)
				category.find('> li[path]').each(function()
				{
					var key = $(this)
					
					var directory = data.клавиши
					
					if (category.attr('path') != "Прочее")
						directory = directory[category.attr('path')]

					var path = $('<span/>')
					path.addClass('shortcut_path').text(directory[key.attr('path')].join(', ')) //.attr('editable', true)
					path.appendTo(key)
				})
			})
		},
		
		destroy: function()
		{
			page.shortcuts.find('> ul > li').each(function()
			{
				$(this).find(':not(label:first)').remove()
			})
		}
	})
	
	page.Data_store.режим('правка',
	{
		create: function(data)
		{
			this.create_mode('обычный', data)
			
			// language
			
			page.language.find('.name').remove()
			
			var select = $('<select/>')
			
			var none = $('<option/>')
			
			if (!data.язык)
				none.attr('selected', true)
				
			none.appendTo(select)
			
			Configuration.Locale.Supported_languages.for_each(function()
			{
				var option = $('<option/>').attr('value', this.id).text(this.name)
				
				if (data.язык === this.id)
					option.attr('selected', true)
					
				option.appendTo(select)
			})
			
			select.on('change', function(event)
			{
				if (!select.val())
				{
					page.language.find('.name').text(No_language_text)
					page.language_id.empty()
					return
				}
				
				page.language.find('.name').text(get_language(select.val()).name)
				page.language_id.text(select.val())
			})
			
			select.appendTo(page.language)
			
			// shortcuts
			
			page.shortcuts.find('.shortcut_path').each(function()
			{
				var path = $(this)
				
				var old_path
				
				path.click(function()
				{
					if (path.hasClass('press_any_key_combination'))
					{
						return finished(old_path)
					}
					
					if (page.data.по_нажатию_id)
						return
					
					old_path = path.text()
					
					path.text('Нажмите клавиши')
					path.addClass('press_any_key_combination')
					
					function finished(the_path)
					{
						path.text(the_path)
						path.removeClass('press_any_key_combination')
						
						page.убрать_по_нажатию(page.data.по_нажатию_id)
						delete page.data.по_нажатию_id
					}
					
					page.data.по_нажатию_id = page.по_нажатию(function(event)
					{
						 //event.preventDefault()
						 
						if (Клавиши.is('Escape', event))
						{
							event.preventDefault()
							event.stopImmediatePropagation()
							return finished(old_path)
						}
						 
						var what = Клавиши.what(event)
						
						what = Клавиши.по_порядку(what)
						
						if (what.пусто())
							return
						 
						event.preventDefault()
						event.stopImmediatePropagation()
						
						var Key_combination_finder = function()
						{
							this.find = function(what, where, path)
							{
								var finder = this
								
								if (where instanceof Array)
								{
									var keys = Клавиши.по_порядку(Array.clone(where))
									
									if (keys.length !== what.length)
										return
									
									var i = 0
									while (i < keys.length)
									{
										if (keys[i] !== what[i])
											return
										
										i++
									}
									
									return true
								}
								else if (typeof where === 'object')
								{
									var found
								
									Object.for_each(where, function(section, keys)
									{
										if (keys instanceof Array || typeof keys === 'object')
										{
											var old_path = finder.path
											
											if (finder.path)
												finder.path += '.' + section
											else
												finder.path = section
											
											var result = finder.find(what, keys)
											
											if (result)
											{
												if (!finder.found)
													finder.found = finder.path
											}
											
											finder.path = old_path
										}
									})
									
									return this.found
								}
							}
						}
						 
						var found = (new Key_combination_finder()).find(what, data.клавиши)
						
						function calculate_path(from, path)
						{
							var path_part = from.parent().attr('path')
							
							if (!path_part)
								return path
							
							if (!path)
								path = path_part
							else
								path = path_part + '.' + path
								
							return calculate_path(from.parent(), path)
						}
						
						var self_path = calculate_path(path)
						
						if (found && found !== self_path)
						{
							return warning('Сочетание клавиш ' + Клавиши.сочетание(what) + ' уже используется для действия «' + found + '»')
						}
						
						finished(what.join(', '))
					})
				})
			})
		},
		
		destroy: function()
		{
			page.language.find('select').remove()
			
			// reset language name
			var text = No_language_text
			if (whats_the_language())
				text = get_language(whats_the_language()).name
			page.language.append($('<div/>').addClass('name').text(text))
			
			this.destroy_mode('обычный')
		}
	})
	
	page.Data_store.collect_initial_data = function(data)
	{
		data.почта = page.data.настройки.почта,
		data.клавиши = Настройки.Клавиши,
		data.язык = page.data.настройки.язык
	}

	//page.Data_store.что = 'настройки пользователя'
})()