$(function()
{
	var tools = $('#article_editor_tools')
	var tools_wrapper = $('#article_editor_tools_wrapper')

	tools_wrapper.bind('scroller.disappearing_upwards', function(event)
	{
		tools.addClass('sticky')

		event.stopPropagation()
	})
	
	tools_wrapper.bind('scroller.fully_appeared_on_top', function(event)
	{
		tools.removeClass('sticky')

		event.stopPropagation()
	})
	
	прокрутчик.watch(tools_wrapper)
})
