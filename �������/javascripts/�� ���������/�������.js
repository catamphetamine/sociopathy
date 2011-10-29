$(function()
{
	var tools = $('#article_editor_tools')
	tools.disableTextSelect()
	
	var editor = new Editor($('#content > article > section'))
	
	var tags_with_prohibited_line_break = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

	initialize_tools()
	initialize_editor()
	initialize_actions()
	
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
			if (Pежим.текущий !== 'правка')
				return
				
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					editor.move_caret_to(editor.content.find('p:first'))
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
				
		editor.content.live('keypress', function(event)
		{
			if (Pежим.текущий !== 'правка')
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
							next_paragraph = $('<p/>')
							editor.mark(next_paragraph)
							container.after(next_paragraph)
							
							editor.reload_content()
							
							next_paragraph = editor.unmark()
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
		
		editor.content.live('keypress', function(event)
		{
			if (Pежим.текущий !== 'правка')
				return
			
			if (event.charCode)
			{
				if (event.altKey || event.ctrlKey)
					return
			
				event.preventDefault()
				//alert(String.fromCharCode(event.charCode))
				editor.insert(String.fromCharCode(event.charCode))
				return
			}
			
			switch (event.which)
			{
				case Клавиши.Enter:
					event.preventDefault()
					
					if (!editor.get_container().is('p'))
						return
						
					editor.insert_html('</p><p ' + editor.get_marker_html() + '>')
					
					var next_paragraph = editor.unmark()
					editor.move_caret_to(next_paragraph)
					
					/*
					if ($.browser.mozilla)
					{
						content.find('p[_moz_dirty]').removeAttr('_moz_dirty')
						//content.find('br[_moz_dirty]').remove()
						content.find('br').remove()
					}
					*/
						
					editor.content.find('p').each(function()
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
				
			editor.caret.move_to(editor.content.find('p:first'))
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
		$('#edit_mode_actions').appendTo($('body')).move_out_downwards().disableTextSelect()
		
		cancel_button = activate_button('#edit_mode_actions .cancel', { 'prevent double submission': true })
		.does(function() { info('cancel') })
	
		done_button = activate_button('#edit_mode_actions .done', { 'prevent double submission': true })
		.does(function() { info('save') })
	}
	
	// Activate tools
	
	var Tools = {}
	
	Tools.Error = function(message)
	{
		this.message = message
	}
	
	Tools.Subheading =
	{
		selector: '.subheading',
		
		apply: function()
		{
			if (editor.selection.exists())
				throw new Tools.Error('Не нужно ничего выделять')
			
			if (!editor.caret.has_container('p'))
				throw new Tools.Error('Подзаголовок можно помещать только в абзаце')
			
			var caret
			if (editor.caret.is_in_the_beginning_of_container('p'))
				caret = editor.caret.move_to_container_start('p')
			else if (editor.caret.is_in_the_end_of_container('p'))
				caret = editor.caret.move_to_container_end('p')
			else
			{
				throw new Tools.Error('Подзаголовок можно поместить только в начале или в конце абзаца')
				return
			}
			
			var subheading = $('<h2/>')
			//editor.insert(subheading, caret)
			return editor.insert(subheading)
		},
		
		on_success: function(subheading)
		{
			editor.caret.move_to(subheading)
		}
	}
	
	Tools.Picture =
	{
		selector: '.picture',
		
		apply: function()
		{
			if (editor.selection.exists())
				throw new Tools.Error('Не нужно ничего выделять')
			
			var picture = $('<img/>')
			picture.addClass('picture')
			picture.css
			({
				'background-image': "url('/картинки/temporary/картинка с личной карточки.jpg')",
				width: '120px',
			    height: '120px'
			})
			
			return editor.insert(picture)
		},
		
		on_success: function(picture)
		{
			editor.caret.move_to_the_end_of(picture)
		}
	}
	
	Tools.Undo =
	{
		button: new image_button(tools.find('.undo span')),
		
		apply: function()
		{
			if (editor.selection.exists())
				throw new Tools.Error('Не нужно ничего выделять')
			
			if (!editor.time_machine.undo())
				info('Это самая ранняя версия заметки')
		},
		
		on_success: function()
		{
		}
	}
	
	Tools.Redo =
	{
		button: new image_button(tools.find('.redo span')),
		
		apply: function()
		{
			if (editor.selection.exists())
				throw new Tools.Error('Не нужно ничего выделять')
			
			if (!editor.time_machine.redo())
				info('Это самая поздняя версия заметки')
		},
		
		on_success: function()
		{
		}
	}
	
	Object.each(Tools, function(tool, key)
	{
		var on_success = tool.on_success || $.noop
		tool.on_success = function(result)
		{
			if ($.browser.mozilla)
				editor.content.focus()
				
			on_success(result)
		}
		
		if (!tool.on_error)
		{
			tool.on_error = function(error)
			{
				info(error.message)
				
				//if ($.browser.mozilla)
					//editor.content.focus()
			}
		}
			
		var action = function()
		{
			try
			{
				tool.on_success(tool.apply())
			}
			catch (error)
			{
				if (error instanceof Tools.Error)
					tool.on_error(error)
				else
					throw error
			}
		}
				
		if (tool.selector)
		{
			tools.find(tool.selector).bind('click', function(event)
			{
				event.preventDefault()
				action()
			})
		}
		else if (tool.button)
		{
			tool.button.does(action)
		}
	})
})