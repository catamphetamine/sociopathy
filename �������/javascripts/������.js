var режим
var режимы = []

$(function()
{
	перейти_в_режим('обычный')
})

режимы.push
({
	название: 'обычный',
	перейти: function(из)
	{
//		if (из)
//			info('Обычный режим')
	}
})

режимы.push
({
	название: 'правка',
	перейти: function(из)
	{
//		if (из)
//			info('Режим правки')
		
		$('[editable=true]').attr('contenteditable', true)
	}
})

режимы.push
({
	название: 'помощь',
	перейти: function(из)
	{
//		if (из)
//			info('Режим помощи')
	}
})

function перейти_в_режим(mode)
{
	if (режим === mode)
		return
				
	if (режим === 'правка')
	{
		if ($.browser.mozilla)
			window.getSelection().removeAllRanges()

		$('[editable=true]').removeAttr('contenteditable')
	}
	
	if (режим)
		$('[mode=' + режим + ']').hide()
		
	$('[mode=' + mode + ']').show()
		
	режимы.forEach(function(описание_режима)
	{
		if (описание_режима.название ===  mode)
			описание_режима.перейти(режим)
	})
	
	$(document).trigger('режим.переход', [режим, mode])
	$(document).trigger('режим.' + mode)

	режим = mode
}

$(function()
{
	режимы.forEach(function(описание_режима)
	{
		if (описание_режима.название !==  режим)
			$('[mode=' + описание_режима.название + ']').hide()
	})
})

$(document).ready(function() 
{
	$(document).keydown(function(event) 
	{
		// alert(String.fromCharCode(event.which))
		
		if (event.altKey && !event.ctrlKey && event.shiftKey)
		{
			switch(event.keyCode)
			{ 
				case Клавиши.Digit_1:
					перейти_в_режим('обычный')
					break
				case Клавиши.Digit_2: 
					перейти_в_режим('правка')
					break
				case Клавиши.Digit_3: 
					перейти_в_режим('помощь')
					break
			}
		}
		
		/*
		if (!event.altKey && event.ctrlKey && event.shiftKey)
		{
			switch(event.keyCode)
			{ 
				case Клавиши.Spacebar:
					if (режим === 'правка')
						перейти_в_режим('обычный')
					else if (режим === 'обычный')
						перейти_в_режим('правка')
					break
			}
		}
		*/
	})
})