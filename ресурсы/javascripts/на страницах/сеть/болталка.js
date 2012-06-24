(function()
{
	title('Болталка')
	
	var who_is_online_bar_list
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
		Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
		Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')

		chat = $('#chat_container .chat')
		
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/болталка/сообщения'
			},
			more_link: $('.messages_framework > .older > a'),
			container: chat,
			scroller: прокрутчик,
			show_editor: true,
			on_load: chat_loaded,
			connection:
			{
				path: '/болталка',
				on_reconnection: function() { who_is_online_bar_list.empty() },
				on_connection: function()
				{
					внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })
				},
				away_aware_elements:
				[
					'.who_is_online > li[user="{id}"]',
					'.chat > li[author="{id}"] .author'
				],
				on_user_connected: внести_пользователя_в_список_вверху,
				on_user_disconnected: пользователь_вышел_из_болталки
			}
		})
		
		messages.load()
	}
	
	page.unload = function()
	{
		$('.who_is_online_bar').floating_top_bar('unload')
		
		if (болталка)
		{
			болталка.emit('выход')
			//alert(болталка.websocket.disconnectSync)
			//болталка.websocket.disconnectSync()
		}
	}
		
	function внести_пользователя_в_список_вверху(user, options)
	{
		if (who_is_online_bar_list.find('> li[user="' + user._id + '"]').exists())
			return
	
		var container = $('<li user="' + user._id + '"></li>')
		container.addClass('online')
		
		$.tmpl('chat user icon', { отправитель: user }).appendTo(container)
		
		if (options)
			if (options.куда === 'в начало')
				return container.prependTo(who_is_online_bar_list)
		
		container.css('opacity', '0')
		container.appendTo(who_is_online_bar_list)
		ajaxify_internal_links(content)
		
		// после append'а, т.к. стили
		if (user._id !== пользователь._id)
			messages.initialize_call_action(container, user._id, 'of_online_user')
			
		animator.fade_in(container, { duration: 1 }) // in seconds
	}
	
	function пользователь_вышел_из_болталки(пользователь)
	{
		var icon = who_is_online_bar_list.find('[user="' + пользователь._id + '"]')
		icon.fadeOut(500, function()
		{
			icon.remove()
		})
	}

	chat_loaded = function(finish_initialization)
	{
		who_is_online_bar_list = $('.who_is_online')
		$('.who_is_online_bar').floating_top_bar()
		
		finish_initialization()
	}
})()