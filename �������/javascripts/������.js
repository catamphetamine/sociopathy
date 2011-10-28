var режим

var помощь
var запомнить_помощь
var возстановить_помощь
var переход_в_режим

(function()
{
	var режимы = []
	var editor = new Editor()
	
	$(function()
	{
		перейти_в_режим('обычный')
	})
	
	режимы.push
	({
		название: 'обычный',
		title: 'default',
		перейти: function(из)
		{
	//		if (из)
	//			info('Обычный режим')
		}
	})
	
	режимы.push
	({
		название: 'правка',
		title: 'edit',
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
		title: 'help',
		перейти: function(из)
		{
	//		if (из)
	//			info('Режим помощи')
		}
	})
	
	function перейти_в_режим(mode)
	{
		if (mode === 'правка' && !пользователь)
		{
			info('Вы не можете сейчас ничего править, так как вы не вошли в нашу сеть. Если вы являетесь членом нашей сети, <a href=\'#войти\'  class=\'enter\'>войдите</a>. Если же вы не являетесь членом нашей сети, вы можете попробовать <a href=\'http://localhost:8081/прописка\'>прописаться</a>.')
			return
		}
			
		if (режим === mode)
			return
					
		if (режим === 'правка')
		{
			if ($.browser.mozilla)
				editor.deselect()
	
			$('[editable=true]').removeAttr('contenteditable')
		}
		
		if (режим)
			$('[mode=' + режим + ']').each(function()
			{
				if (this.tagName.toLowerCase() !== 'body')
					$(this).hide()
			})
			
		$('[mode=' + mode + ']').each(function(element)
			{
				if (this.tagName.toLowerCase() !== 'body')
					$(this).show()
			})
			
		var описание_режима = найти_описание_режима(mode)
		описание_режима.перейти(режим)
		
		$(document).trigger('режим.переход', [режим, mode])
		$(document).trigger('режим.' + mode)
	
		режим = mode
		$('body').attr('mode', описание_режима.название)
	}
	
	function найти_описание_режима(название)
	{
		var найденное
		
		режимы.forEach(function(описание_режима)
		{
			if (описание_режима.название ===  название)
				найденное = описание_режима
		})
		
		return найденное
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
	
	переход_в_режим = function(в_какой, из_какого, действие)
	{
		if ($.isFunction(в_какой))
		{
			действие = в_какой
			в_какой = null
			из_какого = null
		}
		else if ($.isFunction(из_какого))
		{
			действие = из_какого
			из_какого = null
		}
		
		$(document).bind('режим.переход', function(event, из, в)
		{
			if (в_какой)
				if (в_какой !== в)
					return
					
			if (из_какого)
				if (из_какого !== из)
					return
					
			действие(в, из)
		})
	}
	
	var подсказка
	
	переход_в_режим('помощь', function()
	{
		if (подсказка)
			info(подсказка)
	})
	
	помощь = function(сообщение)
	{
		if (режим === 'помощь')
			if (сообщение)
				info(сообщение)

		var предыдущая_подсказка = подсказка
		подсказка = сообщение
		return предыдущая_подсказка
	}
	
	var запомненная_помощь = {}
	запомнить_помощь = function(название)
	{
		запомненная_помощь[название] = подсказка
	}
	
	возстановить_помощь = function(название)
	{
		return запомненная_помощь[название]
	}
})()