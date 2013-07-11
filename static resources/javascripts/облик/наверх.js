(function()
{
	var jump_to_top = $('#jump_to_top').disableTextSelect()
	
	function show()
	{
		jump_to_top.addClass('mouse_over')
		//jump_to_top.fade_in(0.2, { maximum_opacity: 0.5 })
	}
	
	function hide()
	{
		jump_to_top.removeClass('mouse_over')
		//jump_to_top.fade_out(0.2)
	}
	
	jump_to_top.on('click', function()
	{
		if (jump_to_top .data('previous_scroll_position'))
		{
			прокрутчик.scroll_to(jump_to_top.data('previous_scroll_position'))
			return jump_to_top.removeData('previous_scroll_position')
		}
	
		if (прокрутчик.scrolled() === 0)
			return
	
		jump_to_top.data('previous_scroll_position', прокрутчик.scrolled())
		прокрутчик.scroll_to(0)
	})
	
	jump_to_top.on('mouseenter', function()
	{
		jump_to_top.data('inside', true)
	
		if (прокрутчик.scrolled() === 0)
			if (!jump_to_top.data('previous_scroll_position'))
				return
	
		show()
	})
	
	jump_to_top.on('mouseleave', function()
	{
		jump_to_top.data('inside', false)
	
		hide()
	})
	
	$(document).on('scroll', function()
	{
		if (прокрутчик.scrolled() === 0)
		{
			if (!jump_to_top.data('previous_scroll_position'))
				return hide()
		}
		else
			jump_to_top.removeData('previous_scroll_position')
	
		if (jump_to_top.data('inside'))
			show()
	})
})()
