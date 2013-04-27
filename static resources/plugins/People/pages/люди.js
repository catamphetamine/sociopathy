title(text('pages.people.title'));
	
(function()
{
	page.query('#id_cards', 'people')
	
	page.load = function()
	{
		page.either_way_loading
		({
			путь: text('pages.people.url'),
			с_номерами_страниц: true,
			data:
			{
				url: '/приложение/люди',
				name: 'люди',
				latest_first: true,
				batch_size: 18,
				loaded: function(people)
				{
					parse_dates(people, 'время рождения')
				},
				on_first_output: page.initialized
			},
			container: page.people,
			template: 'личная карточка',
			страница: page.data.номер_страницы,
			//page: page,
			error: 'Не удалось загрузить список людей',
			progress_bar: true
		})
	}
	
	page.unload = function()
	{
	}
})()