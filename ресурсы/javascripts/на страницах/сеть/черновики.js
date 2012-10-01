page.query('.drafts', 'drafts')

page.load = function()
{
	main_content = $('.main_content')

	var loader = new Data_loader
	({
		url: '/приложение/сеть/читальня/черновики',
		container: page.drafts,
		before_done: drafts_loaded
	})
	
	new Data_templater
	({
		conditional: initialize_conditional($('.main_conditional'), { immediate: true }),
		template: '/страницы/кусочки/черновик в списке черновиков.html',
		loader: loader
	})
	
	function drafts_loaded()
	{
		
	}
}