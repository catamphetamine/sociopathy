var Focus = new (new Class
({
	focused: true,
	
	focus: function()
	{
		$(document).trigger('focused')
	},
	
	activate: function()
	{
		var self = this
		
		$(window).on('focus.focus', function()
		{
			self.focused = true
			
			self.focus()
		})
		
		$(window).on('blur.focus', function()
		{
			self.focused = false
		})
		
		$(window).on('keypress.focus', function()
		{
			self.focused = true
		})
		
		$(window).on('click.focus', function()
		{
			self.focused = true
		})
	}
}))()

$(function()
{
	Focus.activate()
})