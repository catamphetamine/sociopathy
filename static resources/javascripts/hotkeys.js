var Hotkeys =
{
	Режимы:
	{
		Обычный: ['F1'],
		Правка: ['F2']
	},
	
	Действия:
	{
		Создать: ['Ctrl', 'Alt', 'N'],
		Добавить: ['Ctrl', 'Alt', 'A'],
		Удалить: ['Ctrl', 'Alt', 'Backspace']
	},
	
	Писарь:
	{
		Разрывный_пробел: ['Ctrl', 'Shift', 'Пробел'],
		Показать: ['Пробел']
	},
	
	Вход: ['Ctrl', 'Alt', 'L'],
	
	Показать_действия: ['F3'],
	Консоль: ['F4'],
	Показать_навершие: ['Tab'],
	
	Подсказки: ['Alt', 'Shift', '0']
}

function hotkey(name, options, action)
{
	if (typeof options === 'function')
	{
		action = options
		options = null
	}

	options = options || {}
	
	eval('var hotkey = Настройки.Клавиши.' + name)
	
	var method = 'on'
	
	// if this === current page
	if (this.Data_store)
		method = 'on_page'
	
	function mode_check()
	{
		if (options.режим)
			if (!Режим[options.режим + '_ли']())
				return false
			
		return true
	}
	
	$(document)[method]('keydown', function(event)
	{
		if (Клавиши.is(hotkey, event))
		{
			if (!mode_check())
				return
			
			Клавиши.поймано(event)
			action()
		}
	})
	
	if (options.on_release)
	{
		$(document)[method]('keyup', function(event)
		{
			if (Клавиши.is(hotkey, event))
			{
				if (!mode_check())
					return
				
				Клавиши.поймано(event)
				options.on_release()
			}
		})
	}
}