var Scroll_navigation = new Class
({
	Implements: [Options],

	can_scroll: true,
	
	Mouse_wheel_navigation_threshold: 3,
	Mouse_wheel_fast_navigation_threshold: 6,
	Unblock_scrolling_after: 500,
	Fast_navigation_mode_life_time: 300,
	
	scrolled: 0,
	
	fast_navigation_mode_timers: [],
	
	fast_navigation_mode: false,
	
	timers: [],
	
	namespace: '.scroll_navigation',
	
	bound: [],
	
	initialize: function(options)
	{
		this.setOptions(options)
		
		if (!this.options.previous_fast)
			this.options.previous_fast = this.options.previous
		
		if (!this.options.next_fast)
			this.options.next_fast = this.options.next
	},
	
	deactivate: function()
	{
		this.timers.forEach(function(timer)
		{
			clearTimeout(timer)
		})
		
		this.timers.empty()
		
		var scroll_navigation = this
		this.bound.forEach(function(bound)
		{
			bound.unbind(scroll_navigation.namespace)
		})
		
		this.bound.empty()
	},
	
	block_scrolling: function()
	{
		this.can_scroll = false
	},
	
	unblock_scrolling: function()
	{
		this.can_scroll = true
	},
	
	disable_fast_navigation_mode_if_was_inactive: function(previously_scrolled)
	{
		if (this.scrolled === previously_scrolled)
		{
			this.fast_navigation_mode = false
			this.scrolled = 0
		}
		else
			this.maybe_disable_fast_navigation_mode_if_inactive()
	},
	
	maybe_disable_fast_navigation_mode_if_will_be_inactive: function()
	{
		this.fast_navigation_mode_timers.forEach(function(timer)
		{
			clearTimeout(timer)
		})
		
		this.fast_navigation_mode_timers.empty()
		
		var navigation = this;
		(function(scrolled)
		{
			navigation.fast_navigation_mode_timers.push((function()
			{
				navigation.disable_fast_navigation_mode_if_was_inactive.bind(navigation)(scrolled)
			})
			.delay(navigation.Fast_navigation_mode_life_time))
		})
		(this.scrolled)
	},
	
	speed_factor: function(delta)
	{
		return 1 + (this.Mouse_wheel_navigation_threshold - Math.abs(this.scrolled)) * 0.2
	},
	
	activate: function(element)
	{
		this.bound.push(element)
		
		element.on('mousewheel' + this.namespace, this.on_scroll.bind(this))
	},
	
	on_scroll: function(event, delta)
	{
		event.preventDefault()
		
		if (Math.abs(delta) >= this.Mouse_wheel_fast_navigation_threshold)
		{	
			this.fast_navigation_mode = true
		}
		
		if (this.fast_navigation_mode)
		{
			this.scrolled = -delta
			
			if (this.scrolled > 0)
				this.options.next_fast()
			else
				this.options.previous_fast()
			
			return this.maybe_disable_fast_navigation_mode_if_will_be_inactive()
		}
		
		if (!this.can_scroll)
			return
		
		var delta_scroll = -delta * this.speed_factor(delta)
		
		if (this.scrolled * delta_scroll > 0)
			this.scrolled += delta_scroll
		// если разного знака - начать как заново
		else
			this.scrolled = delta_scroll
			
		if (Math.abs(this.scrolled) < this.Mouse_wheel_navigation_threshold)
			return
			
		this.block_scrolling()
			
		var result
		if (this.scrolled > 0)
			result = this.options.next()
		else
			result = this.options.previous()
			
		if (result !== false)
			// картинка сменилась
			this.timers.push(this.unblock_scrolling.bind(this).delay(this.Unblock_scrolling_after))
		else
			this.unblock_scrolling()
			
		this.scrolled = 0
	}
})