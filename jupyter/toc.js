function updatetoc () {
        console.log('Updating TOC');
        $('.toc').remove();
        //$.ajax({'url': "https://rawgit.com/rweigel/js-rsw/master/jupyter/toc.js"});
        $('h1').first().before('<h1 class="toc" id="TOC">Table of Contents</h1><ol class="toc" id="toclist"></ol>');
        $('h1').each(function( index ) { if (index > 0) {$('#toclist').append('<li><a href="#'+$(this).attr('id')+'">'+$(this).html()+'</li>'); $(this).html("<span class='toc'>" + index + ". </span>" + $(this).html()); }});
        $('#toclist').click();
        $('#toclist').clone().attr('id','toclist2').prependTo('#site').css('position','fixed').css('padding-left','1.5em').addClass('toc').css('z-index',1)
        $('#notebook-container').css('margin-right','1em');
}
window.updatetoc = updatetoc;
updatetoc(); // First run

// See also 
// https://github.com/ipython-contrib/jupyter_contrib_nbextensions/issues/664
$([IPython.events]).on('execute.CodeCell', updatetoc);
$([IPython.events]).on('create.Cell', updatetoc);
$([IPython.events]).on('delete.Cell', updatetoc);