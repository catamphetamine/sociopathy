function initialize_page()
{
	var old_messages_button = panel.buttons['беседы'].element
	var new_messages_button = panel.buttons['беседы (непрочитанные)'].element
	
	new_messages_button.css
	({
		position: 'absolute',
		'z-index': -1,
		opacity: 0
	})
	
	old_messages_button.parent().append(new_messages_button)
	
	panel.buttons['беседы (непрочитанные)'].tooltip.update_position()
	
	panel.new_messages = function()
	{
		new_messages_button.css('z-index', 0)
		
		new_messages_button.fade_in(1)
		old_messages_button.fade_out(1)
	}
	
	panel.no_more_new_messages = function()
	{
		new_messages_button.css('z-index', -1)
		
		old_messages_button.fade_in(0.5)
		new_messages_button.fade_out(1)
	}
}