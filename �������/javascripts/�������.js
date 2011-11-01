var Клавиши =
{
    BACKSPACE: 8,
    TAB: 9,
    Enter: 13,
	PAUSE: 19,
    Escape: 27,
	Spacebar: 32,
    
	PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    
	LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
	
    HELP: 47,	
	Digit_0: 48,
	Digit_1: 49,
	Digit_2: 50,
	Digit_3: 51,
	Digit_4: 52,
	Digit_5: 53,
	Digit_6: 54,
	Digit_7: 55,
	Digit_8: 56,
	Digit_9: 57,
	
    H: 72,
    K: 75,
    N: 78,
    R: 82,
    V: 86,
	X: 88,
	Y: 89,
	Z: 90,
	
    NUMERIC_PLUS: 107,
	
	r: 114,
	v: 118,
	w: 119,
	x: 120,
	y: 121,
	z: 122,
	
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
	
    PLUS: 187,
    MINUS: 189,
	
	is: function()
	{
		var ctrl = false
		var alt = false
		var shift = false
	
		var args = Array.prototype.slice.call(arguments)
		var event = args.pop()
		var keys = args.map(function(key) { return key.toLowerCase() })
		
		if (keys.contains('ctrl'))
		{
			ctrl = true
			keys.erase('ctrl')
		}
			
		if (keys.contains('alt'))
		{
			alt = true
			keys.erase('alt')
		}
			
		if (keys.contains('shift'))
		{
			shift = true
			keys.erase('shift')
		}
				
		if (keys.length !== 1)
			throw 'Too much character keys. Only one allowed.'
			
		var key = keys[0]

		if (ctrl)
			if (!event.ctrlKey)
				return false
		
		if (alt)
			if (!event.altKey)
				return false
				
		if (shift)
			if (!event.shiftKey)
				return false

		if (shift)
			key = key.toUpperCase()
			
		if (event.which === this[key])
			return true
		else
			return false
	}
}

//				if (Клавиши.is('Ctrl', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'z', event))
//				if (Клавиши.is('z', event))
//					alert(1)