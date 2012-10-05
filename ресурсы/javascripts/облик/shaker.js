var Shaker = new Class
({
	Shake_contractions: 5,
	
	Cooldown: 2.2,
	
	active: true,
	
	contractions: [],
	
	initialize: function(on_shake)
	{
		this.on_shake = on_shake
	},
	
	moved: function(x, y)
	{
		if (!this.active)
			return
		
		var previous_coordinates = this.previous_coordinates
		this.previous_coordinates = { x: x, y: y }
		
		if (!previous_coordinates)
			return
		
		var pre_previous_coordinates = this.pre_previous_coordinates
		this.pre_previous_coordinates = previous_coordinates
		
		if (!pre_previous_coordinates)
			return
		
		/*
		console.log('previous_coordinates')
		console.log(previous_coordinates)
		console.log('pre_previous_coordinates')
		console.log(pre_previous_coordinates)
		*/
		
		var dx = previous_coordinates.x - x
		var dy = previous_coordinates.y - y
		
		var distance = dx * dx + dy * dy
		
		var previous_dx = pre_previous_coordinates.x - previous_coordinates.x
		var previous_dy = pre_previous_coordinates.y - previous_coordinates.y
		
		var previous_distance = previous_dx * previous_dx + previous_dy * previous_dy
		
		var two_ticks_dx = pre_previous_coordinates.x - x
		var two_ticks_dy = pre_previous_coordinates.y - y
		
		var two_ticks_distance = two_ticks_dx * two_ticks_dx + two_ticks_dy * two_ticks_dy
		
		if (two_ticks_distance < distance)
			this.contraction()
		//else
		//	this.expansion()
	},
	
	contraction: function()
	{
		var now = new Date().getTime()
		
		this.contractions.push(now)
		
		this.remove_old_contractions(now)
		
		if (this.contractions.length >= this.Shake_contractions)
		{
			this.stop()
			this.on_shake()
		}
	},
	
	remove_old_contractions: function(now)
	{
		var contraction = this.contractions[0]
		
		if (!contraction)
			return
		
		if ((now - contraction) <= this.Cooldown * 1000)
			return
		
		this.contractions.shift()
		this.remove_old_contractions(now)
	},
	
	stop: function()
	{
		this.active = false
	}
})