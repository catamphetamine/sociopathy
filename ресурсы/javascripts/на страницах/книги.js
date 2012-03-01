function initialize_page()
{
	$('.book.no_icon .author').fill_with_text()
	$('.book.no_icon .title').fill_with_text({ 'center vertically': true })
	
	$('.book_place .book_info').each(function()
	{
		var info = $(this)
		var info_container = info.parent()
		var book_place = info_container.parent()
		
		info_container.css
		({
			left: -parseInt((info.outerWidth() - book_place.width()) / 2) + 'px',
			top: parseInt(book_place.height() * 0.9) + 'px'
		})
		
		info_container.hide()
		
		activate_popup
		({
			activator: book_place.find('.book'),
			popup: info_container,
			fade_in_duration: 0.1,
			fade_out_duration: 0.1
		})
		
	})
}

var books = 
[
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи',
		icon: 'фритьоф капра «скрытые связи»'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи',
		icon: 'фритьоф капра «скрытые связи»'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи',
		icon: 'фритьоф капра «скрытые связи»'
	},
	
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи'
	},
	{
		author: 'Фритьоф Капра',
		title: 'Скрытые связи',
		icon: 'фритьоф капра «скрытые связи»'
	}
]

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

shelves.push(books)

window.данные_для_страницы.shelves = shelves