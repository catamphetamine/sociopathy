(function()
{
	title(text('pages.help.title'))
	
	page.needs_to_load_content = false
	
	page.load = function()
	{
		$('.faq ul li, .todo ul li').each(function()
		{
			question_and_answer = $(this)
			
			var collapsed = true
			
			var question = question_and_answer.find('.question')
			var answer = question_and_answer.find('.answer')
			
			if (!answer.exists())
				return
				
			var answer_container = $('<div/>')
			answer_container.css('overflow', 'hidden')
			answer_container.appendTo(question_and_answer)
			answer.appendTo(answer_container)
			
			answer.move_out_upwards()
			
			question.disableTextSelect()
			question.click(function()
			{
				if (collapsed)
					answer.slide_in_from_top(0)
				else
					answer.slide_out_upwards(0.4)
					
				collapsed = !collapsed
			})
		})
	}
})()