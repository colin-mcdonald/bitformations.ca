(function($, win) {
  $.fn.inViewport = function(cb) {
    return this.each(function(i,el){
      function visPx(){
        var H = $(this).height(),
        r = el.getBoundingClientRect(), t=r.top, b=r.bottom;
        return cb.call(el, Math.max(0, t>0? H-t : (b<H?b:H)));  
      } visPx();
      $(win).on("resize scroll", visPx);
    });
  };
}(jQuery, window));

$(function() {
  $(".skillbar").inViewport(function(px){
    if(px) {
     $('.skillbar').each(function(){
      $(this).find('.skillbar-bar').animate({
        width: $(this).attr('data-percent')
      }, 3000)
    });
     $(".skillbar").inViewport(null);
      $(win).on("resize scroll", null);
   }
  });          
});

$("#typed_text").typed({
  strings: [
  "Colin McDonald.^1000", 
  "The owner of \nBitFormations Inc.^1000", 
  "A software development \n professional.^1000", 
  "A proud Torontonian.^1000", 
  "Always interested in \nnew challenges.^1000", 
  "A full-stack web \napplication specialist.^1000", 
  "28 years old.^1000", 
  "A pretty good sys-admin.^1000", 
  "Not a great cook.^1000", 
  "A morning person.^1000", 
  "Ready to help you make \nyour projects a success.^1000", 
  "Hoping to hear from you!^5000",],
  typeSpeed: 10,
  loop:true,
  showCursor: false,
  cursorChar: "",
  backDelay: 250
});
