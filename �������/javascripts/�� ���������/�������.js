$(function()
{
	var editor = new Editor()
	var tools = $('#article_editor_tools')
		
	var content = get_content()
	
	var tags_with_prohibited_line_break = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

	initialize_tools()
	initialize_editor()
	initialize_actions()
	
	function get_content()
	{
		return $('#content > article > section')
	}

	function mark(element)
	{
		if (content.find('[mark=temporary]').length > 0)
			throw 'Some element is already marked'
			
		element.attr('mark', 'temporary')
		return element
	}
	
	function unmark()
	{
		var element = content.find('[mark=temporary]')
		
		if (element.length > 1)
			throw 'More than one element was marked'
			
		element.removeAttr('mark')
		return element
	}
	
	function initialize_tools()
	{
		var tools_wrapper = $('#article_editor_tools_wrapper')
	
		tools_wrapper.bind('disappearing_upwards.scroller', function(event)
		{
			tools.opaque().addClass('sticky')
			event.stopPropagation()
		})
		
		tools_wrapper.bind('fully_appeared_on_top.scroller', function(event)
		{
			tools.css({ top: 0 }).removeClass('sticky')
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
		
		// при нажатии Ввода на основном заголовке - перейти к первому абзацу
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
		
		function reload_content()
		{
			var html = content.outer_html()
			
			var parent = content.parent()
			content.remove()
			content = $(html).appendTo(parent)
			
			if ($.browser.mozilla)
				content.focus()
		}
		
		content.bind('keypress', function(event)
		{
			if (режим !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:	
					var container = editor.get_container()
					
					if (editor.is_caret_in_the_beginning_of_container())
					{
						return
					}
					
					if (editor.is_caret_in_the_end_of_container())
					{
						if (!container.is('h2, h3, h4, h5, h6'))
							return
							
						event.preventDefault()
					
						var next_paragraph = container.next('p')
						if (next_paragraph.length === 0)
						{
							next_paragraph = $('<p mark="temporary"/>')
							//next_paragraph.text('123')
							container.after(next_paragraph)
							
							reload_content()
							
							next_paragraph = content.find('p[mark=temporary]')
							next_paragraph.removeAttr('mark')
						}
							
						editor.move_caret_to(next_paragraph)
						return
					}
					
					tags_with_prohibited_line_break.forEach(function(tag)
					{
						if (container.is(tag))
							event.preventDefault()
					})
					break
			}
		})
		
		content.bind('keypress', function(event)
		{
			if (режим !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					
					if (!editor.get_container().is('p'))
						return
						
					editor.insert_html('</p><p mark="temporary">')
					
					reload_content()
					
					var next_paragraph = content.find('p[mark=temporary]')
					next_paragraph.removeAttr('mark')
					editor.move_caret_to(next_paragraph)
					
					/*
					if ($.browser.mozilla)
					{
						content.find('p[_moz_dirty]').removeAttr('_moz_dirty')
						//content.find('br[_moz_dirty]').remove()
						content.find('br').remove()
					}
					*/
						
					content.find('p').each(function()
					{
						paragraph = $(this)
						
						var html = paragraph.html()
						var trimmed_html = cut_off_whitespaces(html)
						
						if (html.length > trimmed_html.length)
							paragraph.html(trimmed_html)
					})
					
					return
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
		{
			tools.stop_animation()
		
			if (parseFloat(tools.css('top')) === 0)
				tools.move_out_upwards()
				
			tools.opaque().slide_in_from_top()
		}
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
		$('#edit_mode_actions').appendTo($('body')).move_out_downwards()
		
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
				return info('Не нужно ничего выделять')
			
			if (!editor.has_container('p'))
				return info('Подзаголовок можно помещать только в абзаце')
			
			var caret
			if (editor.is_caret_in_the_beginning_of_container('p'))
				caret = editor.move_caret_to_container_start('p')
			else if (editor.is_caret_in_the_end_of_container('p'))
				caret = editor.move_caret_to_container_end('p')
			else
			{
				info('Подзаголовок можно поместить только в начале или в конце абзаца')
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
			if ($.browser.mozilla)
				content.focus()
				
			editor.move_caret_to(subheading)
		}
	}
	
	Tools.Picture =
	{
		selector: '.picture',
		
		apply: function()
		{
			if (editor.has_selection())
				return info('Не нужно ничего выделять')
			
			var picture = $('<img/>')
			picture.addClass('picture')
			picture.css
			({
				'background-image': "url('/картинки/temporary/картинка с личной карточки.jpg')",
				width: '120px',
			    height: '120px'
			})
			
			editor.insert(mark(picture))
			return unmark()
		},
		
		on_error: function()
		{
		},
		
		on_success: function(picture)
		{
			if ($.browser.mozilla)
				content.focus()
				
			editor.move_caret_to_the_end_of(picture)
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
})