(function()
{
	Режим.пообещать('правка')
	//Режим.пообещать('действия')
	
	title(text('pages.bookshelf.title'))

	page.load = function()
	{
		title(text('pages.books.title') + '. ' + page.data.адресное_имя)

		text_button.new(page.get('.add_book')).does(function()
		{
			go_to('/сеть/книги')
		})
		
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
				
				//page.get('.bookshelf').find('.book').attr('draggable', true)
			}
			else if (из === 'правка')
			{
				//page.get('.bookshelf').find('.book').removeAttr('draggable')
			}
		})
		
		new Data_templater
		({
			template: 'книжный шкаф',
			container: $('.bookshelf_container'),
			single: true
		},
		new  Data_loader
		({
			url: '/человек/книги',
			parameters: { 'адресное имя': page.data.адресное_имя },
			before_done: books_loaded,
			done: books_shown,
			get_data: function(data)
			{
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
					{ title: text('pages.bookshelf.title'), link: '/люди/' + page.data.адресное_имя + '/книги' }
				])
				
				var books = data.книги
				
				while (books.length % Configuration.Book_shelf_size > 0
						|| books.length < Configuration.Book_shelf_size * Configuration.Minimum_book_shelves)
				{
					books.push({})
				}
				
				var shelves = []
				
				while (books.length > Configuration.Book_shelf_size)
				{
					shelves.push({ books: books.splice(0, Configuration.Book_shelf_size) })
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
				fade_in_duration: 0.0,
				fade_out_duration: 0.0
			})
		})
		
		$('.bookshelf_container .book_place').animate({ opacity: 1 }, 500)
			
		$('.bookshelf_container .book').each(function()
		{
			initialize_context_menu($(this))
		})
			
		Режим.разрешить('правка')
		//Режим.разрешить('действия')
		
		page.initialized()
	}
	
	function initialize_context_menu(book)
	{
		var list_item = book.parent()
		
		var menu_items = {}
		
		menu_items[text('pages.bookshelf.book.remove')] = function(_id)
		{
			page.Ajax.delete('/сеть/книжный шкаф', { _id: _id }).ok(function()
			{
				info(text('pages.bookshelf.book.removed'))
				page.refresh()
			})
		}
		
		var menu = book.context_menu(menu_items)
		
		menu.data = list_item.attr('_id')
	}
	
	page.save = function(данные)
	{
		info('Правка личного книжного шкафа пока не сделана')
		Режим.изменения_сохранены()
	}
})()