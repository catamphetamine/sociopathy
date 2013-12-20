title(text('pages.people.title'));
	
(function()
{
	page.query('#id_cards', 'people')
	
	page.load_data_either_way
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
				
				people.for_each(function()
				{
					if (this['когда был здесь'])
						parse_date(this, 'когда был здесь')
					
					this.with_online_status = true
					
					if (пользователь)
						if (пользователь._id == this._id)
							this.with_online_status = false
				})
			},
			on_first_output: function()
			{
				initialize_search()
				page.content_ready()
				
				if (page.people.children().length > 0)
				{
					page.people.css('position', 'relative')
				
					var id_card = $(page.people.children()[0])
				
					if (id_card.css('display') !== 'inline-block')
						throw 'List item display must be "inline-block"'
				
					page.id_card_width = id_card.outerWidth()
					page.id_card_side_margin = parseInt(id_card.css('margin-left'))
				
					center_people_list()
				}
			},
			postprocess_item: function(data)
			{
				new User_online_status(this).show(data['когда был здесь'])
			}
		},
		template: 'личная карточка',
		страница: page.data.номер_страницы,
		error: 'Не удалось загрузить список людей',
		progress_bar: true
	})
	
	page.data_container = 'people'
	
	page.load = function()
	{
		$(window).on_page('resize', center_people_list)
	}
	
	function center_people_list()
	{
		if (!page.id_card_width)
			return
			
		center_list(page.people, { space: $('#content'), item_width: page.id_card_width, side_margin: page.id_card_side_margin })
	}
	
	function initialize_search()
	{
		search = users_autocomplete(page.get('.search'),
		{
			choice: function(_id)
			{
				page.data_loader.destroy()
		
				go_to(text('pages.people.url') + '/' + this.id)
			},
			
			nothing_found: function(query)
			{
				info(text('pages.people.not found', { query: query }))
			}
		})
		
		;(function()
		{
			search.focus()
		})
		.delay(1)
	}
})()