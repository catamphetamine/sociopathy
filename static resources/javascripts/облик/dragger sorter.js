var Dragger_sorter = new Class
({
	Implements: [Options],
	
	initialize: function(list, dragger, options)
	{
		this.list = list
		this.dragger = dragger
		
		this.setOptions(options)
	},
	
	dragging_started: function(dragged_element)
	{
		var sorter = this
		
		this.items = []
		
		var first = $(this.list.children().first())
		
		this.options.width = first.outerWidth()
		this.options.height = first.outerHeight()
		
		this.options.horizontal_margin = parseInt(first.css('margin-left'))
		this.options.vertical_margin = parseInt(first.css('margin-top'))
		
		this.list.children().each(function()
		{
			sorter.items.push
			({
				element: $(this)
			})
		})
		
		this.refresh_item_positions()
		
		this.dragged_element_in_place_position = dragged_element.position()
		
		this.direction = {}
		
		this.left = this.dragged_element_in_place_position.left
		this.top = this.dragged_element_in_place_position.top
	},
	
	refresh_item_positions: function()
	{
		var sorter = this
		
		this.items.for_each(function()
		{
			var position = this.element.position()
			
			this.top = position.top
			this.left = position.left
		})
	},
	
	dragged: function(element, left, top)
	{
		var sorter = this
					
		left += this.dragged_element_in_place_position.left
		top += this.dragged_element_in_place_position.top
		
		var center_left = left + this.options.width / 2
		var center_top = top + this.options.height / 2
		
		var below
		
		this.items.for_each(function()
		{
			if (element.node() === this.element.node())
				return
			
			if (below)
				return
			
			if (center_left >= this.left && center_left <= this.left + sorter.options.width)
			{
				if (center_top >= this.top && center_top <= this.top + sorter.options.height)
				{
					below = this
				}
			}
		})
		
		if (!below)
			return
		
		var shift =
		{
			left: below.left - this.dragged_element_in_place_position.left,
			top: below.top - this.dragged_element_in_place_position.top
		}
		
		if (!element.lies_after(below.element))
		{
			element.append_after(below.element)
		}
		else
		{
			element.append_before(below.element)
		}
			
		this.dragged_element_in_place_position =
		{
			left: below.left,
			top: below.top
		}
			
		this.dragger.element_shifted_by(shift)
		
		element.move_by({ left: -shift.left, top: -shift.top })
	
		this.refresh_item_positions()
	}
})

var Dragger_sorting_plugin = new Class
({
	initialize: function(dragger, list)
	{
		this.dragger = dragger
		
		this.sorter = new Dragger_sorter(list, dragger)
	},
	
	each_item: function(item)
	{
		var sorter = this.sorter
		
		item.on('dragging_starts', function(event)
		{
			sorter.dragging_started(item)
		})
		
		item.on('dragging', function(event, data)
		{
			sorter.dragged(item, data.left, data.top)
		})
	}	
})