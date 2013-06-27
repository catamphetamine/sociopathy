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
			
		this.active = false
			
		Ajax.post('/пользователь/присутствие', {})
	},

	detected: function()
	{
		this.active = true
	}
}))();

(function()
{
	$(window).on('focus', function()
	{
		Activity.detected()
	})

	$(document).on('keydown', function()
	{
		Activity.detected()
	})

	$(document).on('mousedown', function()
	{
		Activity.detected()
	})

	$(document).on('mousemove', function()
	{
		Activity.detected()
	})

	$(window).on('scroll', function()
	{
		Activity.detected()
	})
})()
