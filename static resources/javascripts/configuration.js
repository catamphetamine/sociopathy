var host = Uri.parse().host
var port = Uri.parse().port

Configuration = Object.x_over_y(Configuration,
{
	Host: host,
	Port: port,
	Websocket_ping_interval: 240,
	User_is_online_for: 8 * 60,
	Book_shelf_size: 6,
	Minimum_book_shelves: 3,
	Video:
	{
		Icon:
		{
			Size:
			{
				Width: 640
			}
		},
		Size:
		{
			Width: 560,
			Height: 315
		}
	},
	Loading_screen:
	{
		Fade_in: 0.0,
		Fade_out: 0.0
	},
	Activity:
	{
		Interval: 5
	},
	Message_date_format: 'dd.MM.yyyy в HH:mm:ss',
	Later_messages_timing:
	{
		A_little_later: 5 * 60,
		Some_time_later: 15 * 60,
		Later: 60 * 60,
		More_later: 6 * 60 * 60,
		Reasonably_later: 24 * 60 * 60
	}
})
