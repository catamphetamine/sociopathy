var Клавиши =
{
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Pause: 19,
    Escape: 27,
    Space: 32,
    
	Page_up: 33,
    Page_down: 34,
    End: 35,
    Home: 36,
    
	Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
	
	Insert: 45,
	Delete: 46,
	
    Help: 47,
	
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
	
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    K: 75,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    V: 86,
    W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	
    Numeric_plus: 107,
	
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
	
    Plus: 187,
    Minus: 189,
    Dot: 190,

	disable: function()
	{
		this.disabled = true
	},
	
	enable: function()
	{
		this.disabled = false
	},
	
	is: function()
	{
		var ctrl = false
		var alt = false
		var shift = false
	
		var args = Array.prototype.slice.call(arguments)
		var event = args.pop()
		var keys = args.map(function(key) { return key })
		
		if (keys.contains('Ctrl'))
		{
			ctrl = true
			keys.erase('Ctrl')
		}
			
		if (keys.contains('Alt'))
		{
			alt = true
			keys.erase('Alt')
		}
			
		if (keys.contains('Shift'))
		{
			shift = true
			keys.erase('Shift')
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
				
		if (key.length === 1)				
			if (shift)
				key = key.toUpperCase()
			
		var code
		if (event.which)
			code = event.which
		else
			code = event.keyCode
		
		/*
		if (!event.charCode)
			if (this[key] && this[key.toUpperCase()])
				key = key.toUpperCase()
		*/
		
		/*
		if (ctrl)
			console.log('ctrl')
		
		if (alt)
			console.log('alt')
				
		if (shift)	
			console.log('shift')
		*/
		
		/*
		console.log('pushed: ' + code)
		console.log('expected key: ' + key)
		console.log('this[key]: ' + this[key])
		*/
				
		if (code === this[key])
			return true
		else
			return false
	}
}

$(document).on('keypress', function(event)
{
	if (Клавиши.disabled)
		event.preventDefault()
})

// testing:
//
//				if (Клавиши.is('Ctrl', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'z', event))
//				if (Клавиши.is('z', event))
//					alert(1)