title(text('pages.discussions.title'))
	
;(function()
{	
	page.query('#discussions', 'discussions')
	page.query('#unread_discussions', 'unread_discussions')
	
	function start_new_discussion()
	{
		go_to('/сеть/общение/обсуждение')
	}
	
	page.load = function()
	{
		//Подсказка('создание обсуждения', 'Вы можете начать новое обсуждение, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Создать»</a>');
	
		breadcrumbs
		([
			{ title: text('pages.discussions.title'), link: '/сеть/обсуждение' }
		])
		
		page.Available_actions.add(text('pages.discussions.new'), start_new_discussion, { действие: 'Создать' })

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
		
		function interactive(discussion)
		{
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
				.ошибка(function(ошибка)
				{
					error(ошибка)
					the_button.unlock()
				})
			})
		}
		
		function postprocess_data(data)
		{
			parse_dates(data.обсуждения, 'создано')
			
			data.обсуждения.for_each(function()
			{
				var обсуждение = this
				
				if (page.unread_discussions.find('> li[_id="' + обсуждение._id + '"]').exists())
				{
					data.обсуждения.remove(обсуждение)
					return
				}
				
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
		
		new Data_templater
		({
			template: 'обсуждение в списке обсуждений',
			to: page.unread_discussions,
			loader: new  Data_loader
			({
				url: '/приложение/сеть/обсуждения/непрочитанные',
				done: page.initialized,
				before_done_more: function() { ajaxify_internal_links(page.unread_discussions) },
				before_output: function(elements)
				{
					elements.for_each(function()
					{
						var discussion = $(this)
						
						discussion.addClass('new')
						interactive(discussion)
					})
				},
				data: postprocess_data,
				before_done: function()
				{
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
									
									if (Новости.news['Discussions'].обсуждения[discussion.attr('_id')])
										discussion.addClass('new')
										
									interactive(discussion)
								})
							},
							data: postprocess_data
						})
					})
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
	}
})()