var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],

	initialize: function()
	{
		$(window).on('scroll', this.process_scroll)
		//$(window).on('resize', this.reset)
	},
	
	watching: function(element)
	{
		return this.elements.contains(element.node())
	},
	
	watch: function(element, previous_top_offset_in_window)
	{
		if (typeof previous_top_offset_in_window === 'undefined')
			previous_top_offset_in_window = $(window).height() + 1
	
		this.elements.push(element.node())
		element.data('top_offset_in_window', previous_top_offset_in_window)
		this.check_for_events(element)
	},
	
	unwatch: function(element)
	{
		this.elements.remove(element.node())
	},
	
	reset: function(element)
	{
	},
	
	process_scroll: function()
	{
		this.elements.forEach(function(element)
		{
			this.check_for_events($(element))
		},
		this)
	},

	check_for_events: function(element, options)
	{
		options = options || {}
	
		var top_offset_in_window = element.offset().top - $(window).scrollTop()
		
		var previous_top_offset_in_window = element.data('top_offset_in_window')
		element.data('top_offset_in_window', top_offset_in_window)
		
		var delta = top_offset_in_window - previous_top_offset_in_window
		var window_height = $(window).height()
		
		if (top_offset_in_window < 0 && previous_top_offset_in_window >= 0)
			element.trigger('disappearing_upwards.scroller')
		else if (previous_top_offset_in_window < 0 && top_offset_in_window >= 0
					&& (top_offset_in_window + element.height() <=  window_height || element.height() > window_height))
			element.trigger('fully_appeared_on_top.scroller')
		else if (previous_top_offset_in_window > window_height
					&& top_offset_in_window <=  window_height)
			element.trigger('appearing_on_bottom.scroller', window_height - top_offset_in_window)
	},
	
	scroll_to: function(element, options, callback)
	{
		options = options || {}
		callback = callback || $.noop
	
		var y = options.top_offset
		
		if (typeof y === 'undefined')
			y = element.offset().top
		
		if (options.make_room_for_text_readability)
		{
			var line_height = parseInt(element.css('line-height'))
			
			if (y - line_height >= 0)
				y -= line_height
		}
		
		if (options.bottom)
		{
			y += element.outerHeight(true)
		}
		
		var document_height = parseInt($(document).height())
		var window_height = parseInt($(window).height())
		if (y + window_height > document_height)
			y = document_height - window_height
		
		var scroller
		if ($.browser.webkit)
			scroller = $('body')
		else if ($.browser.mozilla)
			scroller = $('html')
		else
			throw 'Unsupported browser'
			
		var namespace = '.scroller_' + new Date().getTime()
		
		var finalized = false
		var finished = function()
		{
			if (finalized)
				return
				
			finalized = true
			callback()
		}
		
		options.duration = options.duration || 1000
		
		scroller.animate({ scrollTop: y + 'px' }, options.duration, 'easeInOutCubic', function()
		{
			$(document).unbind(namespace)
			finished()
		})
		
		$(document).on('wheel' + namespace, function(event)
		{
			// clear queue, dont jump to end
			scroller.stop(true, false)
			
			$(document).unbind(namespace)
			finished()
		})
	}
})

var прокрутчик

$(function()
{
	прокрутчик = new Scroller()
})