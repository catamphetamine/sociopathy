var Коды_клавиш =
{
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    HELP: 47,
    H: 72,
    K: 75,
    N: 78,
    R: 82,
    NUMERIC_PLUS: 107,
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
    V: 86
}

$(document).ready(function() 
{
	var easterEgg = 'egg';
	var eggLength = easterEgg.length;
	var keyHistory = '';
	var match;

	$(document).keypress(function(event) 
	{
		// alert(String.fromCharCode(event.which))
		if (event.altKey) {
		}

		if (event.ctrlKey) {
		}

		if (event.shiftKey) {
		}
		
		switch(event.keyCode) { 
			case Коды_клавиш.DOWN: 
				keypresses.push('down'); 
				break; 
			case Коды_клавиш.UP: 
				keypresses.push('up'); 
				break; 
		} 
	});
});