var навершие = $('#panel_menu')

Object.for_each(Configuration.Plugins, function(key)
{
	if (typeof this.icon === 'object')
		if (this.icon.private)
			add_top_panel_button.bind(this)(this)
})

$(document).on('styles_loaded', function()
{
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