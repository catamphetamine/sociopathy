var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],

	initialize: function()
	{
		$(window).on('scroll', this.process_scroll.bind(this))
		$(document).on('focused', this.process_scroll.bind(this))
		//$(window).on('resize', this.reset.bind(this))
	},
	
	watching: function(element)
	{
		var contains = false
		this.elements.for_each(function()
		{
			if (this.node() === element.node())
				contains = true
		})
		
		return contains
	},
	
	watch: function(element)
	{
		if (this.watching(element))
			return
			
		//if (typeof previous_top_offset_in_window === 'undefined')
		//	previous_top_offset_in_window = $(window).height() + 1
	
		this.elements.push(element)
		element.data('first_time_with_scroller', true)
		//element.data('top_offset_in_window', previous_top_offset_in_window)
		this.check_for_events(element)
	},
	
	unwatch: function(element)
	{
		var i = 0
		while (i < this.elements.length)
		{
			if (this.elements[i].node() === element.node())
			{
				this.elements.splice(i, 1)
				return this.unwatch(element)
			}
			
			i++
		}
	},
	
	reset: function(element)
	{
	},
	
	process_scroll: function(options)
	{
		var scroller = this
		this.elements.for_each(function()
		{
			scroller.check_for_events(this, options)
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
			
		first_time = first_time || options.first_time
		
		var previous_top_offset_in_window = element.data('top_offset_in_window')
		element.data('top_offset_in_window', top_offset_in_window)
		
		var delta = top_offset_in_window - previous_top_offset_in_window
		
		var window_height = $(window).height()
		
		var get_bottom_margin = element.data('прокрутчик.get_bottom_margin')
		if (get_bottom_margin)
		{
			window_height -= get_bottom_margin()
			if (window_height < 0)
				return window_height = 0
		}	
		
		var height = element.height()
		
		var top_is_visible = top_offset_in_window >= 0 && top_offset_in_window < window_height
		var bottom_is_visible = top_offset_in_window + height >= 0 && top_offset_in_window + height < window_height
		
		/*
		console.log(element)
		
		console.log('window_height')
		console.log(window_height)
		
		console.log('top_offset_in_window')
		console.log(top_offset_in_window)
		
		console.log('height')
		console.log(height)
		
		console.log('bottom_is_visible')
		console.log(bottom_is_visible)
		*/
		
		var top_was_visible = false
		var bottom_was_visible = false
		
		var event_options = { first_time: first_time }
		
		if (!first_time)
		{
			top_was_visible = previous_top_offset_in_window >= 0 && previous_top_offset_in_window < window_height
			bottom_was_visible = previous_top_offset_in_window + height >= 0 && previous_top_offset_in_window + height < window_height
		}
		
		// the element is moving up or down?
		var upwards
		var downwards
		if (!first_time)
		{
			upwards = top_offset_in_window < previous_top_offset_in_window
			downwards = !upwards
		}
		
		if (bottom_is_visible && top_is_visible)
			element.trigger('fully_visible')
		
		if (first_time)
		{
			if (bottom_is_visible)
				element.trigger('bottom_appears')
		}
		else
		{
			if (upwards && !bottom_was_visible && bottom_is_visible)
				element.trigger('bottom_appears')
		}
		
		if (!first_time && top_was_visible && !top_is_visible)
		{
			if (upwards)
				element.trigger('disappears_on_top')
			else
				element.trigger('disappears_on_bottom')
		}
		
		if ((!top_was_visible || (top_was_visible && !bottom_was_visible)) && top_is_visible && bottom_is_visible)
		{
			if (first_time || downwards)
				element.trigger('fully_appears_on_top')
				
			if (first_time || upwards)
				element.trigger('fully_appears_on_bottom')
		}
		
		if (!top_was_visible && top_is_visible)
		{
			if (first_time || upwards)
				element.trigger('appears_on_bottom', window_height - top_offset_in_window)
		}
		
		if (!first_time)
		{
			if (previous_top_offset_in_window < 0 && top_offset_in_window >= window_height && downwards)
			{
				if (bottom_is_visible)
					element.trigger('disappears_on_bottom')
				else
					element.trigger('disappears_on_bottom')
//					element.trigger('disappeared_on_bottom')
			}
			
			if (previous_top_offset_in_window >= window_height && top_offset_in_window < 0 && upwards)
			{
				if (bottom_is_visible)
					element.trigger('disappears_on_top', event_options)
				else
					element.trigger('disappears_on_top', event_options)
			}
		}
		else
		{
			if (!top_is_visible && !bottom_is_visible)
			{
				if (downwards)
					element.trigger('disappears_on_bottom')
				else
					element.trigger('disappears_on_top', event_options)
			}
		}
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
	
		this.scroll_to_y(y, options, callback)
	},
	
	scroll_to_bottom: function()
	{
		this.scroll_to_y($(document).height() - $(window).height())
	},
	
	scroll_to_y: function(y, options, callback)
	{
		options = options || {}
	
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
			
			if (callback)
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

var прокрутчик = new Scroller()