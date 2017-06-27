// Свой код с jQuery

$( document ).ready(function() {

  $('.about__slider').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    centerMode: true,
    variableWidth: true
  });

  $('.about__slider').magnificPopup({
    delegate: 'a',
    type: 'image',
    tLoading: 'Загрузка изображения #%curr%...',
    mainClass: 'mfp-img-mobile',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    }
  });
});