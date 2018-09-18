function updatetoc () {
		console.log('Updating TOC');
		$('.toc').remove();
		A = 0;B = 0;C = 0;D = 0;
		//<h1 class="toc" id="TOC">Table of Contents</h1>
		$('body').append('<div id="toclist" class="toc"><ol class="toc"></ol>')
		//$('#toclist').hide();
		last = "h1";
		$('.text_cell.rendered').each(function (idx) {
			el = $(this).find('.rendered_html').children().first();
			console.log(el.html())
			if (el.is('h4')) {D = D+1;num = A+"."+B+"."+C+"."+D;};
			if (el.is('h3')) {C = C+1;D = 0;num = A+"."+B+"."+C;};
			if (el.is('h2')) {B = B+1;C = 0;D = 0;num = A+"."+B;};
			if (el.is('h1')) {A = A+1;B = 0;C = 0;D = 0;num = A+".";};
			if (el[0].tagName.toLowerCase() == last) {
				$('#toclist').find('ol.toc').last().append('<li><a href="#'+num+'">'+el.html()+'</li>'); 
			} else {
				$('#toclist').find('li').last().append('<ol class="toc">'+'<li><a href="#'+num+'">'+el.html()+'</ol>'); 
			}
			last = el[0].tagName.toLowerCase();
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

// See also 
// https://github.com/ipython-contrib/jupyter_contrib_nbextensions/issues/664
$([IPython.events]).on('execute.CodeCell', updatetoc);
$([IPython.events]).on('create.Cell', updatetoc);
$([IPython.events]).on('delete.Cell', updatetoc);