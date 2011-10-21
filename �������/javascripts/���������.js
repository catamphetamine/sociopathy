var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],

	initialize: function()
	{
		$(window).bind('scroll', this.process_scroll)
		//$(window).bind('resize', this.reset)
	},
	
	watch: function(element)
	{
		this.elements.push(element)
		this.reset(element)
	},
	
	unwatch: function(element)
	{
		this.elements.erase(element)
	},
	
	reset: function(element)
	{
		element.data('top_offset_in_window', 0)
		this.check_for_events(element)
	},
	
	process_scroll: function()
	{
		this.elements.forEach(function(element)
		{
			this.check_for_events(element)
		},
		this)
	},

	check_for_events: function(element)
	{
		var top_offset_in_window = element.offset().top - $(window).scrollTop()
		
		var previous_top_offset_in_window = element.data('top_offset_in_window')
		element.data('top_offset_in_window', top_offset_in_window)
		
		var delta = top_offset_in_window - previous_top_offset_in_window
		var window_height = $(window).height()
		
		if (top_offset_in_window < 0 && previous_top_offset_in_window >= 0)
			element.trigger('scroller.disappearing_upwards')
		else if (previous_top_offset_in_window < 0 && top_offset_in_window >= 0)
			element.trigger('scroller.fully_appeared_on_top')
		else if (previous_top_offset_in_window > window_height
					&& top_offset_in_window <=  window_height)
			element.trigger('scroller.appearing_on_bottom')
	}
})

var прокрутчик

$(function()
{
	прокрутчик = new Scroller()
})