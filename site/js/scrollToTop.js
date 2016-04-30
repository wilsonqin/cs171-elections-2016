setTimeout(smoothscroll, 750);
function smoothscroll(){
	if ($('.custom-page-content')){
	  $(function(){
	      $('html, body').animate({
	          scrollTop: $('.topOfPage').offset().top
	      }, 2000);
	      return false;
	  });
	}
}
