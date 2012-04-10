Подсказки.подсказка('Это ваша мусорка. Все удалённые вами данные попадают сюда.')
	
function initialize_page()
{
	panel.buttons.мусорка.element.parent().show()
	panel.buttons.мусорка.tooltip.update_position()
}