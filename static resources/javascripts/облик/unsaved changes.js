// discard unsaved changes confirmation

var discard_changes_confirmation

$(document).on('page_loaded', function()
{
	if (!first_time_page_loading)
		return
	
	var unsaved_changes = $("#unsaved_changes")
	
	console.log(unsaved_changes.node())
	
	var dialog_window = unsaved_changes.dialog_window()
	
	var cancel = text_button.new(unsaved_changes.find('.buttons .cancel'), { 'prevent double submission': true, physics: 'fast' })
	.does(function()
	{
		dialog_window.close()
	})	
	
	var discard = text_button.new(unsaved_changes.find('.buttons .discard'), { 'prevent double submission': true })
	
	dialog_window.register_controls(cancel, discard)
	
	discard_changes_confirmation = function(on_discard)
	{
		discard.does(function()
		{
			dialog_window.close()
			on_discard()
		})
		
		dialog_window.open()
	}
})