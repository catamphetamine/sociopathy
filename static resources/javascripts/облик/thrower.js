var Thrower = new Class
({
	//Minimum_acceleration: 100,
	Speed_threshold: 5,
	//Minimum_throwing_path_radius: 100,
	Minimum_dt: 30,
	
	Cooldown: 2.2,
	
	watching: true,
	
	initialize: function()
	{
	},
	
	moved: function(left, top)
	{
		if (!this.watching)
			return
		
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
		
		//console.log('speed: ' + speed)
		
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
		
		/*
		var throwing_path_dx = x - this.throwing_started_at.x
		var throwing_path_dy = y - this.throwing_started_at.y
		var throwing_path_radius = Math.sqrt(throwing_path_dx * throwing_path_dx + throwing_path_dy * throwing_path_dy)
		
		console.log('throwing_path_radius: ' + throwing_path_radius)
		
		if (throwing_path_radius < this.Minimum_throwing_path_radius)
			return
		
		var acceleration = calculations.dv * 1.0 / calculations.dt
		
		console.log('acceleration: ' + acceleration())
		
		return acceleration > this.Minimum_acceleration
		*/
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
			
			element.css('left', (left + delta_x) + 'px')
			element.css('top', (top - delta_y) + 'px')
		})
		.bind(this))
	}
})