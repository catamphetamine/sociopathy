(function()
{
	$.fn.floating_top_bar = function(action, options)
	{
		options = options || {}
		
		switch (action)
		{
			case 'show':
				return show_floating_top_bar.bind(this)(options)
				
			case 'hide':
				return hide_floating_top_bar.bind(this)(options)
				
			case 'unload':
				var container = this.parent()
				page.unwatch(container)
			
			default:
				return create_floating_top_bar.bind(this)()
		}
	}
	
	function create_floating_top_bar()
	{
		var $this = this
		var container = this.parent()
		
		container.on('disappears_on_top.scroller', function(event, options)
		{
			if (options && options.first_time)
				return
			
			event.stopPropagation()
			$this.addClass('sticky').addClass('fixed_on_the_top')
			
			$this.trigger('floats')
			
//			if ($this.css('position') !== 'fixed')
//				alert('You should set "position: fixed" for the floating top bar (for ".your_bar.sticky" style class) in your Css')
		})
		
		container.on('fully_appears_on_top.scroller', function(event)
		{
			event.stopPropagation()
			$this.css({ top: 0 }).removeClass('sticky').removeClass('fixed_on_the_top')
			
			$this.trigger('unfloats')
		})
		
		page.watch(container)
	}
	
	function show_floating_top_bar(options)
	{
		this.stop_animation()
		
		if (!this.hasClass('sticky'))
		{
			var duration = 0.3
			if (typeof options.duration !== 'undefined')
				duration = options.duration
				
			return this.css({ top: 0 }).fade_in(duration)
		}
	
		if (parseFloat(this.css('top')) === 0)
			this.move_out_upwards()
			
		this.opaque().slide_in_from_top()
	}
	
	function hide_floating_top_bar(options)
	{
		this.stop_animation()
		
		if (!this.hasClass('sticky'))
		{
			var duration = 0.3
			if (typeof options.duration !== 'undefined')
				duration = options.duration
				
			return this.css({ top: 0 }).fade_out(duration, { hide: true })
		}
	
		this.opaque().slide_out_upwards()
	}
})()