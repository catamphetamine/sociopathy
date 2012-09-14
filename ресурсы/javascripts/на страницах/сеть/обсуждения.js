title('Обсуждения');
	
(function()
{	
	page.query('#discussions', 'discussions')
	
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете обсуждать что-нибудь с другими членами сети.')

		breadcrumbs
		([
			{ title: 'Обсуждения', link: '/сеть/обсуждение' }
		])
		
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
					
						var the_button = button.physics.simple(new image_button(container.find('> .button'),
						{
							'auto unlock': false
						}))
						
						container.on('mouseenter', function()
						{
							container.css('opacity', 1)
						})
						
						container.on('mouseleave', function()
						{
							container.css('opacity', 0)
						})
						
						container.css('opacity', 0)
						
						the_button.does(function()
						{
							Ajax.delete('/приложение/сеть/обсуждения/подписка',
							{
								_id: discussion.attr('_id')
							})
							.ok(function()
							{
								the_button.element.fade_out(0.3)
							})
							.ошибка(function()
							{
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
						
						iterate(this.подписчики || [], function(подписчик)
						{
							return подписчик === пользователь._id
						},
						function()
						{
							обсуждение.подписан = true
						})
					})
					
					return data.обсуждения
				}
			})
		})
	}
	
	function discussions_loaded()
	{
		$(document).trigger('page_initialized')
		
		if (page.discussions.is_empty())
		{
			page.discussions.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()