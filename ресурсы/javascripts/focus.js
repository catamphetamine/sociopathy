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
		
		$(window).on('focus.focus', function() // 'focus.focus', 'page_is_visible.focus'
		{
			//console.log('focused')

			self.focus()
		})
		
		$(window).on('blur.focus', function() // 'blur.focus', 'page_is_hidden.focus'
		{
			//console.log('unfocused')
			
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