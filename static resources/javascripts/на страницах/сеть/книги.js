title(text('pages.books.title'))

;(function()
{
	page.needs_initializing = true
	
	page.query('#books', 'books')
	
	var loader
	
	page.load = function()
	{
		loader = page.either_way_loading
		({
			путь: '/сеть/книги',
			с_номерами_страниц: true,
			data:
			{
				url: '/приложение/сеть/книги',
				name: 'книги',
				latest_first: true,
				batch_size: 16,
				loaded: function(books)
				{
					parse_dates(books, 'добавлена')
				},
				on_first_output: page.initialized,
				before_output: initialize_context_menus
			},
			container: page.books,
			template: 'книга в списке книг',
			страница: page.data.номер_страницы,
			error: 'Не удалось загрузить список книг',
			progress_bar: true
		})
	
		$(window).on_page('resize.books', center_books)
		
		initialize_search()
	}
	
	page.unload = function()
	{
	}
	
	function center_books()
	{
		center_list($('#books'), { space: $('#content'), item_width: 410, item_margin: 20 })
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
				
				page.Ajax.get('/сеть/книга', { _id: _id }).ok(function(data)
				{
					var book = $.tmpl('книга в списке книг', data.книга)
					initialize_context_menu(book)
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
	
	function initialize_context_menus(books)
	{
		books.for_each(function()
		{
			initialize_context_menu($(this))
		})
	}
	
	function initialize_context_menu(book)
	{
		var cover = book.find('.cover_image')
		
		var menu = cover.context_menu
		({
			'Добавить себе': function(_id)
			{
				page.Ajax.put('/сеть/книжный шкаф', { _id: _id }).ok(function()
				{
					info(text('pages.books.added to bookshelf', { 'user id': пользователь['адресное имя'] }))
				})
			}
		})
		
		menu.data = book.attr('_id')
	}
})()