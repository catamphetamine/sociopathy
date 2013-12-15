var навершие = $('#panel_menu')

Object.for_each(Configuration.Plugins, function(key)
{
	if (typeof this.icon === 'object')
		if (this.icon.private)
			add_top_panel_button.bind(this)()
})

$(document).on('styles_loaded', function()
{
	if (!пользователь.avatar_version)
		page.подсказка('загрузите картинку', text('notifications.set up an avatar', { 'user id': пользователь.id }))

	$('.authenticated_user .picture').context_menu
	({
		items:
		[
			{
				title: text('user actions.log out'),
				action: function()
				{	
					выйти()
				}
			}
		]
	})
})