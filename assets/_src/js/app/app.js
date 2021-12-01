window.$ = require('jquery');
window.jQuery = window.$;
require('jquery-migrate');
require('bootstrap');

// require('../../../_src-uncompiled/vendor/hs-header/dist/hs-header.js');
// require('../../../_src-uncompiled/vendor/hs-mega-menu/dist/hs-mega-menu.min.js');
// console.log('-----A');
// require('../../../_src-uncompiled/vendor/hs-toggle-switch/dist/hs-toggle-switch.js');
// console.log('-----B');

// require('../theme/theme.min.js');
//
// Manager.ready(function() {
//   Manager.log('app.js fired Manager.ready()');
//   var dom = Manager.dom();
//   var currentUrl = window.location.href;
//
//   // Pricing
//   if (currentUrl.includes('/pricing/')) {
//     var pricingToggleEl = dom.select('#pricing-frequency-toggle');
//     // var pricingApprenticePriceEl = dom.select('#pricing-price-apprentice');
//     var pricingPremiumPriceSlashedEl = dom.select('#pricing-price-premium-slashed');
//     var pricingPremiumBtn = dom.select('.pricing-premium-btn');
//     var pricingPremiumAmount = dom.select('.pricing-premium-amount');
//
//
//     pricingToggleEl.on('change', function (event) {
//       // console.log('----evnet',event);
//       var frequency = dom.select(event.target).getValue() ? 'annually' : 'monthly';
//
//       pricingPremiumAmount.each(function (element, i) {
//         if (frequency === 'annually') {
//           element.innerHTML = element.dataset.priceAnnually;
//         } else {
//           element.innerHTML = element.dataset.priceMonthly;
//         }
//       })
//
//       // if (frequency === 'annually') {
//       //   pricingApprenticePriceEl.elements.list[0].innerHTML = pricingApprenticePriceEl.elements.list[0].dataset.priceMonthly;
//       // } else {
//       //   pricingApprenticePriceEl.elements.list[0].innerHTML = pricingApprenticePriceEl.elements.list[0].dataset.priceAnnually;
//       // }
//
//       pricingPremiumBtn.each(function (element, i) {
//         var url = new URL(window.location.href);
//         var planId = element.dataset.planId;
//         if (planId) {
//           var destination = (Manager.properties.meta.environment === 'development' ? 'http://192.168.1.112:4001' : 'https://itwcreativeworks.com') + '/checkout/' + Manager.properties.global.app + '-' + planId;
//           // console.log('---destination', destination);
//           url.pathname = 'checkout';
//           url.searchParams.set('authRequired', true)
//           url.searchParams.set('destination', destination);
//           url.searchParams.set('frequency', frequency)
//           // console.log('---url.toString()', element, url.toString());
//           pricingPremiumBtn.setAttribute('href', url.toString());
//           element.removeAttribute('disabled')
//           element.classList.remove('disabled')
//         }
//       })
//     })
//
//     pricingToggleEl.removeAttribute('disabled')
//
//     var evt = document.createEvent('HTMLEvents');
//     evt.initEvent('change', false, true);
//     pricingToggleEl.elements.list[0].dispatchEvent(evt);
//
//   } else if (currentUrl.includes('/platforms/')) {
//     import('../../../_src-uncompiled/vendor/hs-sticky-block/dist/hs-sticky-block.min.js')
//     .then(function (mod) {
//       var HSStickyBlock = mod.default;
//       $('.js-sticky-block').each(function () {
//         var stickyBlock = new HSStickyBlock($(this)).init();
//       });
//     })
//
//
//   }
//
//
// });
