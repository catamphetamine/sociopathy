function insert_search_bar_into($element)
{
	$element.append
	(
		'<span id="search">' +
			'<input type="text" value=""/>' +
			'<span type="button"></span>' +
		'</span>'
	)
	
	// if it wasn't removed
	$('#logo').hide()
	
	initialize_search_bar()
}

function remove_search_bar()
{
	// if it wasn't removed
	$('#logo').show()
	
	$('#search').remove()
}

function initialize_search_bar()
{
	var container = $('#search')
	var $clear_button = container.find('> span[type="button"]')
	var input = container.find('> input[type="text"]')

	input.on('keyup', function()
	{
		if ($(this).val().length > 0)
			animator.fade_in($clear_button, { duration: 0.2 })
		else
			animator.fade_out($clear_button, { duration: 0.2, hide: true })
	})
	
	input.on('keypress', function(event)
	{
		if (Клавиши.is('Enter', event))
		{
			event.preventDefault()
			info('Поиск ещё не сделан')
		}
	})
		
	// activate clear search text button
	new image_button
	(
		$clear_button,
		{
			action: function() 
			{
				var clearer = $('<div />')
				
				clearer.css
				({
					position: 'absolute',
					top: input.css('margin-top'),
					left: container.css('padding-left'),
					
					'background-color': 'white',
					opacity: 0,
					
					width: input.width(),
					height: input.height()
				})
				
				$('#search').append(clearer)
				clearer.fadeTo(200, 1, function() 
				{ 
					input.val('')
					clearer.remove()
					animator.fade_out($clear_button, { duration: 0.2 })
				})
			}
		}
	)
}