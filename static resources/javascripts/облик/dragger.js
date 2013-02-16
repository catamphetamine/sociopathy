var Dragger = new Class
({
	Implements: [Options],
	
	options:
	{
		come_back_after_drop: true
	},
	
	initialize: function(list, options)
	{
		this.setOptions(options)
		
		var dragger = this
		
		this.list = list
		
		var offset = list.offset()
		
		list.children().each(function()
		{
			dragger.draggable($(this))
		})
	},
	
	draggable: function(element)
	{
		element.on('mousedown.dragger', (function(event)
		{
			if (element.find(this.options.dont_start_dragging_on).contains_or_is($(event.target)))
				return
			
			event.preventDefault()
			
			this.clicked_at =
			{
				left: event.pageX,
				top: event.pageY
			}
			
			this.start(element)
		})
		.bind(this))
	},
	
	dragged: function(left, top)
	{
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
	
		this.initially_clicked_at = 
		{
			left: this.clicked_at.left,
			top: this.clicked_at.top
		}
		
		$('body').on('mouseup.dragger', (function()
		{
			this.drop()
		})
		.bind(this))
		
		this.element = element
		
		$('body').on('mousemove.dragger', (function(event)
		{
			var left = event.pageX - this.clicked_at.left
			var top = event.pageY - this.clicked_at.top
			
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
			
			left: 0,
			top: 0,
			
			'z-index': 1
		})
		
		element.addClass('dragged')
		element.removeClass('dropped')
	},
	
	drop: function()
	{
		this.element.trigger('dropped')
		
		if (this.options.come_back_after_drop)
		{
			this.element.animate
			({
				left: 0,
				top: 0
			},
			300,
			'easeInOutQuad', (function()
			{
				if (this.element.hasClass('dropped'))
				{
					this.element.css
					({
						'z-index': 0
					})
		
					this.element.removeClass('dropped')
				}
			})
			.bind(this))
		}
		
		this.element.addClass('dropped')
		this.element.removeClass('dragged')
		
		$('body').unbind('mousemove.dragger')
		$('body').unbind('mouseup.dragger')
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
			
			element.unbind('.dragger')
		}
		else
		{
			var dragger = this
			
			this.list.children().each(function()
			{
				dragger.destroy($(this))
			})
				
			$('body').unbind('.dragger')
		}
	}
})