$ (function () {

  var borderRadius = 4
  
  var the_player
    
  var formatTime = function (seconds) {
    
    var sec = Math.round (seconds) % 60
    var min = ((Math.round (seconds) - sec) % 3600) / 60
    var heu = (Math.round (seconds) - sec - (min * 60)) / 3600
    
    if (sec < 10) sec = '0' + sec
    if (heu && (min < 10)) min = '0' + min
    
    return (heu? (heu + ':') : '') + min + ':' + sec
    
  }
  
  var updateTimeDisplay = function (playerContainer, playedTime) {
    
    var playtimetext = '', totaltimetext = ''
    
    if (playedTime >= 0) {
      playtimetext = formatTime (playedTime)
    }

    if (playerContainer.data ('totalTime') > 0) {
      if (playerContainer.data ('isExactTotalTime')) {
        totaltimetext = formatTime (playerContainer.data ('totalTime'))
      } else {
        var min = playerContainer.data ('totalTime') / 60
        var d = (Math.log (min) / Math.log (10))
        min = Math.round (Math.pow (10, Math.round (d*10)/10))
        totaltimetext = '~ ' + formatTime (min * 60)
      }
    }

    playerContainer.find ('.jouele-play-time').text (playtimetext)
    playerContainer.find ('.jouele-total-time').text (totaltimetext)
    
  }
  
  var updateLoadBar = function (playerContainer, seekPercent) {
        
    var maxWidth = playerContainer.find ('.jouele-progress-area').width ()
    var minWidth = borderRadius*2
    var pixels = Math.floor (Math.min (100, seekPercent) / 100 * (maxWidth - minWidth)) + minWidth

    playerContainer.find ('.jouele-load-bar').css ('width', pixels + 'px')
    
  }
  

  var updatePlayBar = function (playerContainer, pixels) {

    playerContainer.find ('.jouele-play-lift').css ('left', pixels  + 'px')//- borderRadius
    playerContainer.find ('.jouele-play-bar').css ('width', pixels + borderRadius + 'px')

  }

  var willSeekTo = function (playerContainer, playerObject, tryPixels) {
    
    //tryPixels += (borderRadius);
    
    var maxWidth = playerContainer.find ('.jouele-progress-area').width ()
    var minWidth = borderRadius*2
    var loadWidth = playerContainer.find ('.jouele-load-bar').width ()
    var pixels = Math.min (Math.max (tryPixels, borderRadius), loadWidth - borderRadius)
    var playhead = (pixels-borderRadius)/(maxWidth-minWidth)
    var playheadSeekable = (pixels-borderRadius)/(loadWidth-minWidth)
    
    if ((maxWidth == 0) || (loadWidth == 0)) playheadSeekable = playhead = 0
    
    playerContainer.find ('.jouele-buffering').stop ().fadeTo (1, 1)

    updatePlayBar (playerContainer, pixels)
    updateTimeDisplay (playerContainer, playerContainer.data ('totalTime') * playhead)
    
    $ (playerObject).data ('wantSeekToTime', playerContainer.data ('totalTime') * playhead)
    
    $ (playerObject).jPlayer ('play')
    $ (playerObject).jPlayer ('playHead', playheadSeekable*100)
    
    return false
    
  }
  
  $.fn.jouele = function()
  {
	if (!this.is('a'))
		return this.find('> a').jouele()
	
    var $aHref = this
    
    var thisName = $aHref.text ()
    
    var thisID = 'jouele-ui-zone-' + (1000 + Math.round (Math.random ()*8999))
    
	var $container = $ ('<div class="jouele" id="' + thisID + '"></div>')
  
    $jdiv = this.after ($container)

    var thisSelector = '#' + thisID

    $container.append (
      $ ('<div class="jouele-invisible-object"></div>'),
      $ ('<div class="jouele-info-area"></div>'),
      $ ('<div class="jouele-progress-area"></div>')
    )
    
    // progress area
    $container.find ('.jouele-progress-area').append (
      $ ('<div class="jouele-mine"></div>')
    )
    $container.find ('.jouele-mine').append (
      $ ('<div class="jouele-mine-bar"></div>'),
      $ ('<div class="jouele-load-bar jouele-hidden" style="display: none"></div>'),
      $ ('<div class="jouele-play-bar"></div>'),
      $ ('<div class="jouele-play-lift jouele-hidden" style="display: none">')
    )
    $container.find ('.jouele-play-lift').append (
      $ ('<div class="jouele-buffering" style="display: none"></div>')
    )
   
    // info area
    $container.find ('.jouele-info-area').append (
      $ ('<a class="jouele-download jouele-hidden" style="display: none"></a>'),
      $ ('<div class="jouele-play-control"></div>'),
      $ ('<div class="jouele-time"></div>'),
      $ ('<div class="jouele-name">' + thisName + '</div>')
    )
    
    $container.find ('.jouele-time').append (
      $ ('<div class="jouele-play-time"></div>'),
      $ ('<div class="jouele-total-time"></div>')
    )
    
    $container.find ('.jouele-play-control').append (
      $ ('<div class="jouele-unavailable jouele-to-hide"></div>'),
      $ ('<div class="jouele-play-pause jouele-hidden" style="display: none"></div>')
    )
    $container.find ('.jouele-play-pause').append (
      $ ('<div class="jouele-play"></div>'),
      $ ('<div class="jouele-pause" style="display: none"></div>')
    )
    
    $aHref.remove ()
    
    filename = 'jouele.js'
    var $exists = $ ('script').filter (function () {
      return this.src.indexOf (filename) != -1
    }).eq (0)

	var swfPath
	
    if ($exists.size ()) {
      swfPath = ($exists.attr ('src').slice (0, -1 - filename.length)) + '/jplayer.swf'
    }
	
    if (swfPathA = $aHref.attr ('data-swfSource')) swfPath = swfPathA
    
    the_player = $container.find ('.jouele-invisible-object').jPlayer ({
      
      swfPath: swfPath,
      preload: 'metadata',
      volume: 100,
      
      cssSelectorAncestor: thisSelector,
      cssSelector: {
        play: '.jouele-play',
        pause: '.jouele-pause',
      },
      
      solution: 'html,flash',
      supplied: 'mp3',
      
      errorAlerts: false,
      
      ready: function (event) {
        var me = this
        var isMouseDown = false

        $container.find ('.jouele-download').attr (
          'href',
          $aHref.attr ('href')
        )

        $ ('.jouele .jouele-hidden').show ()
        $ ('.jouele .jouele-to-hide').hide ()
        
        $ (this).jPlayer ("setMedia", {
          mp3: $aHref.attr ('href'),
        })
        
        $container.find ('.jouele-mine').mousedown (function (e) {
          isMouseDown = true;
          e.stopPropagation ()
          e.preventDefault ()
          return willSeekTo ($container, me, e.pageX - $container.find ('.jouele-mine').offset ().left)
        })
        
        $ (document.body).mouseup (function () { isMouseDown = false })
        
        $ (document.body).mousemove (function (e) {
          if (isMouseDown) {
            e.stopPropagation ()
            e.preventDefault ()
            return willSeekTo ($container, me, e.pageX - $container.find ('.jouele-mine').offset ().left)
          }
        })
        
      },
      
      stop: function (event) {
        $ (this).parent ().removeClass ('jouele-status-playing')
      },
      
      pause: function (event) {
        $ (this).parent ().removeClass ('jouele-status-playing')
      },
      
      play: function (event) { 
        $ ('.jouele-invisible-object').not (this).parent ().removeClass ('jouele-status-playing')
        $ (this).parent ().addClass ('jouele-status-playing')
        $ ('.jouele-invisible-object').not (this).jPlayer ('pause')
        $ (this).data ('isDirty', 1)
      },
      
      progress: function (event) { 
        
        updateLoadBar ($container, event.jPlayer.status.seekPercent)
      
      },
      
      timeupdate: function (event) {
        
        updateLoadBar ($container, event.jPlayer.status.seekPercent)
        
        var maxWidth = $container.find ('.jouele-progress-area').width ()
        var minWidth = borderRadius*2
        var playpx = Math.floor (
          event.jPlayer.status.currentTime / $container.data ('totalTime') * (maxWidth - minWidth)
        ) + borderRadius
        
        if (event.jPlayer.status.seekPercent >= 100) {
          $container.data ('isExactTotalTime', true)
          $container.data ('totalTime', event.jPlayer.status.duration)
        } else if (event.jPlayer.status.seekPercent > 0) {
          $container.data ('totalTime', event.jPlayer.status.duration / event.jPlayer.status.seekPercent * 100)
        } else {
          $container.data ('totalTime', 0)
        }
        
                
        if (
          (! ($ (this).data ('wantSeekToTime') >= 0)) ||
          (event.jPlayer.status.currentTime - $ (this).data ('wantSeekToTime')) >= .33
        ) {
          var curtime = -1
          if ($ (this).data ('isDirty')) curtime = event.jPlayer.status.currentTime
          $container.find ('.jouele-buffering').stop ().fadeTo (333, 0)
          updatePlayBar ($container, playpx)
          updateTimeDisplay ($container, curtime)
          $ (this).data ('wantSeekToTime', -1)
        }
      }	  
    })

		$container.find('.jouele-info-area').click(function()
		{
			// если это был клик для выделения текста - не запускать проигрывание
			var selection = window.getSelection().getRangeAt(0)
			if (!selection.collapsed && Dom.is_descendant_of(selection.commonAncestorContainer, $container.node()))
				return
			
			if (the_player.data().jPlayer.status.paused)
				the_player.jPlayer ('play')
			else
				the_player.jPlayer ('pause')
		})

		$container.find('.jouele-download').click(function(event)
		{
			event.stopPropagation()
			event.preventDefault()
			
			download($(this).attr('href'))
		})

		$container.on('contextmenu', function(event)
		{
			var link = $(this).find('.jouele-download')
			if (link)
			{
				event.stopPropagation()
				event.preventDefault()

				download(link.attr('href'))
			}
		})
	}
})