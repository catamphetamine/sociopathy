(function()
{
	Подсказки.подсказка('Это ваша мусорка. Все удалённые вами данные попадают сюда.')
		
	page.load = function()
	{
		panel.buttons.мусорка.element.parent().show()
		panel.buttons.мусорка.tooltip.update_position()
	}
})()