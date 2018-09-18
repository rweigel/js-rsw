$([IPython.events]).on('notebook_loaded.Notebook', function () {
	$('h1').first().before('<h1 id="TOC">Table of Contents</h1><ol id="toclist"></ol>');
	$('h1').each(function( index ) { if (index > 0) {$('#toclist').append('<li><a href="#'+$(this).attr('id')+'">'+$(this).html()+'</li>'); $(this).html(index + ". " + $(this).html()); }});
	$('#toclist').click();
	$('#toclist').clone().attr('id','toclist2').prependTo('#site').css('position','fixed').css('padding-left','1.5em').css('z-index',1)
	$('#notebook-container').css('margin-right','1em');
	console.log('done')
})