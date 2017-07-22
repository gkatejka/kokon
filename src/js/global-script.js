$(document).ready(function() {

  var $toggleMenu = $('.js-toggle-btn');
  var $navMune = $('.menu-nav');
  var $modal = $('.modal');
  var $body = $('body');
  var $btnModalOpen = $('.js-btn-modal-open');
  var $btnModalClose =$('.js-btn-modal-close')
  var $dateInput = $('.js-form-date');

  // ----
  // Меню
  // ----
  $toggleMenu.click(function() {
    $navMune.toggleClass('menu-nav--open');
  });


  // --------
  // Слайдеры
  // --------
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
      preload: [0,1],
    }
  });


  // ------
  // Селект
  // ------
  $('.select').selectize({
    allowEmptyOption: true,
  });


  // ---------
  // Календарь
  // ---------
  $dateInput.click(function() {
    $(this).attr('type', 'date').datepicker('show');
  });

  $dateInput.datepicker({
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    firstDay: 1,
    dateFormat: 'dd.mm.yy',
  });

  $dateInput.focusout(function() {
    var newDate = $('.js-form-date').val();

    if (newDate.length > 0) {
      $(this).attr('type', 'text').val(dateFinal);
    } else {
      $(this).attr('type', 'text');
    }
  });


  // --------------
  // Модальное окно
  // --------------
  var closeModal = function() {
    $modal.removeClass('modal-open');
    $body.removeClass('overlay');
  }

  $btnModalOpen.click( function(e) {
    e.preventDefault();
    $modal.addClass('modal-open');
    $body.addClass('overlay');
  });

  $body.mouseup(function (e) {
    if ($body.hasClass('overlay') && $modal.has(e.target).length === 0){
      closeModal();
    }
  });

  $btnModalClose.click(closeModal);

});