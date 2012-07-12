(function()
{
	var was_here = null
	
	function is_here()
	{
		was_here = new Date()
	}
	
	var events =
	[
		'focus',
		'blur',
		'keydown',
		'click',
		'mousewheel'
	]
	
	events.for_each(function()
	{
		$(window).on(this + '.is_the_user_here', function()
		{
			is_here()
			$(window).trigger('the_user_is_here')
		})
	})
})()