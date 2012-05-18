var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],

	initialize: function()
	{
		$(window).on('scroll', this.process_scroll.bind(this))
		//$(window).on('resize', this.reset.bind(this))
	},
	
	watching: function(element)
	{
		return this.elements.contains(element.node())
	},
	
	watch: function(element)
	{
		if (this.elements.contains(element.node()))
			return
			
		//if (typeof previous_top_offset_in_window === 'undefined')
		//	previous_top_offset_in_window = $(window).height() + 1
	
		this.elements.push(element.node())
		element.data('first_time_with_scroller', true)
		//element.data('top_offset_in_window', previous_top_offset_in_window)
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
		var scroller = this
		this.elements.for_each(function()
		{
			scroller.check_for_events($(this))
		},
		this)
	},

	check_for_events: function(element, options)
	{
		options = options || {}
	
		var top_offset_in_window = element.offset().top - $(window).scrollTop()
		
		var first_time = element.data('first_time_with_scroller')
		if (first_time)
			element.data('first_time_with_scroller', false)
		
		var previous_top_offset_in_window = element.data('top_offset_in_window')
		element.data('top_offset_in_window', top_offset_in_window)
		
		var delta = top_offset_in_window - previous_top_offset_in_window
		
		var window_height = $(window).height()
		var height = element.height()
		
		var top_is_visible = top_offset_in_window >= 0 && top_offset_in_window < window_height
		var bottom_is_visible = top_offset_in_window + height >= 0 && top_offset_in_window + height < window_height
		
		var top_was_visible = false
		var bottom_visible = false
		
		if (!first_time)
		{
			top_was_visible = previous_top_offset_in_window >= 0 && previous_top_offset_in_window < window_height
			bottom_visible = previous_top_offset_in_window + height >= 0 && previous_top_offset_in_window + height < window_height
		}
		
		var upwards
		var downwards
		if (!first_time)
		{
			upwards = top_offset_in_window < previous_top_offset_in_window
			downwards = !upwards
		}
		
		if (!first_time && top_was_visible && !top_is_visible)
		{
			if (upwards)
				element.trigger('disappears_on_top.scroller')
			else
				element.trigger('disappears_on_bottom.scroller')
		}
		
		if (!top_was_visible && top_is_visible && bottom_is_visible)
		{
			if (first_time || downwards)
				element.trigger('fully_appears_on_top.scroller')
		}
		
		if (!top_was_visible && top_is_visible)
		{
			if (first_time || upwards)
				element.trigger('appears_on_bottom.scroller', window_height - top_offset_in_window)
		}
		
		if (!first_time)
		{
			if (previous_top_offset_in_window < 0 && top_offset_in_window >= window_height && downwards)
			{
				if (bottom_is_visible)
					element.trigger('disappears_on_bottom.scroller')
				else
					element.trigger('disappears_on_bottom.scroller')
//					element.trigger('disappeared_on_bottom.scroller')
			}
			
			if (previous_top_offset_in_window >= window_height && top_offset_in_window < 0 && upwards)
			{
				if (bottom_is_visible)
					element.trigger('disappears_on_top.scroller')
				else
					element.trigger('disappears_on_top.scroller')
//					element.trigger('disappeared_on_top.scroller')
			}
		}
		else
		{
			if (!top_is_visible && !bottom_is_visible)
			{
				if (downwards)
					element.trigger('disappears_on_bottom.scroller')
				else
					element.trigger('disappears_on_top.scroller')
			}
		}
		
		/*
		if (top_offset_in_window + height <= 0)
			element.data('visible', false)
		else if (top_offset_in_window >= window_height)
			element.data('visible', false)
		else
			element.data('visible', true)
		*/
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
		
		options.duration = options.duration || this.scroll_duration(Math.abs($(window).scrollTop() - y))
		
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
	},
	
	scroll_duration: function(x)
	{
		var value = -Math.log(x)
		
		if (value < 0)
			value = 0
			
		return 1000 * value + 700
	}
})

var прокрутчик

$(function()
{
	прокрутчик = new Scroller()
})