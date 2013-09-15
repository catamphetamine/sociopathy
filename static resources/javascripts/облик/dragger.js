var Dragger = new Class
({
	Implements: [Options],
	
	options:
	{
		come_back_after_drop: true
	},
	
	namespace: '.dragger_' + $.unique_namespace(),
	
	plugins: [],
	
	initialize: function(element, options)
	{
		this.setOptions(options)
			
		this.element = element
		
		if (this.options.sortable)
			this.plugins.push(Dragger_sorting_plugin)
		
		if (this.options.throwable)
			this.plugins.push(Dragger_throwing_plugin)
		
		var i = 0
		while (i < this.plugins.length)
		{
			this.plugins[i] = new this.plugins[i](this, element, this.options)
			i++
		}
		
		this.create()
	},
	
	create: function()
	{
		var element = this.element
			//.addClass('draggable')
		
		this.draggable(this.element)
		
		this.plugins.for_each(function()
		{
			this.each_item(element)
		})
	},
	
	draggable: function(element)
	{
		element.on('mousedown' + this.namespace, (function(event)
		{
			if (!left_mouse_button(event))
				return
			
			var target = $(event.target)
			
			if (this.options.dont_start_dragging_on)
				if (element.find(this.options.dont_start_dragging_on).contains_or_is(target))
					return
			
			if (this.options.drag_on)
			{
				var can_drag = false
				
				element.find(this.options.drag_on).each(function()
				{
					if ($(this).contains_or_is(target))
						can_drag = true
				})
				   
				if (!can_drag)
					return
			}
			
			event.preventDefault()
			
			// to disable links
			element.on('click' + this.namespace, function(event)
			{
				event.preventDefault()
				event.stopImmediatePropagation()
			
				element.unbind('click' + this.namespace)
			})
			
			this.clicked_at =
			{
				left: event.pageX,
				top: event.pageY
			}
			
			this.dragged_element_resided_at =
			{
				left: parseInt(element.css('left')),
				top: parseInt(element.css('top'))
			}
			
			this.dragged_element_resided_at.left = this.dragged_element_resided_at.left || 0
			this.dragged_element_resided_at.top = this.dragged_element_resided_at.top || 0
			
			this.start(element)
		})
		.bind(this))
	},
	
	dragged: function(left, top)
	{
		this.moved = true
		
		//console.log('left = ' + left + ', top = ' + top)
	},
	
	element_shifted_by: function(by)
	{
		this.clicked_at.left += by.left
		this.clicked_at.top += by.top
	},
	
	start: function(element)
	{
		element.trigger('dragging_starts')
		
		this.moved = false
		
		this.initially_clicked_at = 
		{
			left: this.clicked_at.left,
			top: this.clicked_at.top
		}
		
		$('body').on('mouseup' + this.namespace, (function(event)
		{
			this.drop()
		})
		.bind(this))
		
		this.dragged_element = element
		
		$('body').on('mousemove' + this.namespace, (function(event)
		{
			var delta_left = event.pageX - this.clicked_at.left
			var delta_top = event.pageY - this.clicked_at.top
			
			var left = this.dragged_element_resided_at.left + delta_left
			var top = this.dragged_element_resided_at.top + delta_top
			
			var absolute =
			{
				left: left + (this.clicked_at.left - this.initially_clicked_at.left),
				top: top + (this.clicked_at.top - this.initially_clicked_at.top)
			}
			
			this.dragged(left, top)
			
			element.move_to({ left: left, top: top })
			
			element.trigger('dragging', { left: left, top: top, absolute: absolute })
		})
		.bind(this))
		
		element.css
		({
			position: 'relative',
			
			left: this.dragged_element_resided_at.left + 'px',
			top: this.dragged_element_resided_at.top + 'px',
			
			'z-index': 1
		})
		
		element.addClass('dragged')
		element.removeClass('dropped')
	},
	
	drop: function()
	{
		this.dragged_element.trigger('dropped')
		
		if (!this.moved)
		{
			this.dragged_element.unbind('click' + this.namespace)
			this.dragged_element.trigger('clicked')
		}
		
		if (this.options.come_back_after_drop)
		{
			this.dragged_element.animate
			({
				left: 0,
				top: 0
			},
			300,
			'easeInOutQuad', (function()
			{
				if (this.dragged_element.hasClass('dropped'))
				{
					this.dragged_element.css
					({
						'z-index': 0
					})
		
					this.dragged_element.removeClass('dropped')
				}
			})
			.bind(this))
		}
		
		this.dragged_element.addClass('dropped')
		this.dragged_element.removeClass('dragged')
		
		$('body').unbind(this.namespace)
	},
	
	refresh: function()
	{
		this.destroy()
		this.create()
	},
	
	destroy: function(element)
	{
		if (element)
		{
			element.css
			({
				left: 0,
				top: 0,
				
				'z-index': 0
			})
			
			element.removeClass('dragged')
			
			element.unbind(this.namespace)
			
			this.plugins.for_each(function()
			{
				this.destroy(element)
			})
		}
		else
		{
			this.clean_up()
			
			$('body').unbind(this.namespace)
			
			this.plugins.for_each(function()
			{
				this.destroy()
			})
		}
	},
	
	clean_up: function()
	{
		this.destroy(this.element)
	}
})

var List_dragger = new Class
({
	Extends: Dragger,
	
	initialize: function(element, options)
	{
		this.list = element
		
		this.parent(element, options)
	},
	
	create: function()
	{
		var dragger = this
		
		var offset = this.list.offset()
		
		this.list.children().each(function()
		{
			var item = $(this)
			
			dragger.draggable(item)
			
			dragger.plugins.for_each(function()
			{
				this.each_item(item)
			})
		})
	},
	
	clean_up: function()
	{
		var dragger = this
		
		this.list.children().each(function()
		{
			dragger.destroy($(this))
		})
	}
})