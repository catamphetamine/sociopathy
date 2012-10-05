var Message = 
{
	appearance_duration: 0.5,
	awareness_enter_time: 0.5,
	thinking_time: 0.5,
	length_factor: 0.10,
	awareness_leave_time: 0.5,
	disappearance_duration: 0.9,
	
	z_index: 0,
	
	update_z_index: function($element)
	{
		this.z_index = get_highest_z_index(this.z_index)
		$element.css('z-index', this.z_index)
	},

	bubble_after: function($element)
	{
	//alert('bubble scheduled')
	//alert(Message.state_machine.states.map(function (element) { return element.state }).join(', '))
		Message.state_machine.transit_to('bubble', (function()
		{
			var free_space = $element.height()
			var messages = $element.nextAll('.message_container')
			
			if (messages.length === 0)
			{
				$element.remove()
				Message.state_machine.next()
				return
			}
			
			messages.each(function()
			{
				element = $(this)
				
				var top = parseInt(element.css('top'))
				if (isNaN(top))
					top = 0
				
				element.animate({top: top - free_space}, 1000, 'easeInOutQuad')
			})
			
			$element.remove()
			setTimeout(function() { Message.state_machine.next() }, 1000)
			
			/*
			$element.css('opacity', 0)
			$element.animate({ marginBottom: -free_space }, 1000, 'easeInOutQuad', function()
			{
				$element.remove()
				Message.state_machine.next()
			})
			*/
		})
		.bind(this))
	},
	
	calculate_occupied_space: function()
	{
		var occupied_space = 0
		
		$('body > .message_container').each(function()
		{
			occupied_space += $(this).outerHeight(true)
		})
		
		return occupied_space
	},
	
	vanisher: 
	{
		messages: [],
		
		schedule: function($element)
		{			
			this.messages.push($element)
			this.check()
		},
		
		remove: function($element)
		{
			this.messages.remove($element)
			this.check()
		},
		
		check: function()
		{
			if (this.messages.length === 0)
				return

			//Message.state_machine.transit_to('vanishing', (function()
			//{
				this.vanish(this.messages[0])
			//})
			//.bind(this))
		},
	
		vanish: function($element)
		{
			if ($element.css('display') === 'none')
			{
				this.remove($element)
				return
			}
			
			var disappearance_duration = $element.data('dissapearance_duration') || Message.disappearance_duration
				
			var self = this
			animator.fade_out($element, 
			{
				duration: disappearance_duration, 
				callback: function() 
				{
					$element.hide()
					Message.bubble_after($element)
					self.remove($element)
					
					//Message.state_machine.next()
				} 
			})
		},
	},
	
	state_machine:
	{
		states: [],
		
		transit_to: function(state, action)
		{
			this.states.push({ state: state, action: action })
				
			if (this.states.length === 1)
			{
				this.states.unshift({ state: 'dummy', action: function() {} })
				this.next()
			}
		},
		
		next: function()
		{
			this.states.shift()
			
			if (this.states.length === 0)
				return
			
			var state = this.states[0]
			//alert(state.state)
			state.action()
		}
	},
	
	message: function(type, text, options)
	{
		Message.state_machine.transit_to('show', (function() 
		{ 
			Message.add_message(type, text, options)
		}))
	},
	
	add_message: function(type, text, options)
	{
		if (!text)
			text = ''
			
		text = text + ''
	
		options = options || {}
	
		var top = this.calculate_occupied_space()
		
		var message_container = $('<div class="message_container"/>')
		this.update_z_index(message_container)
	
		var self = this

		var show_time = this.thinking_time * (1 + text.length * this.length_factor)
		if (options.время)
			show_time = options.время
			
		var duration = this.awareness_enter_time + show_time + this.awareness_leave_time
		
		text = new String(text).beautify()
			.split('. ').join('.<br/>')
			.split(' \n ').join('<br/>')
			.split(' \n').join('<br/>')
			.split('\n ').join('<br/>')
			.split('\n').join('<br/>')
		
		var message_itself = $('<div class="popup_panel"/>').html(text)
		
		var message = $('<div class="popup_panel_container"/>')
		message.addClass('popup_message')
		message.addClass(type)
		
		if (options.postprocess)
			options.postprocess.bind(message_itself)(message)
			
		if (options.ajaxify)
			ajaxify_internal_links(message_itself)
			
		message.append(message_itself)

		var closing = false
		message.on('contextmenu', function(event)
		{
			event.preventDefault()
			
			if (closing)
				return
			closing = true
			
			message_container.data('dissapearance_duration', 0.25)
			Message.vanisher.schedule(message_container)
		})
		
		//var message = $('<div class="' + type + '"/>').html(text)
		
		//var close_button = $('<span></span>')
		//close_button.addClass('close')
		//close_button.prependTo(message_itself)
		
		message_container.append(message).appendTo('body')
		message_container.css('top', top)

		var opacity = message.css('opacity')
		message.css('opacity', 0)

		/*
		var messages_container = $('body > .messages_container')
		if (!messages_container.exists())
		{
			messages_container = $('<div/>').addClass('messages_container')
			messages_container.appendTo('body')
		}
		
		message_container.appendTo(messages_container)
		*/
		
		/*
		new image_button(close_button).does(function()
		{
			message_container.data('dissapearance_duration', 0.25)
			Message.vanisher.schedule(message_container)
		})
		*/
		
		animator.fade_in(message, 
		{ 
			duration: this.appearance_duration, 
			maximum_opacity: opacity,
			callback: function()
			{
				if (options.sticky)
					return
				
				(function() 
				{
					Message.vanisher.schedule(message_container)
				})
				.delay(duration * 1000)
			}
		})

		Message.state_machine.next()
	},
	
	info: function(text, options)
	{
		this.message('info', text, options)
	},
	
	error: function(text, options)
	{
		this.message('error', text, options)
	},
	
	warning: function(text, options)
	{
		this.message('warning', text, options)
	}
}

function show(text, options) { Message.info(text, options) }
function info(text, options) { Message.info(text, options) }
function warning(text, options) { Message.warning(text, options) }
function error(text, options) { Message.error(text, options) }

// testing
/*
$(document).on('page_loaded', function()
{
	setTimeout(function()
	{
		Message.info('долгое уведомление', { время: 300 })
		Message.info('уведомление')
		Message.info('ещё уведомление')
	
		setTimeout(function() { Message.error('ошибка') }, 2000)
		setTimeout(function() { Message.warning('предупреждение') }, 4000)
	
		setTimeout(function() { Message.warning('не добавится во время анимации') }, 7000)
	},
	1000)
})
*/