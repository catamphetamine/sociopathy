var Thrower = new Class
({
	Speed_threshold: 5,
	Minimum_dt: 30,
	
	Cooldown: 2.2,
	
	watching: true,
	
	initialize: function()
	{
	},
	
	moved: function(info)
	{
		if (!this.watching)
			return
		
		var left = info.absolute.left
		var top = info.absolute.top
		
		var time = new Date().getTime()
		var previous_time = this.time
		
		var dt = time - previous_time
		if (dt < this.Minimum_dt)
			return
		
		this.time = time
		
		var previous_coordinates = this.coordinates
		this.coordinates = { left: left, top: top }
		
		if (!this.started_at)
			this.started_at = this.coordinates
		
		if (!previous_coordinates)
			return
		
		var dx = left - previous_coordinates.left
		var dy = -(top - previous_coordinates.top)
		
		var dr = Math.sqrt(dx * dx + dy * dy)
		
		this.speed_x = dx * 1.0 / dt
		this.speed_y = dy * 1.0 / dt
		
		var speed = dr / dt
		
		var previous_speed = this.speed
		this.speed = speed
		
		if (speed >= this.Speed_threshold)
			this.throwing = true
		else
			this.throwing = false
		
		var dv
		if (previous_speed)
			dv = speed - previous_speed
		
		this.calculations = { dt: dt, dv: dv }
	},
	
	acceleration: function()
	{
		if (!this.previous_speed)
			return
		
		return this.speed - this.previous_speed 
	},
	
	stop_watching: function()
	{
		this.watching = false
	},
	
	stop_throwing: function()
	{
		this.throwing = false
	},
	
	thrown: function()
	{
		var calculations = this.calculations //this.moved(x, y)
		
		if (!this.throwing)
			return
		
		return true
	},
	
	throw_out: function(element)
	{
		var previous_time
		
		var position = this.coordinates
		
		var left = parseInt(element.css('left'))
		var top = parseInt(element.css('top'))
		
		var thrown_out_at
		
		animate(element, (function(now)
		{
			//console.log(now)
			
			if (!previous_time)
			{
				thrown_out_at = now
				previous_time = now
				return
			}
			
			if (!this.throwing)
				return false
			
			var delta_t = now - thrown_out_at
			
			var delta_x = this.speed_x * delta_t
			var delta_y = this.speed_y * delta_t
			
			element.move_to
			({
				left: left + delta_x,
				top: top - delta_y
			})
		})
		.bind(this))
	}
})

var Dragger_throwing_plugin = new Class
({
	initialize: function(dragger, list)
	{
		this.dragger = dragger
	},
	
	each_item: function(item)
	{
		item.on('dragging_starts', (function(event)
		{
			this.thrower = new Thrower()
		})
		.bind(this))
		
		item.on('dragging', (function(event, data)
		{
			this.thrower.moved(data)
			
			if (this.thrower.throwing)
				this.dragger.options.come_back_after_drop = false
			else
				this.dragger.options.come_back_after_drop = true
		})
		.bind(this))
		
		item.on('dropped', (function(event)
		{
			var dragger = this.dragger
			var thrower = this.thrower
			
			thrower.stop_watching()
				
			if (!thrower.thrown())
				return
		
			thrower.throw_out(item)
			
			item.fade_out(0.2, { hide: false }, function()
			{
				dragger.destroy(item)
				
				thrower.stop_throwing()
				
				item.css('width', 0)
				item.css('margin-left', 0)
				item.css('margin-right', 0)
				
				;(function()
				{
					item.remove()
				})
				.delay(300)
			})
		})
		.bind(this))
	}	
})