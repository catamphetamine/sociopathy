Configuration = Object.x_over_y(Configuration,
{
  Host: host,
	Port: port,
	Upload_server_port: 8091,
	Websocket_server: function() { return Configuration.Host + ':8080' },
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
		Fade_in: 0.1,
		Fade_out: 0.1
	}
})
