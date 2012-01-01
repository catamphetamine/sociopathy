(function()
{
	$.fn.floating_top_bar = function(action)
	{
		switch (action)
		{
			case 'show':
				return show_floating_top_bar.bind(this)()
				
			case 'hide':
				return hide_floating_top_bar.bind(this)()
				
			default:
				return create_floating_top_bar.bind(this)()
		}
	}
	
	function create_floating_top_bar()
	{
		var $this = this
		var container = this.parent()
	
		container.bind('disappearing_upwards.scroller', function(event, initialization)
		{
			event.stopPropagation()
			$this.addClass('sticky')
		})
		
		container.bind('fully_appeared_on_top.scroller', function(event, initialization)
		{
			event.stopPropagation()
			$this.css({ top: 0 }).removeClass('sticky')
		})
		
		прокрутчик.watch(container, 0)
	}
	
	function show_floating_top_bar()
	{
		if (!this.hasClass('sticky'))
			return this.css({ top: 0 }).fade_in(0.3)
	
		this.stop_animation()
	
		if (parseFloat(this.css('top')) === 0)
			this.move_out_upwards()
			
		this.opaque().slide_in_from_top()
	}
	
	function hide_floating_top_bar()
	{
		if (!this.hasClass('sticky'))
			return this.css({ top: 0 }).fade_out(0.3)
	
		this.opaque().slide_out_upwards()
	}
})()