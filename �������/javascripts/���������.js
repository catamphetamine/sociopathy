var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],

	initialize: function()
	{
		$(window).bind('scroll', this.process_scroll)
		//$(window).bind('resize', this.reset)
	},
	
	watching: function(element)
	{
		return this.elements.contains(element)
	},
	
	watch: function(element, previous_top_offset_in_window)
	{
		this.elements.push(element)
		element.data('top_offset_in_window', previous_top_offset_in_window)
		this.check_for_events(element)
	},
	
	unwatch: function(element)
	{
		this.elements.erase(element)
	},
	
	reset: function(element)
	{
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
			element.trigger('disappearing_upwards.scroller')
		else if (previous_top_offset_in_window < 0 && top_offset_in_window >= 0
					&& top_offset_in_window + element.height() <=  window_height)
			element.trigger('fully_appeared_on_top.scroller')
		else if (previous_top_offset_in_window > window_height
					&& top_offset_in_window <=  window_height)
			element.trigger('appearing_on_bottom.scroller')
	}
})

var прокрутчик

$(function()
{
	прокрутчик = new Scroller()
})