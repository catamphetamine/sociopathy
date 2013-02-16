(function()
{
	Режим.пообещать('правка')
	Режим.пообещать('действия')
		
	//var on_the_right_side_of_the_panel_right
	
	page.query('#categories', 'categories')
	
	page.load = function()
	{
		if (!page.data.раздел)
			title(text('pages.library.title'))
	
		Подсказка('добавление в читальню', 'Вы можете добавлять разделы, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>. Вы можете добавлять заметки, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Добавить»</a>')
		Подсказка('правка разделов', 'Вы можете добавлять, удалять и переименовывать разделы, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>. Для удаления раздела — «потащите» его мышью и «выбросите» в сторону')
		Подсказка('перенос раздела', 'Вы можете перенести этот раздел, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>')
		//Подсказка('временные глюки читальни', 'Не сообщайте мне пока о следующих глюках читальни: \n невозможность рекурсивного удаления разделов, \nстарые пути к разделам и заметкам после их переименования или переноса. \n Я знаю об этих глюках, и поправлю их в следующей версии сайта. Я решил, что лучше «выкатить» сейчас то, что есть, чем ждать ещё полгода-год.');

		//insert_search_bar_into($('#panel'))
		
		//on_the_right_side_of_the_panel_right = $('.on_the_right_side_of_the_panel').css('right')
		//$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
		
		var путь_к_разделу
		var match = путь_страницы().match(/читальня\/(.+)/)
		if (match)
			путь_к_разделу = match[1]
			
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })

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
						postprocess_element: function(item, data)
						{
							return $('<li/>').attr('_id', data._id)//.append(item)
						}
					},
					заметки:
					{
						template: 'заметка раздела читальни',
						container: $('#articles'),
						postprocess_element: function(item, data)
						{
							return $('<li/>').attr('_id', data._id).append(item)
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
					//page.data.заметки = data.раздел.заметки
					
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
	
	function add_category()
	{
		var list_item = $('<li/>').append($.tmpl('раздел читальни (правка)', { название: 'Название раздела' }))
		list_item.appendTo(page.categories)
		
		list_item.find('.title > span').focus().on('keypress', function()
		{
			if ($(this).text() === 'Название раздела')
				$(this).text('')
		})
	}
	
	function categories_loaded()
	{
		text_button.new('.main_content > .add > .button').does(add_category)
		
		page.hotkey('Действия.Добавить', 'правка', add_category)
		
		Режим.при_переходе({ в: 'правка' }, function()
		{
			page.get('.empty').hide()	
		})
		
		//page.get('.breadcrumbs > span:last').attr('editable', true)
			
		Режим.разрешить('правка')
		
		if (!page.data.раздел)
			return Режим.запретить('действия')
		
		var move_category_window = simple_value_dialog_window
		({
			class: 'move_category_window',
			title: 'Перенести этот раздел',
			ok_button_text: 'Перенести',
			fields:
			[{
				id: 'where',
				description: 'Скопируйте сюда ссылку на раздел, \nв который вы хотите переместить этот раздел',
				validation: 'читальня.ссылка_на_раздел'
			}],
			ok: function(where)
			{
				var раздел = move_category_window.form.раздел
				
				var data =
				{
					раздел: page.data.раздел
				}
				
				if (раздел)
					data.куда = раздел
				
				page.Ajax.post('/приложение/сеть/читальня/раздел/перенести', data)
				.ok(function(data)
				{
					info('Раздел перенесён')
					go_to('/читальня/' + data.путь)
				})
				.ошибка(function(ошибка)
				{
					error(ошибка)
				})
			}
		})
		.window
		
		text_button.new('.main_content > .move > .button').does(function()
		{
			move_category_window.open()
		})
		
		function new_article()
		{
			go_to('/сеть/читальня/заметка/' + page.data.раздел)
		}
		
		text_button.new('.main_content > .new_article > .button').does(new_article)
		page.hotkey('Действия.Добавить', 'действия', new_article)
			
		Режим.разрешить('действия')
	}
	
	function center_categories_list()
	{
		center_list($('#categories'), { space: $('#content'), item_width: 250, item_margin: 40 })
	}
	
	//page.Data_store.что = 'заметка'
	//page.Data_store.query = { заметка:  }
	
	//page.Data_store.is_used = true

	var populate = function(template)
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
				
				$.tmpl(template, раздел).appendTo(this)
			})
		}
	}
	
	page.Data_store.populate_draft = function(data)
	{
		populate('раздел читальни (правка)')(data)
		
		page.dragger = new Dragger(page.categories,
		{
			dont_start_dragging_on: '.title > span'
		})
		
		var draggable_sorter = new Draggable_sorter(page.categories, page.dragger)
			
		page.categories.find('> li').each(function()
		{
			var category = $(this)
			
			if (category.hidden())
				return
			
			var _id = category.attr('_id')
				
			if (!_id)
				return
			
			var thrower
			
			category.on('dragging_starts', function(event)
			{
				thrower = new Thrower()
				
				draggable_sorter.dragging_started(category)
			})
			
			category.on('dragging', function(event, data)
			{
				draggable_sorter.dragged(category, data.left, data.top)
				
				thrower.moved(data)
				
				if (thrower.throwing)
				{
					page.dragger.options.come_back_after_drop = false
				}
				else
				{
					page.dragger.options.come_back_after_drop = true
				}
			})
			
			category.on('dropped', function(event)
			{
				thrower.stop_watching()
					
				if (thrower.thrown())
				{
					thrower.throw_out(category)
					
					category.fade_out(0.2, { hide: false }, function()
					{
						page.dragger.destroy(category)
						
						thrower.stop_throwing()
						
						category.css('width', 0)
						category.css('margin-left', 0)
						category.css('margin-right', 0)
						
						;(function()
						{
							category.remove()
						})
						.delay(300)
					})
				}
			})
		})
	}
	
	page.Data_store.remove_draft = function(data)
	{		
		page.dragger.destroy()
		
		this.reset_view()
	}
	
	page.Data_store.populate_view = function(data)
	{
		populate('раздел читальни')(data)
		ajaxify_internal_links(page.categories)
		
		page.categories.find('> li').each(function()
		{
			if (!$(this).attr('_id') && $(this).find('.title span').is_empty())
				$(this).remove()
		})
	}
	
	page.Data_store.reset_view = function()
	{
		page.categories.find('> li').empty()
	}
	
	page.Data_store.collect_unmodified = function()
	{
		var data = { разделы: { новые: [] } }
		
		var index = 0
		
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
			
			/*
			var background_url = category.find('.title').background_url()
			if (background_url)
				category_data.background_version = Uri.parse(background_url).version
			*/
				
			var _id = category.attr('_id')
			
			if (!_id)
				return data.разделы.новые.push(category_data)
			
			category_data._id = _id
			category_data.путь = page.Data_store.unmodified_data.разделы[_id].путь
			category_data.background_version = page.Data_store.unmodified_data.разделы[_id].background_version
			
			data.разделы[_id] = category_data
		})
		
		return data
	}

	page.Data_store.collect_edited = page.Data_store.collect_unmodified	
	
	page.Data_store.deduce = function()
	{
		var data = { разделы: {} }
		
		page.data.разделы.for_each(function()
		{
			data.разделы[this._id] = this
		})
		
		return data
	}
	
	page.Data_store.reset = function()
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
							_id: data.разделы[_id]._id,
							название: data.разделы[_id].название
						})
						
						anything_changed = true
					}
					
					if (раздел.порядок !== data.разделы[_id].порядок)
					{
						данные.разделы.переупорядоченные.push
						({
							_id: data.разделы[_id]._id,
							порядок: data.разделы[_id].порядок
						})
						
						anything_changed = true
					}
				})
				
				// ещё проверить переупорядоченность заметок - сделать
				
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
	
	page.Data_store.refresh_when_switching = true
})()