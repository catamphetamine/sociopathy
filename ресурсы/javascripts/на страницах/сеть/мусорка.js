(function()
{
	Подсказки.подсказка('Это ваша мусорка. Все удалённые вами данные попадают сюда.')
	
	var main_content
	
	page.load = function()
	{
		main_content = $('.main_content')

		new Data_templater
		({
			conditional: initialize_conditional($('.main_conditional'), { immediate: true }),
			template: 'содержимое мусорки',
			container: main_content.find('.trash'),
			before_done: trash_loaded,
			data: 
			({
				url: '/приложение/сеть/мусорка',
				data: 'содержимое',
				each: function() { this.когда_выброшено = new Date(this.когда_выброшено) }
			})
		})
	}
	
	function trash_loaded(содержимое)
	{
		if (содержимое.пусто())
		{
			main_content.find('.empty').show()
		}
		else
		{
			main_content.find('.trash').show()
			main_content.find('.trash').find('th').disableTextSelect()
		}
	}
})()