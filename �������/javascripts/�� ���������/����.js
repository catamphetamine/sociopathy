var people =
{
	есть_ли_ещё: true,
	index: 1,
	
	batch: function(возврат)
	{
		people.next(8, возврат)
	},
	
	next: function()
	{
		var count = 1
		var callback
		
		switch (arguments.length)
		{
			case 1:
				callback = arguments[0]
				break
			case 2:
				count = arguments[0]
				callback = arguments[1]
				break
			default:
				Message.error('people.next: invalid argument count')
		}
			
		this.get_persons(count, callback)
	},
	
	/*
	get_person: function(callback)
	{
		get_persons(1, callback)
	},
	*/
	
	get_persons: function(count, callback)
	{
		Ajax.get('/приложение/люди', { с: this.index, сколько: count }, 
		{ 
			ошибка: function(ошибка)
			{
				callback(ошибка)
			},
			ok: function(data)
			{
				if (!data['есть ещё?'])
					people.есть_ли_ещё = false
					
				people.index += data.люди.length
				callback(null, data.люди)
			}
		})
	}
}

var $content
var $id_cards

function add_id_card(person)
{
	var id_card = $.tmpl('личная карточка', person)
	$('<li/>').append(id_card).appendTo($id_cards)
	
	//id_card.find('.personal_info .name').enableTextSelect()
	//id_card.find('.personal_info .description').enableTextSelect()
}

function load_people(callback)
{
	people.batch(function(ошибка, люди)
	{
		if (ошибка)
		{
			callback(ошибка)
			return
		}
		
		люди.forEach(function(man)
		{
			add_id_card(man)
		})
		
		callback(null, function()
		{
			if (people.есть_ли_ещё)
				activate_id_card_loader()
		})
	})
}

var conditional
var $scroll_detector

function initialize_page()
{
	Режим.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')

	$(window).scrollTop(0)
	$scroll_detector = $('#scroll_detector')
	
	conditional = initialize_conditional($('[type=conditional]'))
	
	$content = $('#content')
	$id_cards = $('#id_cards')
	
	$content.disableTextSelect()

	Ajax.get('/лекала/личная карточка.html', 
	{
		//cache: false,
		type: 'html',
		error: function()
		{
			conditional.callback('Не удалось загрузить страницу')
		},
		ok: function(template) 
		{
			$.template('личная карточка', template)
			load_people(conditional.callback)
		}
	})
}
	
function activate_id_card_loader()
{
	$scroll_detector.bind('appearing_on_bottom.scroller', function(event)
	{
		deactivate_id_card_loader()
		conditional.loading_more()
		load_people(conditional.callback)
			
		event.stopPropagation()
	})
	
	прокрутчик.watch($scroll_detector, $(window).height() + 1)
}

function deactivate_id_card_loader()
{
	$scroll_detector.unbind('.scroller')
	прокрутчик.unwatch($scroll_detector)
}