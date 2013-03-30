title(text('pages.talks.title'));

(function()
{
	page.query('#talks', 'talks')
	
	function create_new_talk()
	{
			go_to('/сеть/общение/беседа')
	}
	
	page.load = function()
	{
		//Подсказка('создание беседы', 'Вы можете завести новую беседу, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Создать»</a>');
	
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
	
		new Data_templater
		({
			template: 'беседа в списке бесед',
			to: page.talks,
			conditional: initialize_conditional($('.main_conditional'), { immediate: true }),
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/беседы',
				batch_size: 18,
				scroll_detector: page.get('#scroll_detector'),
				before_done: talks_loaded,
				before_done_more: function() { ajaxify_internal_links(page.talks) },
				before_output: function(elements)
				{
					elements.for_each(function()
					{
						var talk = $(this)
						
						if (Новости.news['Talks'].беседы[talk.attr('_id')])
							talk.addClass('new')
					})
					
					elements.for_each(function()
					{
						var talk = $(this)
						var container = talk.find('> .leave')
					
						var the_button = button.physics.simple(new image_button(container.find('> .button'),
						{
							'auto unlock': false
						}))
						
						container.hide()
						
						the_button.does(function()
						{
							page.Ajax.delete('/приложение/сеть/беседы/участие',
							{
								_id: talk.attr('_id')
							})
							.ok(function()
							{
								the_button.element.fade_out(0.3)
								
								talk.find('> .left').show()
								talk.find('> a').remove()
								talk.find('> .leave').hide()
							})
							.ошибка(function(ошибка)
							{
								error(ошибка)
								the_button.unlock()
							})
						})
					})
				},
				done: page.initialized,
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
							this.последнее_сообщение.когда_примерно = неточное_время(this.последнее_сообщение.когда)
						}
					})
					
					return data.беседы
				}
			})
		})
	}
	
	function talks_loaded()
	{
		if (page.talks.is_empty())
		{
			page.talks.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	}
})()