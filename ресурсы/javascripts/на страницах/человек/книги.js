(function()
{
	title('Книги. ' + page.data.адресное_имя)
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/книжный шкаф.html',
			item_container: $('.bookshelf_container'),
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
			before_done_output: books_loaded,
			done: books_shown,
			get_data: function(data)
			{
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
		$('.bookshelf_container .book_place').css('opacity', 0)
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
			
			info.css('opacity')
			
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