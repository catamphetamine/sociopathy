var Клавиши =
{
    Backspace: 8,
    Tab: 9,
    
	Enter: 13,
	Ввод: 13,
	
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
	
	hyphen: 189,
	дефис: 189,
	
    '-': 109,
    '+': 107,
	
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
	
	/*
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
	*/
	
	';': 186,
    '=': 187,
	',': 188,
	'-': 189,
	'.': 190,
	'/': 191,
	'`': 192,
	
	'[': 221,
	']': 223,
	
	/*
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
    */

	disable: function()
	{
		this.disabled = true
	},
	
	enable: function()
	{
		this.disabled = false
	},
	
	on: function(element, keys, action)
	{
		element.on('keydown', function(event)
		{
			if (Клавиши.is(keys, event))
			{
				event.preventDefault()
				action()
			}
		})
	},
	
	has: function(key, code)
	{
		if (typeof code !== 'number')
		{
			code = code.which || code.keyCode
		}
		
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
		var meta = false
		var ctrl = false
		var alt = false
		var shift = false
	
		var keys
		var event
		var code
		
		if (arguments[0] instanceof Array)
		{
			// copy
			keys = arguments[0].map(function(key) { return key })
			var event_or_code = arguments[1]
			
			if (typeof event_or_code === 'number')
				code = event_or_code
			else
				event = event_or_code
		}
		else
		{
			var args = Array.prototype.slice.call(arguments)
			
			var event_or_code = args.pop()
			
			if (typeof event_or_code === 'number')
				code = event_or_code
			else
				event = event_or_code
			
			// copy
			keys = args //.map(function(key) { return key })
		}
		
		if (event)
		{
			if (event.which)
				code = event.which
			else
				code = event.keyCode
		}
		
		//console.log(keys)
		//console.log(event)
			
		if (keys.contains('Command'))
		{
			meta = true
			keys.remove('Command')
		}
		
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
		
		/*
		if (ctrl)
			console.log('ctrl')
		
		if (alt)
			console.log('alt')
				
		if (shift)	
			console.log('shift')
		*/

		//console.log('event.metaKey: ' + event.metaKey + ', ' + 'event.ctrlKey: ' + event.ctrlKey + ', ' + 'event.altKey: ' + event.altKey + ', ' + 'event.shiftKey: ' + event.shiftKey)
		
		if (!event && (meta || ctrl || alt || shift))
			throw 'Event wasn\'t provided for this functionality'
		
		if (meta)
		{
			if (!event.metaKey)
				return false
		}
		else if (event)
		{
			if (event.metaKey)
				return false
		}

		if (ctrl)
		{
			if (!event.ctrlKey)
				return false
		}
		else if (event)
		{
			if (event.ctrlKey)
				return false
		}
		
		if (alt)
		{
			if (!event.altKey)
				return false
		}
		else if (event)
		{
			if (event.altKey)
				return false
		}
				
		if (shift)
		{
			if (!event.shiftKey)
				return false
		}
		else if (event)
		{
			if (event.shiftKey)
				return false
		}
		
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
				
		return this.has(key, code)
		
		/*
		if (!event.charCode)
			if (this[key] && this[key.toUpperCase()])
				key = key.toUpperCase()
		*/
		
		/*
		console.log('pushed: ' + code)
		console.log('expected key: ' + key)
		console.log('this[key]: ' + this[key])
		*/
	},
	
	what: function(event)
	{
		var keys = []
		
		//console.log(code)
		//console.log(event)
			
		if (event.metaKey)
		{
			keys.push('Command')
		}
			
		if (event.ctrlKey)
		{
			keys.push('Ctrl')
		}
			
		if (event.altKey)
		{
			keys.push('Alt')
		}
			
		if (event.shiftKey)
		{
			keys.push('Shift')
		}
		
		var code
		
		if (event.which)
			code = event.which
		else
			code = event.keyCode
		
		var the_key
		
		Object.for_each(this, function(key, value)
		{
			if (value instanceof Array)
			{
				var i = 0
				while (i < value.length)
				{
					if (code === value[i])
						return the_key = key
					i++
				}
			}
			else if (typeof value === 'number')
			{
				if (value === code)
					the_key = key
			}
		})
		
		switch (code)
		{
			case 16:
			case 17:
			case 18:
				return
		}
		
		if (!event.keyCode)
			return
		
		if (!the_key)
			throw 'Key code not recognized: ' + code
		
		keys.push(the_key)
		
		return keys
	},
	
	navigating: function(event)
	{
		if (Клавиши.is('Влево', event) ||
			Клавиши.is('Вправо', event) ||
			Клавиши.is('Вверх', event) ||
			Клавиши.is('Вниз', event) ||
			Клавиши.is('Home', event) ||
			Клавиши.is('End', event) ||
			Клавиши.is('Page_up', event) ||
			Клавиши.is('Page_down', event))
		{
			return true
		}
	},
	
	сочетание: function(keys)
	{
		return keys.map(function(key) { return '«' + key + '»' }).join(', ')
	},
	
	по_порядку: function(keys)
	{
		keys = Array.clone(keys)
		
		var по_порядку = []
		
		var meta_keys = ['Command', 'Ctrl', 'Alt', 'Shift']
		
		meta_keys.forEach(function(meta_key)
		{
			if (keys.contains(meta_key))
			{
				по_порядку.push(meta_key)
				keys.remove(meta_key)
			}
		})
		
		по_порядку.append(keys.sort())
		
		return по_порядку
	},
	
	при_нажатии: {},
	
	по_нажатию: function(действие)
	{
		function generate_id(target)
		{
			var id = Math.random().toString()
			
			if (typeof target[id] === 'undefined')
				return id
			
			return generate_id(target)
		}
		
		var id = generate_id(this.при_нажатии)
		this.при_нажатии[id] = { действие: действие }
		return id
	},
	
	убрать_по_нажатию: function(id)
	{
		delete this.при_нажатии[id]
	},
	
	поймано: function(что, event)
	{
		if (!event)
		{
			event = что
			
			event.preventDefault()
			event.stopImmediatePropagation()
			
			return
		}
		
		if (Клавиши.is(что, event))
		{
			event.preventDefault()
			event.stopImmediatePropagation()
			return true
		}
	}
}

$(document).on('keydown', function(event)
{
	if (Клавиши.disabled)
	{
		event.preventDefault()
		return
	}
	
	Object.for_each(Клавиши.при_нажатии, function(id, при_нажатии)
	{
		//if (Клавиши.is(при_нажатии.сочетание, event))
		при_нажатии.действие(event)
	})
})

// testing:
//
//				if (Клавиши.is('Ctrl', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Alt', 'Shift', 'z', event))
//				if (Клавиши.is('Ctrl', 'z', event))
//				if (Клавиши.is('z', event))
//					alert(1)