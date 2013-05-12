(function()
{
	title(text('pages.books.title'))
	
	page.query('#books', 'books')
	
	Режим.пообещать('правка')
	
	var loader
	
	page.data.books = {}
	
	page.Data_store.unmodified_data = {}
	
	page.data.удалённые = []
	
	page.load = function()
	{
		loader = page.either_way_loading
		({
			путь: '/сеть/книги',
			с_номерами_страниц: true,
			editable: true,
			data:
			{
				url: '/приложение/сеть/книги',
				name: 'книги',
				latest_first: true,
				batch_size: 16,
				loaded: function(books)
				{
					parse_dates(books, 'добавлена')
					
					books.forEach(function(book)
					{
						page.Data_store.new_data_loaded(function(store)
						{
							store[book._id] = book
						})
					})
				},
				postprocess_item: function(data)
				{
					this.attr('_id', data._id)
					activate_book_item(this)
				},
				on_first_output: books_loaded,
				before_output: function(elements)
				{
					elements.for_each(function()
					{
						create_context_menu(this)
					})
				}
			},
			container: page.books,
			template: 'книга в списке книг',
			страница: page.data.номер_страницы,
			error: 'Не удалось загрузить список книг',
			progress_bar: true
		})
	
		$(window).on_page('resize.books', center_books)
		
		initialize_search()
		
		var add_book = simple_value_dialog_window
		({
			class: 'add_book_dialog_window',
			title: text('pages.books.add'),
			ok_button_text: text('actions.add'),
			fields:
			[{
				id: 'title',
				description: text('pages.books.book.title'),
				validation: 'книга.название'
			},
			{
				id: 'author',
				description: text('pages.books.book.author'),
				validation: 'книга.сочинитель'
			}],
			ok: function(data, finish)
			{
				var loading = loading_indicator.show()
				
				page.Ajax.put('/сеть/книга', data)
				.ok(function(data)
				{
					loading.hide()
					finish(page.refresh)
				})
				.ошибка(function(message)
				{
					if (message === 'already exists')
						error(text('pages.books.adding.already exists'))
					else
						error('Не удалось добавить книгу')
						
					loading.hide()
					finish(true)
				})
				
				return 'wait'
			}
		})
		
		function add_a_book(options)
		{
			add_book.window.open(options)
		}
		
		page.Available_actions.add(text('pages.books.add'), add_a_book, { действие: 'Создать', immediate_transition_between_dialog_windows: true })

		page.book_cover_uploader = new Picture_uploader
		({
			uploading_screen_target: '.cover_image',
			max_size: 0.5,
			max_size_text: '500 килобайтов',
			url: '/сеть/книга/обложка',
			element: function()
			{
				return this.book
			},
			on_choose: function(book)
			{
				this.book = book
			},
			namespace: 'режим_правка',
			listener: function(listen)
			{
				Режим.при_переходе({ в: 'правка' }, function(event)
				{
					listen()
				})
			},
			ok: function(data, element)
			{
				element.find('.cover_image').css
				({
					'background-image': 'url(' + encodeURI(data.адрес) + ')',
					width: data.size.width + 'px',
					height: data.size.height + 'px',
					'margin-left': -parseInt(data.size.width / 2) + 'px'
				})
				
				element.data('новая_обложка', data)
			}
		})
		
		Режим.разрешить('правка')
	}
	
	Режим.on('обычный', function()
	{
		прокрутчик.process_scroll({ first_time: true })
	})
	
	function books_loaded()
	{
		page.content_ready()
		
		center_books()
		
		Режим.при_переходе({ в: 'правка' }, function()
		{
			//page.get('.empty').hide()
		})
	}
	
	page.unload = function()
	{
	}
	
	function center_books()
	{
		center_list($('#books'), { space: $('#content'), item_width: 1 + 410 + 1, item_margin: 20 })
	}
	
	function initialize_search()
	{
		search = page.get('.search').autocomplete
		({
			mininum_query_length: 3,
			search: function(query, callback)
			{
				var ajax = page.Ajax.get('/сеть/книги/поиск',
				{
					query: query,
					max: 5
				})
				.ok(function(data)
				{
					callback(data.книги)
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
			filter: function(книга)
			{
				return !page.data.удалённые.contains(книга._id)
			},
			decorate: function(книга)
			{
				this.text(книга.сочинитель + ' «' + книга.название + '»')
			},
			value: function(книга)
			{
				return книга._id
			},
			title: function(книга)
			{
				return книга.сочинитель + ' «' + книга.название + '»'
			},
			choice: function(_id)
			{
				loader.destroy()
				
				page.data.in_search_results = true
				
				page.Ajax.get('/сеть/книга', { _id: _id }).ok(function(data)
				{
					var book = $.tmpl('книга в списке книг', data.книга)
					
					book = $('<li/>').attr('_id', data.книга._id).append(book)
					
					create_context_menu(book)
					
					activate_book_item(book)
					
					page.books.empty().append(book)
				})
			},
			nothing_found: function(query)
			{
				info(text('pages.books.not found', { query: query }))
			},
			required: false
		})
		
		;(function()
		{
			search.focus()
		})
		.delay(1)
	}
	
	function create_context_menu(book)
	{
		var cover = book.find('.cover_image')
		
		var _id = book.attr('_id')
		
		var items =
		[{
			title: text('pages.books.book.add to bookshelf'),
			action: function()
			{
				page.Ajax.put('/сеть/книжный шкаф', { _id: _id }).ok(function()
				{
					info(text('pages.books.added to bookshelf', { 'user id': пользователь.id }))
				})
			}
		}]
		
		cover.context_menu({ items: items, selectable_element: book })
	}
	
	function activate_book_item(item)
	{
		item.on('thrown_out', function()
		{
			page.data.удалённые.add(item.attr('_id'))
		})
	}
	
	function populate(template)
	{
		return function(data)
		{
			Object.for_each(data, function()
			{
				var item = page.books.find('> [_id="' + this._id + '"]')
				
				$.tmpl(template, this).appendTo(item.empty())
				
				if (this.обложка)
					item.data('обложка', this.обложка)
			})
		}
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			populate('книга в списке книг')(data)
		},
		
		destroy: function()
		{
			page.books.find('> li').empty()
		},
		
		context_menus: function()
		{
			page.books.children().each(function()
			{
				create_context_menu($(this))
			})
		}
	})
	
	page.Data_store.режим('правка',
	{
		create: function(data)
		{
			populate('книга в списке книг (правка)')(data)
	
			page.book_dragger = new List_dragger(page.books,
			{
				drag_on: '.cover_image',
				throwable: true
			})
			
			page.books.children().each(function()
			{
				$(this).on('clicked.режим_правка', function()
				{
					page.book_cover_uploader.choose(this)
				})
			})
		},
		
		destroy: function(data)
		{
			page.book_dragger.destroy()
			
			page.books.find('> li').empty()
		}
	})
	
	page.Data_store.collect_edited = function()
	{
		var books = {}
		
		page.books.find('> li').each(function()
		{
			var item = $(this)
		
			var book =
			{
				сочинитель: item.find('.author').text().trim(),
				название: item.find('.title > span').text().trim()
			}
				
			if (item.data('новая_обложка'))
				book.новая_обложка = item.data('новая_обложка')
			else if (item.data('обложка'))
				book.обложка = item.data('обложка')
					
			var _id = item.attr('_id')
			
			book._id = _id
			
			book.id = page.Data_store.unmodified_data[_id].id
			book.icon_version = page.Data_store.unmodified_data[_id].icon_version
			
			books[_id] = book
		})
		
		Object.for_each(page.Data_store.unmodified_data, function(_id, book)
		{
			if (!books[_id])
				books[_id] = book
		})
		
		return books
	}
	
	page.save = function(data)
	{
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				var anything_changed = false
				
				var книги = this.книги
			
				if (!page.data.удалённые.пусто())
				{
					книги.удалённые = page.data.удалённые
					anything_changed = true
				}
				
				Object.for_each(page.Data_store.unmodified_data, function(_id, книга)
				{
					if (!data[_id])
						return
					
					if (книга.сочинитель !== data[_id].сочинитель
						|| книга.название !== data[_id].название)
					{
						книги.переименованные.push
						({
							_id: _id,
							сочинитель: data[_id].сочинитель,
							название: data[_id].название
						})
						
						anything_changed = true
					}
					
					if (data[_id].новая_обложка)
					{
						книги.обновлённые_обложки.push
						({
							_id: _id,
							обложка: JSON.stringify
							({
								имя: data[_id].новая_обложка.имя,
								ширина: data[_id].новая_обложка.size.width,
								высота: data[_id].новая_обложка.size.height
							})
						})
						
						anything_changed = true
					}
				})
				
				return anything_changed
			},
			
			data:
			{
				книги:
				{
					переименованные: [],
					удалённые: [],
					обновлённые_обложки: []
				}
			},
			
			url: '/приложение/сеть/книги',
			
			ok: function()
			{
				reload_page()
			}
		})
	}
})()