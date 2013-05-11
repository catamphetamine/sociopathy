(function()
{
	page.query('#discussion', 'discussion')
	Режим.пообещать('правка')
	
	var messages
	
	var unedited_discussion_title

	page.load = function()
	{
		Подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«Писарь → Показать»</a>');
		//Подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');
		//Подсказка('подписка на обсуждение', 'Вы будете подписаны на обсуждение, если напишете что-нибудь в нём');
		//Подсказка('переименование общения', 'Вы можете переименовать этот разговор, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');

		messages = Interactive_messages
		({
			info:
			{
				что: 'обсуждение',
				общение: function() { return page.data.общение._id }
			},
			data_source:
			{
				url: '/приложение/сеть/обсуждение/сообщения',
				parameters: { _id: page.data.общение._id, id: page.data.общение.id }
			},
			on_first_time_data: function(data)
			{
				title(data.название)
				
				page.data.общение._id = data._id
				
				page.discussion.attr('_id', data._id)
				
				breadcrumbs
				([
					{ title: text('pages.discussions.title'), link: link_to('discussions') },
					{ title: data.название, link: link_to('discussion', page.data.общение.id) }
				])
				
				unedited_discussion_title = data.название
				
				page.data.создатель_ли = пользователь._id === data.создатель
				if (page.data.создатель_ли)
					page.get('.breadcrumbs > :last').attr('editable', true)
			},
			more_link: $('.messages_framework > .older > a'),
			container: page.discussion,
			//show_editor: true,
			edit_path: 'обсуждения',
			on_load: discussion_loaded,
			on_first_output: page.content_ready,
			on_message_bottom_appears: function(_id)
			{
				Новости.прочитано({ обсуждение: page.data.общение._id, сообщение: _id })
			},
			before_output: function(message)
			{
				var author = message.find('.author')
				if (Эфир.кто_в_сети.has(message.attr('author')))
					author.addClass('online')
			},
			on_message_data: function(data)
			{
				Эфир.следить_за_пользователем(data.отправитель)
			},
			connection:
			{
				path: '/обсуждение',
				away_aware_elements:
				[
					'#discussion > li[author="{id}"] .author'
				]
			},
			save_changes: save_title,
			discard_changes: function() { page.get('.breadcrumbs > :last').text(unedited_discussion_title) }
		})
		
		$(document).on_page('discussion_renamed', function(event, data)
		{
			if ($('#discussion').attr('_id') === data._id)
			{
				page.get('.breadcrumbs > :last').text(data.как)
				title(data.как)
			}
		})
			
		messages.load()
	}
	
	page.unload = function()
	{
		messages.unload()
	}
	
	function discussion_loaded()
	{
	}

	function save_title(loading)
	{
		var edited_discussion_title = page.get('.breadcrumbs > :last').text()
				
		Режим.save_changes_to_server
		({
			загрузка: loading,
			
			anything_changed: function()
			{
				if (!page.data.создатель_ли)
					return false
				
				if (unedited_discussion_title !== edited_discussion_title)
					return true
			},
			
			data:
			{
				_id: page.discussion.attr('_id'),
				название: edited_discussion_title
			},
			
			url: '/приложение/сеть/обсуждения/переназвать',
			method: 'post',
			
			ok: function()
			{
				unedited_discussion_title = edited_discussion_title
			}
		})
	}
})()