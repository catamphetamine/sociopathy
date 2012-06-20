(function()
{
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	Validation.книги =
	{
		название: function(название, callback)
		{
			if (название.length === 0)
				return callback({ error: 'Укажите название книги' })
				
			callback()
		},
		
		сочинитель: function(сочинитель, callback)
		{
			if (сочинитель.length === 0)
				return callback({ error: 'Укажите сочинителя книги' })
				
			callback()
		}
	}
	
	var add_book_window
	
	page.load = function()
	{
		title('Книги. ' + page.data.адресное_имя)
	
		add_book_window = simple_value_dialog_window
		({
			id: 'add_book_window',
			title: 'Добавить книгу',
			fields:
			[{
				id: 'название',
				description: 'Название',
				validation: 'книги.название',
				'in-place label': true
			},
			{
				id: 'сочинитель',
				description: 'Сочинитель',
				validation: 'книги.сочинитель',
				'in-place label': true
			}],
			ok_button_text: { 'add': 'Добавить', 'apply': 'Применить' },
			ok: function(data)
			{
				info('Добавить книгу')
				console.log(data)
			},
			on_open: function()
			{
				
			},
			on_cancel: function()
			{
			}
		})
		.window
		
		var image = $('<img/>')
		image.attr('src', '/картинки/на страницах/человек/книги/обложка не загружена.jpg')
		image.addClass('no_icon')
		
		image.on('click', function()
		{
			info('выбрать картинку')
		})
		
		var image_centerer = $('<table/>')
		
		var image_centerer_row = $('<tr/>')
		image_centerer_row.appendTo(image_centerer)

		var image_centerer_cell = $('<td/>')
		image_centerer_cell.appendTo(image_centerer_row)
		image_centerer_cell.append(image)
		
		add_book_window.content.find('.icon').append(image_centerer)
		
		var add_book = text_button.new($('.main_content .add_book')).does(function()
		{
			add_book_window.content.removeClass('edit').addClass('add')
			add_book_window.open()
		})
		
		add_book.element.invisible().hide()
		
		Режим.добавить_проверку_перехода(function(из, в)
		{
			if (в === 'правка')
			{
				if (!page.data.пользователь_сети)
				{
					info('Здесь нечего править')
					return false
				}
				
				if (пользователь['адресное имя'] !== page.data.пользователь_сети['адресное имя'])
				{
					info('Это не ваши личные данные, и вы не можете их править.')
					return false
				}
			}
		})
	
		$(document).on_page('режим.переход', function(event, из, в)
		{
			if (в === 'правка')
			{
				add_book.element.fade_in(0.2)
				
				$('.book_place .book').each(function()
				{
					var book = $(this)
					book.on('click.режим_правка', function(event)
					{
						event.preventDefault()
						info("открыть окошко правки книги")
					})
				})
				
				return
			}
			
			if (из === 'правка')
			{
				add_book.element.fade_out(0.2)
				return
			}
		})
		
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })

		new Data_templater
		({
			template_url: '/страницы/кусочки/книжный шкаф.html',
			container: $('.bookshelf_container'),
			/*
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			*/
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/человек/книги',
			parameters: { 'адресное имя': page.data.адресное_имя },
			before_done: books_loaded,
			done: books_shown,
			get_data: function(data)
			{
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
					{ title: 'Книги', link: '/люди/' + page.data.адресное_имя + '/книги' }
				])
				
				var books = data.книги
				
				while (books.length % Options.Book_shelf_size > 0
						|| books.length < Options.Book_shelf_size * Options.Minimum_book_shelves)
				{
					books.push({})
				}
				
				var shelves = []
				
				while (books.length > Options.Book_shelf_size)
				{
					shelves.push({ books: books.splice(0, Options.Book_shelf_size) })
				}
				
				shelves.push({ books: books })
				
				return { shelves: shelves }
			}
		}))
	}
	
	function books_loaded()
	{
		$('.bookshelf_container .book_place').invisible()
	}
	
	function books_shown()
	{
		$('.book.no_icon .author').fill_with_text({ Font_size_increment_step: 2 })
		$('.book.no_icon .title').fill_with_text({ 'center vertically': true, Font_size_increment_step: 2 })
		
		$('.book_place .book_info').each(function()
		{
			var info = $(this)
			var book_place = info.parent()
			
			info.css
			({
				left: -parseInt((info.outerWidth() - book_place.width()) / 2) + 'px',
				top: parseInt(book_place.height() * 0.9) + 'px'
			})
			
			info.hide()
			
			activate_popup
			({
				activator: book_place.find('.book'),
				popup: info,
				fade_in_duration: 0.1,
				fade_out_duration: 0.1
			})
		})
		
		$('.bookshelf_container .book_place').animate({ opacity: 1 }, 500)
			
		Режим.разрешить('правка')
		Режим.разрешить('действия')
		
		$(document).trigger('page_initialized')
	}
})()