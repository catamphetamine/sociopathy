$(function()
{
	var editor = new Editor()
	var tools = $('#article_editor_tools')
	
	var tags_with_prohibited_line_break = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

	initialize_tools()
	initialize_editor()
	initialize_actions()
		
	function initialize_tools()
	{
		var tools_wrapper = $('#article_editor_tools_wrapper')
	
		tools_wrapper.bind('disappearing_upwards.scroller', function(event)
		{
			tools.addClass('sticky')
			event.stopPropagation()
		})
		
		tools_wrapper.bind('fully_appeared_on_top.scroller', function(event)
		{
			tools.removeClass('sticky')
			event.stopPropagation()
		})
		
		прокрутчик.watch(tools_wrapper, 0)
		
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
		
		$('article h1').bind('keypress', function(event)
		{
			if (режим !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					editor.move_caret_to(content.find('p:first'))
					break
			}
		})
		
		var content = $('article section')
			
		function cut_off_whitespaces(original_text)
		{
			var text = original_text
			text = text.replace(/^\w/g, '').replace(/\w$/g, '')
			text = text.replace(/^&nbsp;/g, '').replace(/&nbsp;$/g, '')
			
			if (text.length == original_text.length)
				return text
			else
				return cut_off_whitespaces(text)
		}
		
		content.bind('keypress', function(event)
		{
			if (режим !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					if (editor.is_caret_in_the_beginning_of_container())
						break
						
					if (editor.is_caret_in_the_end_of_container())
						break
						
					var container = editor.get_container()
					
					tags_with_prohibited_line_break.forEach(function(tag)
					{
						if (container.is(tag))
							event.preventDefault()
					})
					break
			}
		})
		
		content.bind('keyup', function(event)
		{
			if (режим !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					//event.preventDefault()
					
					if ($.browser.mozilla)
					{
						content.find('p[_moz_dirty]').removeAttr('_moz_dirty')
						content.find('br[_moz_dirty]').remove()
					}
						
					content.find('p').each(function()
					{
						paragraph = $(this)
						
						var html = paragraph.html()
						var trimmed_html = cut_off_whitespaces(html)
						
						if (html.length > trimmed_html.length)
							paragraph.html(trimmed_html)
							
						/*
						do
						{
							var last_node = Dom_tools.get_last_child(paragraph.get(0))
							
							console.log(last_node)
							console.log(Dom_tools.is_text_node(last_node))
							
							if (Dom_tools.is_text_node(last_node))
								break
							
							if (last_node.tagName.toLowerCase() === 'br')
								Dom_tools.remove(last_node)
						}
						while (true)
						*/
					})
					
					break
			}
		})
		
		$(document).bind('режим.правка', function(event)
		{
			show_tools()
				
			editor.move_caret_to(content.find('p:first'))
		})
	}
	
	function show_tools()
	{
		if (tools.hasClass('sticky'))
			tools.opaque().slide_in_from_top()
		else
			tools.css({ top: 0 }).fade_in(0.3)
			
		$('#edit_mode_actions').slide_in_from_bottom()
	}
	
	function hide_tools()
	{
		if (tools.hasClass('sticky'))
			tools.opaque().slide_out_upwards()
		else
			tools.css({ top: 0 }).fade_out(0.3)
			
		$('#edit_mode_actions').slide_out_downwards()
	}
	
	function initialize_actions()
	{
		$('#edit_mode_actions').appendTo($('body'))
		
		cancel_button = activate_button('#edit_mode_actions .cancel', { 'prevent double submission': true })
		.does(function() { info('cancel') })
	
		done_button = activate_button('#edit_mode_actions .done', { 'prevent double submission': true })
		.does(function() { info('save') })
	}
	
	// Activate tools
	
	var Tools = {}
	
	Tools.Subheading =
	{
		selector: '.subheading',
		
		apply: function()
		{
			if (editor.has_selection())
			{
				info('Не нужно ничего выделять')
				return
			}
			
			if (!editor.has_container('p'))
			{
				info('Нельзя поместить подзаголовок здесь 1')
				return
			}
			
			var caret
			if (editor.is_caret_in_the_beginning_of_container('p'))
				caret = editor.move_caret_to_container_start('p')
			else if (editor.is_caret_in_the_end_of_container('p'))
				caret = editor.move_caret_to_container_end('p')
			else
			{
				info('Нельзя поместить подзаголовок здесь')
				return
			}
			
			var subheading = $('<h2/>')
			editor.insert(subheading, caret)
			return subheading
		},
		
		on_error: function()
		{
			$('article section').focus()
		},
		
		on_success: function(subheading)
		{
			$('article section').focus()
			editor.move_caret_to(subheading)
		}
	}
	
	Object.each(Tools, function(tool, key)
	{
		tools.find(tool.selector).bind('click', function(event)
		{
			event.preventDefault()
			
			var result = tool.apply()
			if (result)
				tool.on_success(result)
			else
				tool.on_error()
		})
	})
	
	/*
	tools.find('.paragraph').bind('click', function(event)
	{
		event.preventDefault()
		
		if (editor.has_selection())
		{
			info('Не нужно ничего выделять')
			return
			//editor.wrap($('<p/>'))
		}
		
		editor.move_caret_to_container_end('p')
		editor.insert($('<p/>'))
	})
	*/
})