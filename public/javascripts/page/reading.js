function initialize_page()
{
	$('#logo').remove()
	insert_search_bar_into($('#panel'))
	
	$('#categories').disableTextSelect();
	
	show_categories({data: [{id: 1, name: 'История'}, {id: 2, name: 'Строительство'}, {id: 3, name: 'Механизация'}, {id: 4, name: 'Литература'}, {id: 5, name: 'Политика'}, {id: 6, name: 'Душеведение'}, {id: 7, name: 'Общество'}]}.data)
	
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

function show_categories(categories)
{
	var target = $('#categories')
	categories.each(function(category)
	{
		var list_item = $('<li/>').appendTo(target)
		
		var link = $('<a/>').attr('href', 'http://google.ru/categories/' + category.id).css('background-image', 'url(\'' + get_category_icon_url(category.id) + '\')').appendTo(list_item)
		$('<span/>').text(category.name).appendTo(link)
		
		//list_item.click(function(event) { event.preventDefault(); })
	})
}

function get_category_icon_url(id)
{
	switch (id)
	{
		case 1:
			return 'images/temporary/history.jpg';
		 
		case 2:
			return 'images/temporary/architecture.jpg';
		 
		case 3:
			return 'images/temporary/machinery.jpg';
		 
		case 4:
			return 'images/temporary/literature.jpg';
		 
		case 5:
			return 'images/temporary/politics.jpg';
		 
		case 6:
			return 'images/temporary/psychology.jpg';
		 
		case 7:
			return 'images/temporary/sociology.jpg';
	}
}

/*

				<li class="category" name="history">История</li>
				<li class="category" name="architecture">Строительство</li>
				<li class="category" name="engineering">Механизация</li>
				<li class="category" name="literature"></li>
				<li class="category"></li>
				<li class="category"></li>
				<li class="category"></li>	
*/