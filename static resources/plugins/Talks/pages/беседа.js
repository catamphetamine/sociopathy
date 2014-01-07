(function()
{
	page.query('#talk', 'talk')
	
	Режим.пообещать('правка')
	
	var unedited_talk_title
	
	page.load_messages
	({
		info:
		{
			что: 'беседа',
			общение: function() { return page.data.общение._id }
		},
		data_source:
		{
			url: '/приложение/сеть/беседа/сообщения',
			parameters: { id: page.data.общение.id }
		},
		on_raw_first_time_data: function(data)
		{
			//console.log(data)
			title(data.название)
			
			page.data.общение._id = data._id
			
			unedited_talk_title = data.название
			
			page.data.создатель_ли = пользователь._id === data.создатель
		},
		edit_path: 'беседы',
		on_message_bottom_appears: function(_id)
		{
			Новости.прочитано({ беседа: page.data.общение._id, сообщение: _id })
		},
		connection:
		{
			away_aware_elements:
			[
				'#talk > li[author="{id}"] > .author'
			]
		},
		save_changes: save_title,
		discard_changes: function() { page.get('.breadcrumbs > :last').text(unedited_talk_title) }
	})
	
	page.messages_container = 'talk'
	
	page.load = function()
	{
		page.подсказка('добавление в беседу', 'Для того, чтобы добавить человека в беседу, выберите действие «Добавить человека в беседу» (клавиша «' + Настройки.Клавиши.Показать_действия + '»)')
		
		$(document).on_page('talk_renamed', function(event, data)
		{
			if ($('#talk').attr('_id') === data._id)
			{
				page.get('.breadcrumbs > :last').text(data.как)
				title(data.как)
			}
		})
	}
	
	page.messages.options.on_load = function()
	{
		page.talk.attr('_id', page.data.общение._id)
			
		breadcrumbs
		([
			{ title: text('pages.talks.title'), link: link_to('talks') },
			{ title: unedited_talk_title, link: link_to('talk', page.data.общение.id) }
		])
		
		if (page.data.создатель_ли)
		{
			page.get('.breadcrumbs > :last').attr('editable', true)
		}

		can_add_person_to_talk()
	}

	function save_title(loading)
	{
		var edited_talk_title = page.get('.breadcrumbs > :last').text()
				
		Режим.save_changes_to_server
		({
			загрузка: loading,
			
			anything_changed: function()
			{
				if (!page.data.создатель_ли)
					return false
				
				if (unedited_talk_title !== edited_talk_title)
					return true
			},
			
			data:
			{
				_id: page.talk.attr('_id'),
				название: edited_talk_title
			},
			
			url: '/приложение/сеть/беседы/переназвать',
			method: 'post',
			
			ok: function()
			{
				unedited_talk_title = edited_talk_title
			}
		})
	}
	
	function can_add_person_to_talk()
	{
		var add_user_to_talk = simple_value_dialog_window
		({
			class: 'add_user_to_talk_window',
			title: 'Добавить пользователя в беседу',
			no_ok_button: true,
			fields:
			[{
				id: 'companion',
				description: 'Кого добавим',
				autocomplete:
				{
					choice: function(_id)
					{
						add_user_to_talk.ok()
					},
					
					nothing_found: function(query)
					{
						info(text('pages.people.not found', { query: query }))
					},
					
					required: true
				},
				type: 'user'
			}],
			ok: function(_id)
			{
				var user = add_user_to_talk.fields.companion.autocomplete.selection_data()
				
				page.Ajax.put('/приложение/сеть/беседы/участие',
				{
					_id: page.data.общение._id,
					пользователь: user._id
				})
				.ok(function(data)
				{
					if (data.уже_участвует)
						return info(user.имя + ' уже участвует в этой беседе')
					
					info(user.имя + ' добавлен' + (user.пол === 'женский' ? 'а' : '') + ' в эту беседу')
				})
				.ошибка(function(ошибка)
				{
					error(ошибка)
				})
			}
		})
		
		page.register_dialog_window(add_user_to_talk.window)
		
		function add_person(options)
		{
			add_user_to_talk.window.open(options)
		}
		
		page.Available_actions.add(text('pages.talks.talk.add person'), add_person, { действие: 'Добавить', immediate_transition_between_dialog_windows: true })
		
		page.Available_actions.add(text('pages.talks.talk.leave'), function()
		{		
			page.Ajax.delete('/сеть/беседы/участие',
			{
				_id: page.data.общение._id
			})
			.ok(function()
			{
				go_to('/сеть/беседы')
			})
			.ошибка(function(ошибка)
			{
				error(ошибка)
			})
		},
		{
			type: 'dark dangerous',
			styles: 'generic, dangerous'
		})
	}
})()