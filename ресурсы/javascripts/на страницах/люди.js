(function()
{
	title('Люди')
	
	page.load = function()
	{
		either_way_loading
		({
			путь: '/люди',
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
					return people
				}
			},
			container: '#id_cards',
			template: '/страницы/кусочки/личная карточка.html',
			страница: page.data.номер_страницы,
			//page: page,
			error: 'Не удалось загрузить список людей',
			progress_bar: true
		})
	}
})()