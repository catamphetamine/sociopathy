var режим = 'обычный'
var режимы = []

режимы.push
({
	название: 'обычный',
	перейти: function()
	{
		info('Обычный режим')
	}
})

режимы.push
({
	название: 'правка',
	перейти: function()
	{
		info('Режим правки')
		
		$('[editable=true]').attr('contenteditable', true)
	}
})

режимы.push
({
	название: 'помощь',
	перейти: function()
	{
		info('Режим помощи')
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
	
	$('[mode=' + режим + ']').hide()
			
	режим = mode
	
	$('[mode=' + режим + ']').show()
		
	режимы.forEach(function(режим)
	{
		if (режим.название ===  mode)
			режим.перейти()
	})
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
				case Клавиши.DIGIT_1:
					перейти_в_режим('обычный')
					break
				case Клавиши.DIGIT_2: 
					перейти_в_режим('правка')
					break
				case Клавиши.DIGIT_3: 
					перейти_в_режим('помощь')
					break
			}
		}
		
		// hz
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
	})
})