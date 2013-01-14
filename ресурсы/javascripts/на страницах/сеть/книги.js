title('Книги')

/*
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
*/

page.load = function()
{
	either_way_loading
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
				return books
			},
			on_first_output: page.initialized
		},
		container: '#books',
		template: '/страницы/кусочки/книга в списке книг.html',
		страница: page.data.номер_страницы,
		error: 'Не удалось загрузить список книг',
		progress_bar: true
	})

	$(window).on_page('resize.books', center_books)
	center_books()
}

function center_books()
{
	center_list($('#books'), { space: $('#content'), item_width: 410, item_margin: 20 })
}

page.needs_initializing = true