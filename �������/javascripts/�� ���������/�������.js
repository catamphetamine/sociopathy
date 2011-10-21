$(function()
{
	var editor = new Editor()
	var tools = $('#article_editor_tools')

	initialize_tools()
	initialize_editor()
	
	$('#edit_mode_actions').appendTo($('body'))
	
	cancel_button = activate_button('#edit_mode_actions .cancel', { 'prevent double submission': true })
	.does(function() { info('cancel') })

	done_button = activate_button('#edit_mode_actions .done', { 'prevent double submission': true })
	.does(function() { info('save') })
		
	function initialize_tools()
	{
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
		
		// toolbar
		
		//tools.find('')
	}
	
	function initialize_editor()
	{
		$(document).bind('режим.переход', function(event, из, в)
		{
			if (из === 'правка')
				hide_tools()
		})
			
		$(document).bind('режим.правка', function(event)
		{
			show_tools()
				
			editor.move_caret_to($('.article article p:first'))
			
			$('article h1').bind('keypress', function(event)
			{
				switch (event.which)
				{
					case Клавиши.Enter:
						event.preventDefault()
						editor.move_caret_to($('article section p:first'))
						break
				}
			})
			//new Editor().insert($('<div>test</div>'))
		})
	}
	
	function show_tools()
	{
		if (tools.hasClass('sticky'))
			tools.opaque().stop_animation().slide_in_from_top()
		else
			tools.css({ top: 0 }).fade_in(0.3)
			
		$('#edit_mode_actions').stop_animation().slide_in_from_bottom()
	}
	
	function hide_tools()
	{
		if (tools.hasClass('sticky'))
			tools.opaque().stop_animation().slide_out_upwards()
		else
			tools.css({ top: 0 }).fade_out(0.3)
			
		$('#edit_mode_actions').stop_animation().slide_out_downwards()
	}
})