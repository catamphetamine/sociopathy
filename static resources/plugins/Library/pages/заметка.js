(function()
{
	Режим.пообещать('правка')
	//Режим.пообещать('действия')
	
	var заметка = page.data.заметка
	var неправленная_заметка
		
	var visual_editor
	
	function get_title()
	{
		return visual_editor.editor.content.parent().find('> h1').text().trim()
	}
	
	function set_title(title)
	{
		return visual_editor.editor.content.parent().find('> h1').text(title)
	}
	
	page.load = function()
	{
		Подсказка('правка заметки', 'Вы можете переименовать и править заметку, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>. Вы можете перенести или удалить эту заметку, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>');

		function get_breadcrumbs()
		{
			var link = '/читальня'
			var crumbs = [{ title: text('pages.library.title'), link: link }]
			
			page.data.путь_к_заметке.split('/').forEach(function(раздел_или_заметка)
			{
				link += '/' + раздел_или_заметка
				crumbs.push({ title: раздел_или_заметка , link: link })
			})
			
			return crumbs
		}

		breadcrumbs(get_breadcrumbs())
		
		new Data_templater
		({
			template: 'заметка читальни',
			to: page.get('.main_content'),
			single: true
		},
		new  Data_loader
		({
			url: '/читальня/заметка',
			parameters: { _id: page.data.заметка },
			get_data: function(data)
			{
				title(data.заметка.название)
			   
				неправленная_заметка =
				{
					название: data.заметка.название,
					содержимое: data.заметка.содержимое
				}
				
				page.data.версия = data.заметка.версия

				return data.заметка
			},
			before_done: article_loaded,
			done: page.initialized
		}))
	}
	
	page.unload = function()
	{
		if (visual_editor)
			visual_editor.unload()
	}
	
	function initialize_editor()
	{
		visual_editor = new Visual_editor('.main_content > article > section')
	
		// изначально в режиме просмотра - отключить снасти
		visual_editor.unbind()
		
		visual_editor.initialize_tools_container()
		visual_editor.tools_element.floating_top_bar()
		
		visual_editor.tools_element.on('floats.floating_top_bar', function()
		{
			$(this).parent().css('position', 'static')
		})
		
		visual_editor.tools_element.on('unfloats.floating_top_bar', function()
		{
			$(this).parent().css('position', 'relative')
		})
		
		visual_editor.can_edit = function() { return Режим.правка_ли() }
		
		visual_editor.keep_cursor_on_screen()
		
		Режим.при_переходе({ в: 'правка' }, function()
		{
			visual_editor.activate_tools_inside_content()
			visual_editor.editor.content.editable()
			
			visual_editor.show_tools()
			
			if ($.browser.mozilla)
				visual_editor.editor.content.focus()
			
			visual_editor.editor.caret.move_to(visual_editor.editor.content.find('> *:first'))
		})
		
		Режим.при_переходе({ из: 'правка' }, function()
		{
			visual_editor.hide_tools()
			visual_editor.unbind()
			visual_editor.editor.content.not_editable()
		})
		
		// при нажатии Ввода на основном заголовке - перейти к первому абзацу
		$('article h1').on('keypress', function(event)
		{
			if (!Режим.правка_ли())
				return
				
			if (Клавиши.is('Enter', event))
			{
				event.preventDefault()
				visual_editor.editor.move_caret_to(visual_editor.editor.content.find('p:first'))
			}
		})
	}
	
	function article_loaded()
	{
		postprocess_rich_content($('article'))
		
		initialize_editor()
		
		Режим.разрешить('правка')
		
		function delete_article()
		{
			if (!confirm('Удалить эту заметку в корзину?\nСейчас пока не сделано восстановление из корзины, поэтому мы спрашиваем.'))
				return

			page.Ajax.delete('/сеть/читальня/заметка',
			{
				_id: page.data.заметка
			})
			.ok(function(data)
			{
				go_to('/читальня/' + data.путь_к_разделу)
			})
		}
		
		//Режим.разрешить('действия')
	}
	
	page.Data_store.collect_edited = function()
	{
		var data =
		{
			название: get_title(),
			содержимое: Wiki_processor.parse_and_validate(visual_editor.editor.html(),
			{
				/*process_element: function(wiki, decorated)
				{
					wiki.attr('author', decorated.attr('author') || пользователь._id)
				}*/
			})
		}
		
		return data
	}
	
	page.Data_store.deduce = function()
	{
		return неправленная_заметка
	}
	
	page.save = function(data)
	{
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				if (page.Data_store.unmodified_data.название != page.Data_store.edited_data.название)
					return true
				
				if (page.Data_store.unmodified_data.содержимое != page.Data_store.edited_data.содержимое)
					return true
				
				return false
			},
			
			validate: function()
			{
			},
			
			data:
			{
				_id: заметка,
				название: page.Data_store.edited_data.название,
				содержимое: page.Data_store.edited_data.содержимое,
				версия: page.data.версия
			},
			
			url: '/сеть/читальня/заметка',
			
			ok: function(data)
			{
				if (data.старая_версия)
				{
					info('Кто-то успел внести правки в эту заметку, пока вы её правили. В данное время ещё не написана система автоматического слияния правок, \nпоэтому мы предлагаем вам внести свои правки заново в <a href=\'' + Uri.parse(window.location).to_relative_url() + '\'>самую свежую версию этой заметки</a>. Для перенесения ваших правок, мы советуем вам воспользоваться инструментом «Исходный код» \n(который находится на панели инструментов, во второй строке)', {})
					return false
				}
			
				page.data.версия = data.версия
			
				if (data.путь)
					return go_to('/читальня/' + data.путь)
			
				неправленная_заметка =
				{
					название: data.название,
					содержимое: data.содержимое
				}
				
				set_title(data.название)
				visual_editor.editor.set_content(Wiki_processor.decorate(data.содержимое))
			}
		})
	}
	
	page.discard = function()
	{
		return reload_page()
	
		// for later use
	
		var loading = loading_indicator.show()
		
		alert('Предоставьте _id')
		
		page.Ajax.delete('/сеть/черновик',
		{
			что: "заметка",
			_id: null
		})
		.ошибка(function(ошибка)
		{
			loading.hide()
			
			error(ошибка)
		})
		.ok(function(data)
		{
			loading.hide()
			
			Режим.обычный()
			
			visual_editor.editor.load_content(Wiki_processor.decorate(неправленная_заметка.content))
			
			postprocess_rich_content(visual_editor.editor.get_content())
			
			set_title(неправленная_заметка.title)
		})
	}
})()