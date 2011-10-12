var people =
{
	есть_ли_ещё: true,
	index: 1,
	
	batch: function(возврат)
	{
		people.next(8, function(люди)
		{
			возврат(люди)
		})
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
			
		this.get_persons(count, function(persons)
		{
			this.index += persons.length
			callback(persons)
		})
	},
	
	get_person: function(callback)
	{
		get_persons(1, callback)
	},
	
	get_persons: function(count, callback)
	{
		Ajax.get('/приложение/люди', { с: this.index, сколько: count }, 
		{ 
			ошибка: 'Не удалось получить список людей', 
			ok: function(data)
			{
				if (!data['есть ещё?'])
					people.есть_ли_ещё = false
					
				people.index += data.люди.length
				callback(data.люди)
			}
		})
	}
}

var $content
var $id_cards
var id_card_template

function add_id_card(person)
{
	var id_card = $.tmpl('личная карточка', person)
	//id_card.find('.personal_info .name').enableTextSelect()
	//id_card.find('.personal_info .description').enableTextSelect()
	$('<li/>').append(id_card).appendTo($id_cards)
}

function initialize_page()
{
	$content = $('#content')
	$id_cards = $('#id_cards')
	
	$content.disableTextSelect()

	Ajax.get('/лекала/личная карточка.html', 
	{
		cache: false,
		type: 'html',
		ошибка: 'Не удалось загрузить страницу',
		ok: function(template) 
		{
			id_card_template = $.template('личная карточка', template)
			
			people.batch(function(люди)
			{
				люди.forEach(function(man)
				{
					add_id_card(man)
				})
				
				$('#people_loading').remove()
				
				if (people.есть_ли_ещё)
					activate_id_card_loader()
			})			
		}
	})
}

function activate_id_card_loader()
{
	var $loading = $('#more_people_loading')
	var $scroll_detector = $('#scroll_detector')

	var options = { offset: '100%' }
	
	$scroll_detector.waypoint(function(event, direction)
	{
		$scroll_detector.waypoint('remove')
		
		people.batch(function(люди)
		{
			люди.forEach(function(man)
			{
				add_id_card(man)
			})
			
			if (!people.есть_ли_ещё)
			{
				$loading.hide()
				return
			}
						
			$scroll_detector.waypoint(options)
		})
	}, 
	options)
}