var Scroller = new Class
({
	Binds: ['process_scroll', 'reset'],
	
	elements: [],
	
	unwatched: [],

	initialize: function()
	{
		var process_scroll = this.process_scroll.bind(this)
		
		window.on('scroll', process_scroll)
		
		document.on('focused', function()
		{
			//console.log('Window focused. Processing pseudo scroll')
			process_scroll({ first_time: true })
		})
	},
	
	watching: function(element)
	{
		var filtered = this.elements.filter(function(an_element)
		{
			return an_element === element
		})
		
		return !filtered.is_empty()
	},
	
	watch: function(element, options)
	{
		element = Dom.normalize(element)
	
		if (this.watching(element))
			return //console.log('already watching')
		
		options = options || {}
	
		if (options.first)
			this.elements.unshift(element)
		else
			this.elements.push(element)
		
		element.dataset.first_time_with_scroller = true
		this.check_for_events(element)
		
		//console.log('Watched elements:')
		//console.log(this.elements.map(function(element) { return element.node() }))
	},
	
	unwatch: function(element)
	{
		element = Dom.normalize(element)
	
		if (this.collect_unwatched)
			return this.unwatched.add(element)
	
		var i = 0
		while (i < this.elements.length)
		{
			if (this.elements[i] === element)
			{
				return this.elements.remove_at(i)
				//return this.unwatch(element)
			}
			
			i++
		}
	},
	
	reset: function(element)
	{
	},
	
	process_scroll: function(options)
	{
		this.collect_unwatched = true
	
		var scroller = this
		this.elements.for_each(function()
		{
			scroller.check_for_events(this, options)
		},
		this)
		
		this.collect_unwatched = false
		this.unwatched.forEach(function(element)
		{
			this.unwatch(element)
		}
		.bind(this))
		this.unwatched = []
	},

	check_for_events: function(element, options)
	{
		//console.log('Process scroll for:')
		//console.log(element.node())
		
		options = options || {}
	
		if (!element.style.display || element.style.display === 'none')
			return
	
		var top_offset_in_window = element.offsetTop - this.scrolled()
		
		var first_time = element.dataset.first_time_with_scroller
		if (first_time)
			element.dataset.first_time_with_scroller = false
			
		first_time = first_time || options.first_time
		
		var previous_top_offset_in_window = element.dataset.top_offset_in_window
		element.dataset.top_offset_in_window = top_offset_in_window
		
		var delta = top_offset_in_window - previous_top_offset_in_window
		
		/*
		console.log('first_time')
		console.log(first_time)
		
		console.log('delta')
		console.log(delta)
		*/
		
		if (!first_time && delta === 0)
			return
		
		var window_height = window.height()
		
		var get_bottom_margin = element.dataset.custom_bottom_margin
		if (get_bottom_margin)
		{
			get_bottom_margin = $(element).data('прокрутчик.get_bottom_margin')
		
			window_height -= get_bottom_margin()
			if (window_height < 0)
				return
		}
		
		//console.log('window_height')
		//console.log(window_height)
		
		var height = element.clientHeight
		
		var top_is_visible = top_offset_in_window >= 0 && top_offset_in_window < window_height
		var bottom_is_visible = top_offset_in_window + height >= 0 && top_offset_in_window + height < window_height
		
		/*
		console.log('window_height')
		console.log(window_height)
		
		console.log('top_offset_in_window')
		console.log(top_offset_in_window)
		
		console.log('height')
		console.log(height)
		
		console.log('top_is_visible')
		console.log(top_is_visible)
		
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
		
		// is the element moving up or down?
		var upwards
		var downwards
		if (!first_time)
		{
			upwards = top_offset_in_window < previous_top_offset_in_window
			downwards = !upwards
		}
		
		/*
		console.log('top_was_visible')
		console.log(top_was_visible)
		
		console.log('top_is_visible')
		console.log(top_is_visible)
		
		console.log('bottom_was_visible')
		console.log(bottom_was_visible)
		
		console.log('bottom_is_visible')
		console.log(bottom_is_visible)
		
		console.log('downwards')
		console.log(downwards)
		*/
		
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
		
		function appears_on_bottom()
		{
			element.trigger('appears_on_bottom') // , window_height - top_offset_in_window
		}
		
		if (first_time)
		{
			if (top_is_visible)
				appears_on_bottom()
		}
		else if (!top_was_visible && top_is_visible)
		{
			if (upwards)
				appears_on_bottom()
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
	
	scrolled: function()
	{
		if (typeof window.scrollY !== 'undefined')
			return window.scrollY
			
		return window.pageYOffset
	},
	
	scroll_to_position: function(y)
	{
		window.scrollTo(0, y)
	},
	
	scroll_to: function(element, options, callback)
	{
		if (typeof element === 'number' || element instanceof Number)
			return this.scroll_to_position(element)
		
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
		
		var document_height = parseInt(document.height)
		var window_height = parseInt(window.height())
		if (y + window_height > document_height)
			y = document_height - window_height
	
		this.scroll_to_y(y, options, callback)
	},
	
	scroll_to_bottom: function()
	{
		this.scroll_to_y(document.height - window.height())
	},
	
	scroll_to_top: function()
	{
		this.scroll_to(0)
	},
	
	scroll_by: function(how_much)
	{
		window.scrollBy(0, how_much)
	},
	
	scroll_to_y: function(y, options, callback)
	{
		options = options || {}
	
		var scroller
		if (bowser.webkit)
			scroller = $body
		else
			scroller = $html
			
		//	throw 'Unsupported browser'
		
		var finalized = false
		var finished = function()
		{
			if (finalized)
				return
				
			finalized = true
			
			if (callback)
				callback()
		}
		
		options.duration = options.duration || this.scroll_duration(Math.abs(this.scrolled() - y))
		
		var scroll_animation_stopper = function(event)
		{
			// clear queue, dont jump to end
			scroller.stop(true, false)
			
			window.removeEventListener('scroll', scroll_animation_stopper)
			finished()
		}
		
		window.on('scroll', scroll_animation_stopper)
		
		scroller.animate({ scrollTop: y + 'px' }, options.duration, 'easeInOutCubic', function()
		{
			window.removeEventListener('scroll', scroll_animation_stopper)
			finished()
		})
	},
	
	scroll_duration: function(x)
	{
		x = Math.abs(x)
		
		if (x > Math.E)
			value = Math.log(x) // 1 ... Infinity
		else
			value = 0.5 + (x / Math.E) / 2 // 0.5 ... 1
			
		return 30 * value + 700
	},
	
	in_the_end: function()
	{
		return this.scrolled() + window.height() === document.height
	},
	
	to_the_end: function()
	{
		var scroll_to = document.height - window.height()
		if (scroll_to > 0)
			this.scroll_to(scroll_to)
	}
})

var прокрутчик = new Scroller()