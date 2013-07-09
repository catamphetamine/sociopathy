(function()
{
	var jump_to_top = $('#jump_to_top')
	
	function show()
	{
		jump_to_top.fade_in(0.2, { maximum_opacity: 0.5 })
	}
	
	jump_to_top.on('click', function()
	{
		if (jump_to_top .data('previous_scroll_position'))
		{
			прокрутчик.go_to(jump_to_top.data('previous_scroll_position'))
			return jump_to_top.removeData('previous_scroll_position')
		}
	
		if (прокрутчик.прокручено() === 0)
			return
	
		jump_to_top.data('previous_scroll_position', прокрутчик.прокручено())
		прокрутчик.go_to(0)
	})
	
	jump_to_top.on('mouseenter', function()
	{
		jump_to_top.data('inside', true)
	
		if (прокрутчик.прокручено() === 0)
			return
	
		show()
	})
	
	jump_to_top.on('mouseleave', function()
	{
		jump_to_top.fade_out(0.2)
	})
	
	
	$(document).on('scroll', function()
	{
		if (прокрутчик.прокручено() === 0)
			return jump_to_top.fade_out()
	
		if (jump_to_top.data('inside'))
			show()
	})
})()
