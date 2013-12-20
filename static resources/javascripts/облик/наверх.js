$(document).on('panel_loaded', function()
{
	var zero_margin = true
	
	function set_margin_top(margin)
	{
		if (margin === 0)
		{
			if (zero_margin)
				return
			
			zero_margin = true
			jump_to_top.css('margin-top', 0)	
			return
		}
		
		zero_margin = false
		jump_to_top.css('margin-top', margin + 'px')
	}
	
	var jump_to_top = $('#jump_to_top').disableTextSelect()
	
	function show()
	{
		jump_to_top.addClass('mouse_over')
		$(body).addClass('jump_to_top_mouse_over')
		//jump_to_top.fade_in(0.2, { maximum_opacity: 0.5 })
	}
	
	function hide()
	{
		jump_to_top.removeClass('mouse_over')
		$(body).removeClass('jump_to_top_mouse_over')
		//jump_to_top.fade_out(0.2)
	}
	
	jump_to_top.on('mousedown.jump_to_top', function()
	{
		if (jump_to_top .data('previous_scroll_position'))
		{
			jump_to_top.removeClass('jumped_to_top')
		
			прокрутчик.scroll_to(jump_to_top.data('previous_scroll_position'))
			return jump_to_top.removeData('previous_scroll_position')
		}
	
		if (прокрутчик.scrolled() === 0)
			return
	
		jump_to_top.addClass('jumped_to_top')
		
		set_margin_top(0)
			
		jump_to_top.data('previous_scroll_position', прокрутчик.scrolled())
		прокрутчик.scroll_to(0)
	})
	
	jump_to_top.on('mouseenter.jump_to_top', function()
	{
		jump_to_top.data('inside', true)
	
		if (прокрутчик.scrolled() === 0)
			if (!jump_to_top.data('previous_scroll_position'))
				return
	
		if (jump_to_top.data('previous_scroll_position'))
			jump_to_top.addClass('jumped_to_top')
		else
			jump_to_top.removeClass('jumped_to_top')
			
		show()
	})
	
	jump_to_top.on('mouseleave.jump_to_top', function()
	{
		jump_to_top.data('inside', false)
	
		hide()
	})
	
	var panel_height = $('#panel').height()
	
	$(document).on('scroll.jump_to_top', function()
	{
		var scrolled = прокрутчик.scrolled()
		
		if (scrolled === 0)
		{
			if (!jump_to_top.data('previous_scroll_position'))
				return hide()
		}
		else
		{
			var delta = panel_height - scrolled
			if (delta < 0)
				delta = 0
			
			set_margin_top(delta)
			
			jump_to_top.removeClass('jumped_to_top')
			jump_to_top.removeData('previous_scroll_position')
		}
	
		if (jump_to_top.data('inside'))
			show()
	})
})