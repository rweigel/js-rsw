function updatetoc () {
		console.log('Updating TOC');
		$('.toc').remove();
		A = 0;B = 0;C = 0;D = 0;
		//<h1 class="toc" id="TOC">Table of Contents</h1>
		$('body').append('<div id="toclist" class="toc"><ol class="toc" level="h1"></ol>')
		//$('#toclist').hide();
		taglast = "h1";
		$('.text_cell.rendered').each(function (idx) {
			el = $(this).find('.rendered_html').children().first();
			//console.log(el.html())
			tag = el[0].tagName.toLowerCase();
			if (el.is('h4')) {D = D+1;num = A+"."+B+"."+C+"."+D;};
			if (el.is('h3')) {C = C+1;D = 0;num = A+"."+B+"."+C;};
			if (el.is('h2')) {B = B+1;C = 0;D = 0;num = A+"."+B;};
			if (el.is('h1')) {A = A+1;B = 0;C = 0;D = 0;num = A+".";};
			if (tag <= taglast) {
				$('#toclist').find("[level='"+tag+"']").last().append('<li><a href="'+el.find('a').attr('href')+'">'+el.html()+'</li>'); 
			} else {
				$('#toclist').find('li').last().append('<ol class="toc" level="'+tag+'"">'+'<li><a href="#'+el.find('a').attr('href')+'">'+el.html()+'</ol>'); 
			}
			taglast = tag;
			el.html("<span class='toc'>" + num + " </span>" + el.html()); 
		})
		$('#toclist').find('ol').css("list-style-type","decimal");
		$('#toclist').css('margin-top','1em');
		$('h1').first().before('<h1 class="toc" id="TOC">Table of Contents</h1>');
		$('#toclist').detach().insertAfter('#TOC');
		
		$('#toclist').click();
		$('#toclist').clone()
					.attr('id','toclist2')
					.prependTo('#site')
					.css('position','fixed')
					.css('width','10em')
					.css('margin-left','1em')
					.css('margin-top','1em')
					.addClass('toc')
					.css('z-index',1)
		$('#toclist2').find('ol').first().css('overflow-x','scroll').css('white-space','nowrap');
		$('#toclist2').find('ol').css('padding-left','1.1em');
		$('#notebook-container').css('margin-right','1em');
}
window.updatetoc = updatetoc;
updatetoc(); // First run

$('h1').css('margin-top',0);
$('h2').css('margin-top',0);
$('h3').css('margin-top',0);
$('h4').css('margin-top',0);

// See also 
// https://github.com/ipython-contrib/jupyter_contrib_nbextensions/issues/664
$([IPython.events]).on('rendered.MarkdownCell', updatetoc);
$([IPython.events]).on('delete.Cell', updatetoc);

// Save some space by hiding input/output prompt column.
$('.prompt').hide()
// Change border color of executing cell
$([IPython.events]).on('execute.CodeCell', function () {$('.running').css('border','1px yellow solid');$('.prompt').hide()})
$([IPython.events]).on('finished_execute.CodeCell', function () {$('.code_cell').css('border','');$('.prompt').hide()})