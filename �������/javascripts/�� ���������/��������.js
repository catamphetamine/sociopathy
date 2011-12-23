function initialize_page()
{
	Режим.подсказка('В этом разделе вы можете читать и писать заметки на всевозможные темы.')

	insert_search_bar_into($('#panel'))
	$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
	
	$('#categories').disableTextSelect()

	var путь_к_разделу
	var match = путь().match(/читальня\/(.+)/)
	if (match)
		путь_к_разделу = match[1]
		
	new Data_templater
	({
		data:
		{
			подразделы:
			{
				template_url: '/лекала/раздел читальни.html',
				item_container: $('#categories'),
				postprocess_item_element: function(element)
				{
					return $('<li/>').append(element)
				}
			},
			заметки:
			{
				template_url: '/лекала/заметка раздела читальни.html',
				item_container: $('#articles'),
				postprocess_item_element: function(element)
				{
					return $('<li/>').append(element)
				}
			}
		},
		conditional: $('#category_list_block[type=conditional]')
	},
	new  Data_loader
	({
		url: '/приложение/раздел читальни',
		parameters: { путь: путь_к_разделу }
	}))

	$(window).resize(resize_categories_list)
	resize_categories_list()
}

function resize_categories_list()
{
	function calculate_categories_width(count)
	{
		var Category_width = 250
		var Category_side_spacing = 15
	
		return count * (Category_width + (Category_side_spacing * 2))
	}
	
	var available_width = parseInt($(window).width())
	
	var count = 0
	var width = 0
	var suitable_width = width
	while (true)
	{
		count++
		width = calculate_categories_width(count)
		
		if (width <= available_width)
			suitable_width = width
		else
			break
	}
	
	$('#categories').width(suitable_width).css('left', (available_width - suitable_width) / 2 + 'px')
}