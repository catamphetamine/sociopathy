var Message = 
{
	appearance_duration: 0.5,
	awareness_enter_time: 1.5,
	thinking_time: 1.5,
	length_factor: 0.2,
	awareness_leave_time: 1.5,
	disappearance_duration: 0.9,
	
	z_index: 0,
	
	update_z_index: function($element)
	{
		this.z_index = get_highest_z_index(this.z_index)
		$element.css('z-index', this.z_index)
	},

	bubble_notifications: function(free_space)
	{
		$('body .message_container').each(function()
		{
			element = $(this)
			
			var top = parseInt(element.css('top'))
			if (isNaN(top))
				top = 0
				
			element.animate({top: top - free_space}, 1000, 'easeInOutQuad')
		})
		
		this.free_space = 0
	},
	
	calculate_occupied_space: function()
	{
		var occupied_space = 0
		
		$('body .message_container').each(function()
		{
			occupied_space += $(this).height()
		})
		
		return occupied_space
	},
	
	message: function(type, text)
	{
		var top = this.calculate_occupied_space()
		
		var message_container = $('<div class="message_container"/>')
		this.update_z_index(message_container)
	
		var self = this

		var duration = this.awareness_enter_time + this.thinking_time * (1 + text.length * this.length_factor) + this.awareness_leave_time
		
		var message = $('<div class="' + type + '"/>').text(text)
		var opacity = message.css('opacity')
		message.css('opacity', 0)
		
		message_container.append(message).appendTo('body')
		message_container.css('top', top)
		
		animator.fade_in(message, 
		{ 
			duration: this.appearance_duration, 
			maximum_opacity: opacity,
			callback: function()
			{
				(function() { animator.fade_out(message, { duration: self.disappearance_duration, callback: function() { var free_space = message_container.height(); message_container.remove(); self.bubble_notifications(free_space); } }) }).delay(duration * 1000)
			}
		})
	},
	
	info: function(text)
	{
		this.message('info', text)
	},
	
	error: function(text)
	{
		this.message('error', text)
	},
	
	warning: function(text)
	{
		this.message('warning', text)
	}
}

/*
$(function()
{
	Message.info('проверка')
	setTimeout(function() { Message.error('проверка 1.5') }, 2000)
	setTimeout(function() { Message.warning('проверка 2') }, 4000)
})
*/