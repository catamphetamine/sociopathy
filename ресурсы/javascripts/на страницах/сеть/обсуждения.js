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
				data: function(data)
				{
					parse_dates(data.обсуждения, 'создано')
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
		else
		{
			page.discussions.find('> li').each(function()
			{
				var discussion = $(this)
				var container = discussion.find('> .unsubscribe')
				
				var the_button = button.physics.simple(new image_button(container.find('> button'),
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
						_id: talk.attr('_id')
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
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()