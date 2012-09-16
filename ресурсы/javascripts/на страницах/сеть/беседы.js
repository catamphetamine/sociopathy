title('Беседы');
	
(function()
{
	page.query('#talks', 'talks')
	
	page.load = function()
	{
		breadcrumbs
		([
			{ title: 'Беседы', link: '/сеть/беседы' }
		])
					
		new Data_templater
		({
			template: 'беседа в списке бесед',
			to: page.talks,
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
						
						if (Новости.что_нового.беседы[talk.attr('_id')])
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
							Ajax.delete('/приложение/сеть/беседы/участие',
							{
								_id: talk.attr('_id')
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
					})
				},
				data: function(data)
				{
					parse_dates(data.беседы, 'создана')
					
					data.беседы.for_each(function()
					{
						var беседа = this
						
						iterate(this.участники || [], function(участник)
						{
							return участник._id === пользователь._id
						},
						function()
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
		$(document).trigger('page_initialized')
		
		if (page.talks.is_empty())
		{
			page.talks.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()