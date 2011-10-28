function initialize_page()
{
	$('.faq ul li').each(function()
	{
		question_and_answer = $(this)
		
		var collapsed = true
		
		var question = question_and_answer.find('.question')
		var answer = question_and_answer.find('.answer')
		
		answer.move_out_upwards()
		question.disableTextSelect()
		question.click(function()
		{
			if (collapsed)
				answer.slide_in_from_top()
			else
				answer.slide_out_upwards()
				
			collapsed = !collapsed
		})
	})
}