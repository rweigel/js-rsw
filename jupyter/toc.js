function updatetoc () {
		console.log('Updating TOC');
		$('.toc').remove();
		A = 0;B = 0;C = 0;D = 0;
		//<h1 class="toc" id="TOC">Table of Contents</h1>
		$('body').append('<div id="toclist" class="toc"><ol class="toc" level="h1"></ol>')
		//$('#toclist').hide();
		taglast = "h1";
		$('h1,h2,h3,h4,h5,h6').each(function (idx) {
			el = $(this);
			tag = el[0].tagName.toLowerCase();
			if (el.is('h4')) {D = D+1;num = A+"."+B+"."+C+"."+D;};
			if (el.is('h3')) {C = C+1;D = 0;num = A+"."+B+"."+C;};
			if (el.is('h2')) {B = B+1;C = 0;D = 0;num = A+"."+B;};
			if (el.is('h1')) {A = A+1;B = 0;C = 0;D = 0;num = A+".";};
			if (tag <= taglast) {
				$('#toclist').find("[level='"+tag+"']").last().append('<li><a href="'+el.find('a').attr('href')+'">'+el.html()+'</li>'); 
			} else {
				$('#toclist').find('li').last().append('<ol class="toc" level="'+tag+'"">'+'<li><a href="'+el.find('a').attr('href')+'">'+el.html()+'</ol>'); 
			}
			taglast = tag;
			el.html("<span class='toc'>" + num + " </span>" + el.html()); 
			//console.log(num);
		})

		$('h1').first().before('<h1 class="toc" id="TOC">Table of Contents</h1>');

		// CSS is a mess. Re-do.
		$('#toclist').find('ol')
			.css("list-style-type","decimal")
			
		$('#toclist').css('padding-left','1em')
		$('#toclist').css('margin-top','1em');

		$('#toclist').detach().insertAfter('#TOC');
		
		$('#toclist').click();
		$('#toclist').clone()
					.attr('id','toclist2')
					.prependTo('#site')
					.css('position','fixed')
					.css('padding','0.5em')
					.css('margin-top','15px')
					.css('margin-left','0px')
					.css('overflow','scroll')
					.css('height','100vh')			
					.addClass('toc')

		$('#toclist2').find('ol').css('padding-left','1em');

		$('#toclist2').find('ol').first()
			.css('padding-left','1.5em')
			.css('white-space','nowrap')
			.css('border','1px solid black')
			.css('background-color', $('body').css('background-color'))
			.hover(function () {$('#toclist2').css('z-index',10)}, function () {$('#toclist2').css('z-index','')})
			// Would be better to use $(this) instead of $('#toclist2'), but
			// just changing z-index of ol element does not work.

		$('#notebook-container').css('margin-left','18em');
		$('#ipython-main-app').css('margin-left','15em');

}
updatetoc(); // First run

// See also 
// https://github.com/ipython-contrib/jupyter_contrib_nbextensions/issues/664
window.updatetoc = updatetoc;
$([IPython.events]).on('rendered.MarkdownCell', updatetoc);
$([IPython.events]).on('delete.Cell', updatetoc);

// Change style for all newly created elements
// Save some space by hiding input/output prompt column.
$('<style>.prompt {display: none}</style>').appendTo('head');
$('<style>h1,h2,h3,h4,h5,h6 {margin-top:0;}</style>').appendTo('head');
$('<style>pre {white-space: pre}</style>').appendTo('head');
$('<style>.rendered_html h1:first-child,h2:first-child,h3:first-child,h4:first-child,h5:first-child,h6:first-child {margin-top:0px}</style>').appendTo('head');
$('<style>div.running {border: 1px yellow solid}</style>').appendTo('head');
//$([IPython.events]).on('execute.CodeCell', function () {$('.running').css('border','2px yellow solid');})
//$([IPython.events]).on('finished_execute.CodeCell', function () {$('.code_cell').css('border','');})
