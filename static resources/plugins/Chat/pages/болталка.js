(function()
{	
	title(text('pages.chat.title'))
	
	Режим.пообещать('правка')
	
	page.messages = Interactive_messages
	({
		info:
		{
			что: 'болталка'
		},
		data_source:
		{
			url: '/приложение/сеть/болталка/сообщения'
		},
		more_link: $('.messages_framework > .older > a'),
		//show_editor: true,
		edit_path: 'болталка',
		on_message_bottom_appears: function(_id)
		{
			Новости.прочитано({ болталка: _id })
		},
		connection:
		{
			away_aware_elements:
			[
				'.chat > li[author="{id}"] .author'
			]
		}
	})
		
	page.load = function()
	{
		page.messages.options.container = $('.chat')
		page.messages.start()
	}
	
	page.preload = function(finished)
	{	
		page.messages.preload(finished)
	}
	
	page.unload = function()
	{
		page.messages.unload()
	}
		
	page.messages.options.on_load = $.noop
})()