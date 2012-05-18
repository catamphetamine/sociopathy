(function()
{
	title('Дневник. ' + page.data.адресное_имя)
	
	var blog
	
	Подсказки.подсказка('Здесь вы можете почитать дневник этого человека.')
	
	page.load = function()
	{
		blog = $('#blog')
	
		new Data_templater
		({
			template_url: '/страницы/кусочки/записи дневника.html',
			container: blog,
			conditional: $('.main_conditional'),
			done: blog_loaded
		},
		new  Data_loader
		({
			url: '/приложение/дневник',
			parameters: { адресное_имя: page.data.адресное_имя },
			get_data: function (data) { page.data.дневник = data; return data }
		}))
	}
	
	function blog_loaded()
	{
	}
})()