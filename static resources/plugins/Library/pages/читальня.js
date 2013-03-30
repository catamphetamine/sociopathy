(function()
{
	var initialize_search
	
	Режим.пообещать('правка')
		
	//var on_the_right_side_of_the_panel_right
	
	page.query('#categories', 'categories')
	page.query('#articles', 'articles')
	
	page.load = function()
	{
		if (!page.data.раздел)
			title(text('pages.library.title'))
	
		//Подсказка('добавление в читальню', 'Вы можете добавлять разделы, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>. Вы можете добавлять заметки, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Добавить»</a>')
		//Подсказка('правка разделов', 'Вы можете добавлять, удалять, переименовывать и переупорядочивать разделы, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>. Для удаления раздела — «потащите» его мышью и «выбросите» в сторону')
		//Подсказка('перенос раздела или заметки', 'Вы можете перенести раздел (или заметку), нажав на нём (или на ней) правой кнопкой мыши и выбрав действие «Перенести». Для переноса раздела в корень читальни введите слово «Корень»')

		//insert_search_bar_into($('#panel'))
		
		//on_the_right_side_of_the_panel_right = $('.on_the_right_side_of_the_panel').css('right')
		//$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
		
		var путь_к_разделу
		var match = путь_страницы().match(/читальня\/(.+)/)
		if (match)
			путь_к_разделу = match[1]
			
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })

		page.category_icon_uploader = new Picture_uploader
		({
			namespace: '.режим_правка',
			max_size: 0.5,
			max_size_text: '500 килобайтов',
			url: '/сеть/читальня/раздел/картинка',
			element: function()
			{
				return this.category
			},
			ok: function(data, element)
			{
				element.find('.title').css('background-image', 'url(' + encodeURI(data.адрес) + ')')
				element.data('icon', data)
			}
		})
		
		function show_content()
		{
			new Data_templater
			({
				data_structure:
				{
					подразделы:
					{
						template: 'раздел читальни',
						container: page.categories,
						postprocess_item: function(data)
						{
							this.attr('_id', data._id).empty()
						}
					},
					заметки:
					{
						template: 'заметка раздела читальни',
						container: page.articles,
						postprocess_item: function(data)
						{
							this.attr('_id', data._id).empty()
						}
					}
				},
				conditional: conditional
			},
			new  Data_loader
			({
				url: '/приложение/читальня/раздел',
				parameters: { _id: page.data.раздел },
				get_data: function(data)
				{
					title(data.раздел.название)
					
					page.data.разделы = data.раздел.подразделы
					page.data.заметки = data.раздел.заметки
					
					по_порядку(data.раздел.подразделы)
					по_порядку(data.раздел.заметки)
					
					if (data.раздел.заметки.пусто() && data.раздел.подразделы.пусто())
						page.get('.main_content > .empty').show()
			
					return data.раздел
				},
				before_done: categories_loaded,
				done: page.initialized
			}))
		
			$(window).on_page('resize.library', center_categories_list)
			center_categories_list()
		}
		
		var finish = function()
		{
			if (!page.data.раздел)
				initialize_search()
			
			show_content()
		}
		
		if (!путь_к_разделу)
			return finish()
				
		function get_breadcrumbs()
		{
			var link = '/читальня'
			var crumbs = [{ title: text('pages.library.title'), link: link }]
			
			путь_к_разделу.split('/').forEach(function(раздел_или_заметка)
			{
				link += '/' + раздел_или_заметка
				crumbs.push({ title: раздел_или_заметка , link: link })
			})
			
			return crumbs
		}
		
		breadcrumbs(get_breadcrumbs())
		finish()
	}
	
	page.unload = function()
	{
		//remove_search_bar()
		//$('.on_the_right_side_of_the_panel').css('right', on_the_right_side_of_the_panel_right)
	}
	
	function choose_category_icon()
	{
		var category = $(this)
			
		page.category_icon_uploader.category = category
		page.category_icon_uploader.choose()
	}
	
	function add_category()
	{
		var category = $('<li/>').append($.tmpl('раздел читальни (правка)', { название: 'Название раздела' }))
		category.appendTo(page.categories)
		
		category.find('.title > span').focus().on('keypress.initial_keypress', function()
		{
			if ($(this).text() === 'Название раздела')
				$(this).text('')
				
			category.unbind('.initial_keypress')
		})
		
		category.on('clicked.режим_правка', choose_category_icon)
		
		page.category_dragger.refresh()
	}
	
	function categories_loaded()
	{
		text_button.new('.main_content > .add > .button').does(add_category)
		
		page.hotkey('Действия.Добавить', 'правка', add_category)
		
		Режим.при_переходе({ в: 'правка' }, function()
		{
			page.get('.empty').hide()
			
			page.category_icon_uploader.activate()
		})
		
		//page.get('.breadcrumbs > span:last').attr('editable', true)
			
		Режим.разрешить('правка')
		
		function autocomplete_field(options)
		{
			var field =
			{
				id: 'where',
				description: 'Куда',
				autocomplete:
				{
					mininum_query_length: 3,
					search: function(query, callback)
					{
						var ajax = page.Ajax.get('/приложение/читальня/разделы/найти',
						{
							query: query,
							max: 5
						})
						.ok(function(data)
						{
							if (options.include_root)
								if (page.data.раздел)
									if ('корень'.starts_with(data.запрос.toLowerCase()))
										data.разделы.unshift({ _id: 0, название: 'Корень' })
							
							data.разделы.remove(function()
							{
								return this._id === page.data.раздел
							})
							
							callback(data.разделы)
						})
												
						var search =
						{
							cancel: function()
							{
								ajax.abort()
							}
						}
						
						return search
					},
					decorate: function(раздел)
					{
						if (раздел.icon_version)
						{
							var icon = $('<div/>')
								.addClass('icon')
								.css('background-image', 'url("/загруженное/читальня/разделы/' + раздел._id + '/крошечная обложка.jpg?version=' + раздел.icon_version + '")')
								.appendTo(this)
						}
						
						$('<div/>')
							.addClass('title')
							.text(раздел.название)
							.appendTo(this)
					},
					value: function(раздел)
					{
						return раздел._id + ''
					},
					title: function(раздел)
					{
						return раздел.название
					},
					choice: function(_id)
					{
						options.ok()
					},
					nothing_found: function(query)
					{
						info(text('pages.library.section not found', { query: query }))
					}
				}
			}
			
			return field
		}
		
		page.move_category = simple_value_dialog_window
		({
			class: 'move_category_window',
			title: 'Перенести раздел',
			no_ok_button: true,
			fields: [autocomplete_field({ include_root: true, ok: function() { page.move_category.ok() } })],
			ok: function(_id)
			{
				var data =
				{
					раздел: page.move_category.раздел
				}
				
				if (_id != 0)
					data.куда = _id
				
				page.Ajax.post('/приложение/сеть/читальня/раздел/перенести', data)
				.ok(function(data)
				{
					info('Раздел перенесён')
					
					if (data.путь)
						go_to('/читальня/' + data.путь)
					else
						go_to('/читальня')
				})
				.ошибка(function(ошибка)
				{
					error(ошибка)
				})
			}
		})
		
		page.move_article = simple_value_dialog_window
		({
			class: 'move_category_window',
			title: 'Перенести заметку',
			no_ok_button: true,
			fields: [autocomplete_field({ ok: function() { page.move_article.ok() } })],
			ok: function(_id)
			{
				var data =
				{
					заметка: page.move_article.заметка,
					куда: _id
				}
				
				page.Ajax.post('/приложение/сеть/читальня/заметка/перенести', data)
				.ok(function(data)
				{
					info('Заметка перенесена')
					
					go_to('/читальня/' + data.путь)
				})
				.ошибка(function(ошибка)
				{
					error(ошибка)
				})
			}
		})
		
		// в корне не создают заметок
		if (page.data.раздел)
		{
			function new_article()
			{
				go_to('/сеть/читальня/заметка/' + page.data.раздел)
			}
			
			text_button.new('.main_content > .new_article > .button').does(new_article)
			page.hotkey('Действия.Создать', new_article)
		}
		else
		{
			$('.main_content > .new_article').remove()
		}
		
		if (page.data.search)
		{
			(function()
			{
				page.data.search.focus()
			})
			.delay(1)
		}
	}
	
	function center_categories_list()
	{
		center_list($('#categories'), { space: $('#content'), item_width: 250, item_margin: 40 })
	}

	var populate_categories = function(template)
	{
		return function(data)
		{
			var новые = []
			
			if (data.разделы.новые)
				новые = data.разделы.новые.clone()
				
			page.categories.find('> li').each(function()
			{
				var _id = $(this).attr('_id')
				
				var раздел
				
				if (!_id)
					раздел = новые.shift()
				else
					раздел = data.разделы[_id]
				
				var category = $.tmpl(template, раздел)
				
				category.appendTo(this)
				
				if (раздел.icon)
					category.data('icon', раздел.icon)
			})
		}
	}

	var populate_articles = function(template)
	{
		return function(data)
		{
			page.articles.find('> li').each(function()
			{
				var _id = $(this).attr('_id')
			
				$.tmpl(template, data.заметки[_id]).appendTo(this)
			})
		}
	}
	
	function initialize_actions_context_menu()
	{
		Режим.data('context_menus', [])
		
		page.categories.children().each(function()
		{
			var _id = $(this).attr('_id')
			
			if (_id)
			{
				var menu = $(this).context_menu
				({
					items:
					[
						{
							title: 'Перенести',
							action: function(_id)
							{
								page.move_category.раздел = _id
								page.move_category.window.open()
							}
						}
					]
				})
				
				menu.data = _id
				Режим.data('context_menus', menu, { add: true })
			}
		})
	
		page.articles.children().each(function()
		{
			var _id = $(this).attr('_id')
			
			if (_id)
			{
				var menu = $(this).context_menu
				({
					items:
					[
						{
							title: 'Перенести',
							action: function(_id)
							{
								page.move_article.заметка = _id
								page.move_article.window.open()
							}
						}
					]
				})
				
				menu.data = _id
				
				Режим.data('context_menus', menu, { add: true })
			}
		})
	}
	
	function destroy_actions_context_menu()
	{
		(Режим.data('context_menus') || []).for_each(function()
		{
			this.destroy()
		})
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			populate_categories('раздел читальни')(data)
			ajaxify_internal_links(page.categories)
	
			populate_articles('заметка раздела читальни')(data)
			ajaxify_internal_links(page.articles)
			
			page.categories.find('> li').each(function()
			{
				var category = $(this)
				if (!category.attr('_id') && category.find('.title span').is_empty())
					category.remove()
			})
			
			initialize_actions_context_menu()
		},
		
		destroy: function()
		{
			destroy_actions_context_menu()
			
			page.categories.find('> li').empty()
			page.articles.find('> li').empty()
		}
	})
	
	page.Data_store.режим('правка',
	{
		create: function(data)
		{
			populate_categories('раздел читальни (правка)')(data)
			populate_articles('заметка раздела читальни (правка)')(data)
			
			page.category_dragger = new Dragger(page.categories,
			{
				dont_start_dragging_on: '.title > span',
				sortable: true,
				throwable: true
			})
			
			page.categories.children().each(function()
			{
				$(this).on('clicked.режим_правка', choose_category_icon)
			})
			
			page.article_dragger = new Dragger(page.articles,
			{
				sortable: true,
				throwable: true
			})
		},
		
		destroy: function(data)
		{
			page.category_dragger.destroy()
			page.article_dragger.destroy()
			
			this.modes.обычный.destroy()
		}
	})
	
	page.Data_store.collect_edited = function()
	{
		var data =
		{
			разделы: { новые: [] },
			заметки: {}
		}
		
		var index
		
		index = 0
		page.categories.find('> li').each(function()
		{
			index++
			
			var category = $(this)
		
			if (category.hidden())
				return
			
			var category_data =
			{
				название: category.find('.title').text().trim(),
				порядок: index
			}
			
			if (category.data('icon'))
				category_data.icon = category.data('icon')
	
			var _id = category.attr('_id')
			
			if (!_id)
				return data.разделы.новые.push(category_data)
			
			category_data._id = _id
			category_data.путь = page.Data_store.unmodified_data.разделы[_id].путь
			category_data.icon_version = page.Data_store.unmodified_data.разделы[_id].icon_version
			
			data.разделы[_id] = category_data
		})
		
		index = 0
		page.articles.find('> li').each(function()
		{
			index++
			
			var article = $(this)
			
			var article_data =
			{
				порядок: index
			}
			
			var _id = article.attr('_id')
			
			article_data.название = page.Data_store.unmodified_data.заметки[_id].название
			article_data.путь = page.Data_store.unmodified_data.заметки[_id].путь
			
			data.заметки[_id] = article_data
		})
		
		return data
	}
	
	page.Data_store.deduce = function()
	{
		var data =
		{
			разделы: {},
			заметки: {}
		}
		
		page.data.разделы.for_each(function()
		{
			data.разделы[this._id] = this
		})
		
		page.data.заметки.for_each(function()
		{
			data.заметки[this._id] = this
		})
		
		return data
	}
	
	page.Data_store.reset_changes = function()
	{
		reload_page()
	}
	
	page.save = function(data)
	{
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				var anything_changed = false
				
				var данные = this
				
				// разделы
				Object.for_each(page.Data_store.unmodified_data.разделы, function(_id, раздел)
				{
					if (!data.разделы[_id])
					{
						anything_changed = true
						return данные.разделы.удалённые.push(_id)
					}
					
					if (раздел.название !== data.разделы[_id].название)
					{
						данные.разделы.переименованные.push
						({
							_id: _id,
							название: data.разделы[_id].название
						})
						
						anything_changed = true
					}
					
					if (раздел.порядок !== data.разделы[_id].порядок)
					{
						данные.разделы.переупорядоченные.push
						({
							_id: _id,
							порядок: data.разделы[_id].порядок
						})
						
						anything_changed = true
					}
					
					if (data.разделы[_id].icon)
					{
						данные.разделы.обновлённые_картинки.push
						({
							_id: _id,
							icon: data.разделы[_id].icon.имя
						})
						
						anything_changed = true
					}
				})
				
				// заметки
				Object.for_each(page.Data_store.unmodified_data.заметки, function(_id, заметка)
				{
					if (!data.заметки[_id])
					{
						anything_changed = true
						return данные.заметки.удалённые.push(_id)
					}
					
					if (заметка.порядок !== data.заметки[_id].порядок)
					{
						данные.заметки.переупорядоченные.push
						({
							_id: _id,
							порядок: data.заметки[_id].порядок
						})
						
						anything_changed = true
					}
				})
				
				// есть ли новые разделы
				if (data.разделы.новые && !data.разделы.новые.пусто())
				{
					данные.разделы.новые = data.разделы.новые
					данные.разделы.новые.remove(function(раздел) { return раздел.название === 'Название раздела' })
					anything_changed = true
				}
				
				return anything_changed
			},
			
			validate: function()
			{
				var названия = {}
				
				var разделы = []
					.append(this.разделы.переименованные)
					.append(this.разделы.новые)
					
				Object.for_each(page.Data_store.unmodified_data.разделы, function(_id, раздел)
				{
					if (_id === 'новые')
						return
					
					разделы.push(раздел)
				})
				
				разделы.for_each(function()
				{
					if (названия[this.название])
						throw { error: 'Два раздела названы «' + this.название + '»', level: 'warning' }
					
					названия[this.название] = true
				})
			},
			
			data:
			{
				разделы: 
				{
					переименованные: [],
					новые: [],
					удалённые: [],
					переупорядоченные: [],
					обновлённые_картинки: []
				},
				заметки:
				{
					удалённые: [],
					переупорядоченные: []
				},
				надраздел: page.data.раздел
			},
			
			url: '/приложение/сеть/читальня/раздел',
			
			ok: function(data)
			{
				reload_page()
			}
		})
	}
	
	function initialize_search()
	{
		page.data.search = page.get('.search').autocomplete
		({
			mininum_query_length: 3,
			search: function(query, callback)
			{
				var ajax = page.Ajax.get('/приложение/читальня/поиск',
				{
					query: query,
					max: 5
				})
				.ok(function(data)
				{
					data.разделы.for_each(function()
					{
						this.раздел = true
					})
					
					callback(data.разделы.append(data.заметки))
				})
										
				var search =
				{
					cancel: function()
					{
						ajax.abort()
					}
				}
				
				return search
			},
			decorate: function(data)
			{
				if (data.раздел && data.icon_version)
				{
					var icon = $('<div/>')
						.addClass('icon')
						.css('background-image', 'url("/загруженное/читальня/разделы/' + data._id + '/крошечная обложка.jpg?version=' + data.icon_version + '")')
						.appendTo(this)
				}
				
				$('<div/>')
					.addClass('title')
					.text(data.название)
					.appendTo(this)
			},
			value: function(data)
			{
				if (data.раздел)
					return 'раздел ' + data._id
				
				return 'заметка ' + data._id
			},
			title: function(data)
			{
				return data.название
			},
			choice: function(value)
			{
				go_to('/читальня/' + this.путь)
			},
			nothing_found: function(query)
			{
				info(text('pages.library.section or article not found', { query: query }))
			},
			required: false
		})
	}
})()