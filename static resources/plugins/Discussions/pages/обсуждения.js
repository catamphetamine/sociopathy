(function()
{	
	title(text('pages.discussions.title'))
	
	page.query('#discussions', 'discussions')
	
	function start_new_discussion()
	{
		go_to(link_to('new communication', text('pages.discussions.communication type')))
	}
	
	page.data.подписан_на_обсуждения = []
	
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
		
		function postprocess_data(data)
		{
			parse_dates(data.обсуждения, 'создано')
			
			data.обсуждения.for_each(function()
			{
				var обсуждение = this
				
				this.подписчики = this.подписчики || []
				
				if (this.подписчики.contains(пользователь._id))
				{
					обсуждение.подписан = true
					
					page.data.подписан_на_обсуждения.add(обсуждение._id)
				}
				
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
			to: page.discussions,
			loader: new  Data_loader
			({
				url: '/сеть/обсуждения/непрочитанные',
				before_output: function(elements)
				{
					elements.for_each(function()
					{
						var discussion = $(this)
						
						discussion.addClass('new')
					})
				},
				data: function(data)
				{
					page.data.unread_discussions = data.обсуждения.map(function(discussion) { return discussion._id })
					
					return postprocess_data(data)
				},
				before_done: function()
				{
					ajaxify_internal_links(page.discussions)
				
					new Data_templater
					({
						template: 'обсуждение в списке обсуждений',
						to: page.discussions,
						loader: new  Batch_data_loader_with_infinite_scroll
						({
							url: '/сеть/обсуждения',
							batch_size: 12,
							get_item_locator: function(data)
							{
								return data.обновлено_по_порядку
							},
							scroll_detector: page.get('#scroll_detector'),
							before_done: discussions_loaded,
							before_done_more: function()
							{
								ajaxify_internal_links(page.discussions)
							},
							done: page.content_ready,
							before_output: function(elements)
							{
								elements.for_each(function()
								{
									var discussion = this
									
									var _id = discussion.attr('_id')
									if (page.data.unread_discussions.contains(_id))
										return discussion.remove()
									
									if (Новости.news['Discussions'].обсуждения[discussion.attr('_id')])
										discussion.addClass('new')
										
									create_context_menu(discussion)
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
	
	function create_context_menu(discussion)
	{
		var _id = discussion.attr('_id')
		
		if (!page.data.подписан_на_обсуждения.contains(_id))
			return
		
		var menu = {}
		menu[text('pages.discussions.discussion.unsubscribe')] = function()
		{
			page.Ajax.delete('/сеть/обсуждения/подписка',
			{
				_id: _id
			})
			.ok(function()
			{
				page.refresh()
			})
			.ошибка(function(ошибка)
			{
				error(ошибка)
			})
		}
		
		discussion.context_menu(menu)
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			// в обычном режиме - включать обратно подгрузку

			//populate_discussions('обсуждение в списке обсуждений')(data)
			//ajaxify_internal_links(page.discussions)
		},
		
		destroy: function()
		{
			//page.discussions.find('> li').empty()
		}
	})
	
	// в режиме правки отключать подгрузку
	
	page.save = function(data) { }
})()