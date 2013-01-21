title(text('pages.discussions.title'));
	
(function()
{	
	page.query('#discussions', 'discussions')
	
	Режим.разрешить('действия')
	
	page.load = function()
	{
		Подсказка('создание обсуждения', 'Вы можете начать новое обсуждение, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Создать»</a>');
	
		breadcrumbs
		([
			{ title: text('pages.discussions.title'), link: '/сеть/обсуждение' }
		])
		
		text_button.new(page.get('.new_discussion.button')).does(function()
		{
			go_to('/сеть/общение/обсуждение')
		})

		$(document).on_page('message_read', function(event, что)
		{
			if (!что.обсуждение)
				return
			
			var общение = page.get('.author_content_date > li[_id="' + что.обсуждение + '"]')
				
			if (общение.exists())
				общение.removeClass('new')
		})
		
		$(document).on_page('discussion_renamed', function(event, data)
		{
			var discussion = $('#discussions').find('>[_id="' + data._id + '"]')
			if (discussion.exists())
				discussion.find('.title').text(data.как)
		})
				
		new Data_templater
		({
			template: 'обсуждение в списке обсуждений',
			to: page.discussions,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/обсуждения',
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: discussions_loaded,
				done: page.initialized,
				before_done_more: function() { ajaxify_internal_links(page.discussions) },
				before_output: function(elements)
				{
					elements.for_each(function()
					{
						var discussion = $(this)
						
						if (Новости.что_нового.обсуждения[discussion.attr('_id')])
							discussion.addClass('new')
					})
					
					elements.for_each(function()
					{
						var discussion = $(this)
						var container = discussion.find('> .unsubscribe')
					
						if (!container.exists())
							return
						
						var the_button = button.physics.simple(new image_button(container.find('> .button'),
						{
							'auto unlock': false
						}))
						
						container.hide()
						
						the_button.does(function()
						{
							page.Ajax.delete('/приложение/сеть/обсуждения/подписка',
							{
								_id: discussion.attr('_id')
							})
							.ok(function()
							{
								the_button.element.fade_out(0.3)
							})
							.ошибка(function()
							{
								error(ошибка)
								the_button.unlock()
							})
						})
					})
				},
				data: function(data)
				{
					parse_dates(data.обсуждения, 'создано')
					
					data.обсуждения.for_each(function()
					{
						var обсуждение = this
						
						this.подписчики = this.подписчики || []
						
						this.подписчики.filter(function(подписчик)
						{
							return подписчик === пользователь._id
						})
						
						this.подписчики.each(function()
						{
							обсуждение.подписан = true
						})
						
						if (this.последнее_сообщение)
						{
							parse_date(this.последнее_сообщение, 'когда')
							this.последнее_сообщение.когда_примерно = неточное_время(this.последнее_сообщение.когда)
						}
					})
					
					return data.обсуждения
				}
			})
		})
	}
	
	function discussions_loaded()
	{
		if (page.discussions.is_empty())
		{
			page.discussions.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	$(document).on_page('keydown.actions', function(event)
	{
		if (Клавиши.поймано(Настройки.Клавиши.Действия.Создать, event))
		{
			return go_to('/сеть/общение/обсуждение')
		}
	})
})()