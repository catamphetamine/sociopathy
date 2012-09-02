var Клавиши =
{
    Backspace: 8,
    Tab: 9,
    
	Enter: [13, 10],
	Ввод: [13, 10],
	
    Pause: 19,
    Escape: 27,
	
    Space: 32,
	Пробел: 32,
	' ': 32,
    
	Page_up: 33,
    Page_down: 34,
	
    End: 35,
    Home: 36,
    
	Left: 37,
	Влево: 37,
	
    Up: 38,
    Вверх: 38,
	
    Right: 39,
    Вправо: 39,
	
    Down: 40,
    Вниз: 40,
	
	Insert: 45,
	
	Delete: 46,
	Удалить: 46,
	
    Help: 47,
	
	'0': 48,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'5': 53,
	'6': 54,
	'7': 55,
	'8': 56,
	'9': 57,
	
	A: 65,
	B: 66,
	C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
	I: 73,
	J: 74,
    K: 75,
	L: 76,
	M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
	S: 83,
	T: 84,
	U: 85,
    V: 86,
    W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	
    Numeric_plus: 107,
	
	a: 97,
	b: 98,
	c: 99,
	d: 100,
	e: 101,
	f: 102,
	g: 103,
	h: 104,
	i: 105,
	j: 106,
	k: 107,
	l: 108,
	m: 109,
	n: 110,
	o: 111,
	p: 112,
	q: 113,
	r: 114,
	s: 115,
	t: 116,
	u: 117,
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
	
    '+': 187,
    '-': 189,
	
    '.': 190,

	disable: function()
	{
		this.disabled = true
	},
	
	enable: function()
	{
		this.disabled = false
	},
	
	has: function(key, event)
	{		
		var code
		if (event.which)
			code = event.which
		else
			code = event.keyCode
			
		if (this[key] instanceof Array)
		{
			var i = 0
			while (i < this[key].length)
			{
				if (code === this[key][i])
					return true
				i++
			}
		}
		else if (code === this[key])
			return true
			
		return false
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
			keys.remove('Ctrl')
		}
			
		if (keys.contains('Alt'))
		{
			alt = true
			keys.remove('Alt')
		}
			
		if (keys.contains('Shift'))
		{
			shift = true
			keys.remove('Shift')
		}

		if (ctrl)
			if (!event.ctrlKey)
				return false
		
		if (alt)
			if (!event.altKey)
				return false
				
		if (shift)
			if (!event.shiftKey)
				return false
		
		if (keys.length === 0)
		{
			//alert(event.keyCode)
			return true
		}
			
		if (keys.length !== 1)
			throw 'Too much character keys. Only one allowed.'
		
		var key = keys[0]
			
		if (key.length === 1)				
			if (shift)
				key = key.toUpperCase()
				
		return this.has(key, event)
		
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