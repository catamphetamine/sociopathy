var Focus = new (new Class
({
	focused: true,
	
	focus: function()
	{
		if (this.focused)
			return
		
		this.focused = true
	
		$(document).trigger('focused')
	},
	
	activate: function()
	{
		var self = this
		
		$(window).on('focus.focus', function()
		{
			self.focus()
		})
		
		$(window).on('blur.focus', function()
		{
			self.focused = false
		})
		
		$(window).on('keypress.focus', function()
		{
			self.focus()
		})
		
		$(window).on('click.focus', function()
		{
			self.focus()
		})
	}
}))()

$(function()
{
	Focus.activate()
})