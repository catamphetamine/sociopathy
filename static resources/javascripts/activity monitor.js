function start_activity_monitor()
{
	var Activity = new (new Class
	({
		Binds: ['report'],
	
		active: true,
	
		initialize: function()
		{
			this.report.ticking(Configuration.Activity.Interval * 1000)
		},
		
		report: function()
		{
			if (!this.active)
				return
			
			if (!Эфир.работает())
				return
				
			//console.log('Reporting activity on ' + new Date())
				
			//Ajax.post('/сеть/пользователь/присутствие', {})
			
			Эфир.канал.emit('присутствие', {})
			this.active = false
		},
	
		detected: function()
		{
			//console.log('Activity detected on ' + new Date())
			
			this.active = true
		}
	}))();
	
	(function()
	{
		$(window).on('focus.activity', function()
		{
			Activity.detected()
		})
	
		$(document).on('keydown.activity', function()
		{
			Activity.detected()
		})
	
		$(document).on('mousedown.activity', function()
		{
			Activity.detected()
		})
	
		$(document).on('mousemove.activity', function()
		{
			Activity.detected()
		})
	
		$(window).on('scroll.activity', function()
		{
			Activity.detected()
		})
	})()
}