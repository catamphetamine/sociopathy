function postprocess_rich_content(content, callback)
{
	if (content instanceof Array)
	{
		if (content.пусто())
			return callback()
		
		if (!content[0].is('.rich_formatting'))
		{
			content = content._map(function() { return this.find('.rich_formatting') })
		}
		
		content.for_each(function()
		{
			this.find('> .audio_player').each(function()
			{
				$(this).audio_player()
			})
		})
		
		return refresh_formulae({ where: content }, callback)
	}
	
	if (!content.is('.rich_formatting'))
		content = content.find('.rich_formatting')
			
	content.find('> .audio_player').each(function()
	{
		$(this).audio_player()
	})
	
	refresh_formulae({ where: content }, callback)
}

Режим.enable_in_place_editing_windows = function(container)
{
	Режим.при_переходе({ в: 'правка' }, function()
	{
		container.find('[type="formula"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Formula
			({
				ok: function(data)
				{
					var formula_html
					if (data.display === 'inline')
					{
						formula_html = delimit_formula(data.formula, 'inline')
					}
					else
					{
						formula_html = delimit_formula(data.formula, 'block')
					}
					
					element.attr('formula', data.formula).html(formula_html)
					element.css('display', data.display)
					
					refresh_formulae({ wait_for_load: true, what: element, formula: formula_html })
				},
				open: function()
				{
					var display = this.content.find('.display').hide()
					var input = display.prev('input').hide()
					var label = input.prev('label').hide()
					
					input.val(element.css('display'))
				}
			})
			
			window.form.field('formula').val(element.attr('formula'))
			//window.form.field_setter('display').bind(window)(element.css('display'))
			
			window.open()
		})
		
		container.find('[type="picture"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Picture
			({
				ok: function(data)
				{
					var url = data.url
					
					Visual_editor.tool_helpers.Picture.get_picture_size(url, function(size)
					{
						if (!size)
							return
						
						element.attr
						({
							src: url,
							width: size.width,
							height: size.height
						})
							
						element.css('float', data.float)
					})
				}
			})
			
			window.form.field('url').val(decodeURIComponent(element.attr('src')))
			window.form.field_setter('float').bind(window)(element.css('float'))
							
			window.open()
		})
		
		container.find('[type="hyperlink"]').on('click.in_place_editing', function(event)
		{
			var element = $(this)
			
			if (!element.find_parent('[contenteditable=true]').exists())
				return
			
			var window = Visual_editor.tool_windows.Link
			({
				ok: function(url)
				{
					element.attr('href', url)
				}
			})
			
			window.form.field('url').val(decodeURI(element.attr('href')))
							
			window.open()
		})
		
		function audio_click_handler(clicked, event)
		{
			if (!clicked.find_parent('[contenteditable=true]').exists())
				return
			
			if (clicked.audio_player('is_control'))
			{
				return
			}
			
			event.preventDefault()
			event.stopPropagation()
			
			var element = clicked.find_parent('.audio_player')
			
			var window = Visual_editor.tool_windows.Audio
			({
				ok: function(data)
				{
					Visual_editor.tool_helpers.Audio.refresh_player(element, data)
					element.audio_player('title_element').on('click.in_place_editing', function(event)
					{
						audio_click_handler($(this), event)
					})
				}
			})
			
			window.form.field('url').val(decodeURI(element.audio_player('url')))
			window.form.field('title').val(element.audio_player('title'))
			
			window.open()
		}
		
		container.find('[type="audio"]').audio_player('title_element').on('click.in_place_editing', function(event)
		{
			audio_click_handler($(this), event)
		})
	})
	
	Режим.при_переходе({ из: 'правка' }, function()
	{
		container.find('[type="formula"]').unbind('.in_place_editing')
		container.find('[type="picture"]').unbind('.in_place_editing')
		container.find('[type="hyperlink"]').unbind('.in_place_editing')
		container.find('[type="audio"]').unbind('.in_place_editing')
	})
}