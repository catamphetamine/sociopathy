(function()
{
	title(text('pages.talks.title'))

	page.query('#talks', 'talks')
	
	function create_new_talk()
	{
		go_to(link_to('new communication', text('pages.talks.communication type')))
	}
	
	page.load = function()
	{
		page.подсказка('создание беседы', 'Вы можете завести новую беседу, выбрав действие «Завести новую беседу» (клавиша «' + Настройки.Клавиши.Показать_действия + '»)')
	
		breadcrumbs
		([
			{ title: text('pages.talks.title'), link: '/сеть/беседы' }
		])
		
		page.Available_actions.add(text('pages.talks.new'), create_new_talk, { действие: 'Создать' })

		$(document).on_page('message_read', function(event, что)
		{
			if (!что.беседа)
				return
			
			var общение = page.get('.author_content_date > li[_id="' + что.беседа + '"]')
				
			if (общение.exists())
				общение.removeClass('new')
		})
		
		$(document).on_page('talk_renamed', function(event, data)
		{
			var talk = $('#talks').find('>[_id="' + data._id + '"]')
			if (talk.exists())
				talk.find('.title').text(data.как)
		})
	}
	
	page.load_data
	({
		url: '/сеть/беседы',
		batch_size: 12,
		get_item_locator: function(data)
		{
			return data.обновлено_по_порядку
		},
		before_output: function(elements)
		{
			elements.for_each(function()
			{
				var talk = $(this)
				
				if (Новости.news['Talks'].беседы[talk.attr('_id')])
					talk.addClass('new')
					
				talk.find('.cancel_unparticipation').on('click', function(event)
				{
					event.preventDefault()
					
					page.Ajax.put('/сеть/беседы/участие',
					{
						_id: talk.attr('_id'),
						пользователь: пользователь._id
					})
					.ok(function()
					{
						page.refresh()
					})
					.ошибка(function(ошибка)
					{
						error(ошибка)
					})
				})
			})
		},
		data: function(data)
		{
			parse_dates(data.беседы, 'создана')
			
			data.беседы.for_each(function()
			{
				var беседа = this
				
				this.участники = this.участники || []
				
				this.участники.filter(function(участник)
				{
					return участник._id === пользователь._id
				})
				
				this.участники.each(function()
				{
					беседа.участник = true
				})
				
				if (this.последнее_сообщение)
				{
					parse_date(this.последнее_сообщение, 'когда')
					this.последнее_сообщение.когда_примерно = неточное_время(this.последнее_сообщение.когда, { blank_if_just_now: true })
				}
			})
			
			return data.беседы
		}
	})
	
	page.before_output_data(function(elements)
	{
		if (elements.is_empty())
		{
			page.talks.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	})
	
	page.data_template = 'беседа в списке бесед'
	page.data_container = 'talks'
	
	function create_context_menus()
	{
		page.talks.children().each(function()
		{
			create_context_menu($(this))
		})
	}
	
	function create_context_menu(talk)
	{
		var menu = talk.context_menu
		({
			items:
			[
				{
					title: text('pages.talks.talk.leave'),
					action: function()
					{
						page.Ajax.delete('/сеть/беседы/участие',
						{
							_id: talk.attr('_id')
						})
						.ok(function()
						{
							talk.find('> .left').show()
							talk.find('> a').remove()
							talk.find('> .leave').hide()
						})
						.ошибка(function(ошибка)
						{
							error(ошибка)
						})
					}
				}
			]
		})
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			// в обычном режиме - включать обратно подгрузку

			//populate_talks('беседа в списке бесед')(data)
			//ajaxify_internal_links(page.talks)
		},
		
		destroy: function()
		{
			//page.talks.find('> li').empty()
		},
		
		context_menus: function()
		{
			create_context_menus()
		}
	})
	
	// в режиме правки отключать подгрузку
	
	page.save = function(data) { }
})()