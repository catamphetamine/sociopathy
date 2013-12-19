(function()
{
	page.query('#discussion', 'discussion')
	Режим.пообещать('правка')
	
	var unedited_discussion_title

	page.messages = Interactive_messages
	({
		info:
		{
			что: 'обсуждение',
			общение: function() { return page.data.общение._id }
		},
		data_source:
		{
			url: '/приложение/сеть/обсуждение/сообщения',
			parameters: { id: page.data.общение.id }
		},
		on_raw_first_time_data: function(data)
		{
			title(data.название)
			
			page.data.общение._id = data._id
			
			unedited_discussion_title = data.название
			
			page.data.создатель_ли = пользователь._id === data.создатель
		},
		container: page.discussion,
		//show_editor: true,
		edit_path: 'обсуждения',
		on_message_bottom_appears: function(_id)
		{
			Новости.прочитано({ обсуждение: page.data.общение._id, сообщение: _id })
		},
		connection:
		{
			away_aware_elements:
			[
				'#discussion > li[author="{id}"] > .author'
			]
		},
		save_changes: save_title,
		discard_changes: function() { page.get('.breadcrumbs > :last').text(unedited_discussion_title) }
	})
	
	page.load = function()
	{
		page.messages.options.container = page.discussion
		page.messages.start()

		$(document).on_page('discussion_renamed', function(event, data)
		{
			if ($('#discussion').attr('_id') === data._id)
			{
				page.get('.breadcrumbs > :last').text(data.как)
				title(data.как)
			}
		})
	}
	
	page.preload = function(finished)
	{	
		page.messages.preload(finished)
	}
	
	page.unload = function()
	{
		page.messages.unload()
	}
	
	page.messages.options.on_load = function()
	{
		page.discussion.attr('_id', page.data.общение._id)
		
		breadcrumbs
		([
			{ title: text('pages.discussions.title'), link: link_to('discussions') },
			{ title: data.название, link: link_to('discussion', page.data.общение.id) }
		])
		
		if (page.data.создатель_ли)
			page.get('.breadcrumbs > :last').attr('editable', true)
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