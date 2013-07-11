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
	//Показать_навершие: ['Tab'],
	
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
	var keyup_options
	
	// if this === current page
	if (page)
	{
		method = 'on_page'
		
		keyup_options =
		{
			terminate: function()
			{
				if (options.on_release)
					options.on_release()
			}
		}
	}
	
	function mode_check()
	{
		if (options.режим)
			if (!Режим[options.режим + '_ли']())
				return false
			
		return true
	}
	
	var unpressed = true
			
	//console.log('method for ' + hotkey + ': ' + method)
			
	$(document)[method]('keydown', function(event)
	{
		if (Клавиши.is(hotkey, event))
		{
			if (!unpressed)
				return Клавиши.поймано(event)
			
			if (!mode_check())
				return
			
			if (options.check)
				if (!options.check(event))
					return
			
			Клавиши.поймано(event)
			action()
			
			var namespace = $.unique_namespace()
			
			//console.log('Caught: ' + hotkey)
			
			unpressed = false
			
			var unbind = $(document)[method]('keyup.' + namespace, function(event)
			{
				//console.log('on key up: ' + hotkey)
					
				if (!Клавиши.is(hotkey, event))
					return
				
				//console.log('key up: ' + hotkey)
				
				unpressed = true
				
				if (options.on_release)
				{
					if (method === 'on_page')
					{
						unbind()
					}
					else
					{
						$(document).unbind('keyup.' + namespace)
						$.free_namespace(namespace)
					}
					
					if (!mode_check())
						return
					
					Клавиши.поймано(event)
					options.on_release()
				}
			},
			keyup_options)
		}
	})
}
