/**
 * Bumblebee hover animation for Bumbee.Studio links
 * Spawns animated SVG bees that fly around on hover
 */
(function () {
  var BEE_SVG = '<svg class="bee-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Wings -->' +
    '<ellipse class="bee-wing" cx="24" cy="22" rx="12" ry="7" fill="rgba(200,220,255,0.6)" stroke="rgba(150,180,220,0.4)" stroke-width="0.5"/>' +
    '<ellipse class="bee-wing right" cx="40" cy="22" rx="12" ry="7" fill="rgba(200,220,255,0.6)" stroke="rgba(150,180,220,0.4)" stroke-width="0.5"/>' +
    '<!-- Body -->' +
    '<ellipse cx="32" cy="36" rx="11" ry="14" fill="#F5C518"/>' +
    '<!-- Stripes -->' +
    '<rect x="21" y="30" width="22" height="3.5" rx="1.5" fill="#222"/>' +
    '<rect x="21" y="37" width="22" height="3.5" rx="1.5" fill="#222"/>' +
    '<rect x="23" y="44" width="18" height="3" rx="1.5" fill="#222"/>' +
    '<!-- Head -->' +
    '<circle cx="32" cy="23" r="7" fill="#222"/>' +
    '<!-- Eyes -->' +
    '<circle cx="29" cy="22" r="2" fill="#fff"/>' +
    '<circle cx="35" cy="22" r="2" fill="#fff"/>' +
    '<circle cx="29.5" cy="22.3" r="1" fill="#111"/>' +
    '<circle cx="35.5" cy="22.3" r="1" fill="#111"/>' +
    '<!-- Antennae -->' +
    '<line x1="28" y1="17" x2="23" y2="10" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>' +
    '<circle cx="23" cy="10" r="1.5" fill="#F5A623"/>' +
    '<line x1="36" y1="17" x2="41" y2="10" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>' +
    '<circle cx="41" cy="10" r="1.5" fill="#F5A623"/>' +
    '<!-- Stinger -->' +
    '<polygon points="32,50 30,54 34,54" fill="#333"/>' +
    '<!-- Smile -->' +
    '<path d="M29,25 Q32,28 35,25" fill="none" stroke="#F5A623" stroke-width="1" stroke-linecap="round"/>' +
    '</svg>';

  var TRAIL_SVG = '<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M0,70 C30,65 50,40 80,30 S130,5 160,15 S200,25 210,20"/>' +
    '</svg>';

  function createBee(className) {
    var el = document.createElement('div');
    el.className = 'bee ' + className;
    el.innerHTML = BEE_SVG;
    return el;
  }

  function createHoneyDrop(className) {
    var el = document.createElement('div');
    el.className = 'honey-drop ' + className;
    return el;
  }

  function createTrail() {
    var el = document.createElement('div');
    el.className = 'bee-trail';
    el.innerHTML = TRAIL_SVG;
    return el;
  }

  function spawnBees(zone) {
    // Don't double-spawn
    if (zone.querySelector('.bee')) return;

    // Create bees
    var bee1 = createBee('bee-1');
    var bee2 = createBee('bee-2');
    var bee3 = createBee('bee-3');

    // Create trail
    var trail = createTrail();

    // Create honey drops
    var drop1 = createHoneyDrop('drop-1');
    var drop2 = createHoneyDrop('drop-2');
    var drop3 = createHoneyDrop('drop-3');

    zone.appendChild(trail);
    zone.appendChild(bee1);
    zone.appendChild(bee2);
    zone.appendChild(bee3);
    zone.appendChild(drop1);
    zone.appendChild(drop2);
    zone.appendChild(drop3);

    // After flight animation, switch to settled hover
    setTimeout(function () {
      if (zone.querySelector('.bee-1')) {
        bee1.classList.add('settled');
        bee2.classList.add('settled');
        bee3.classList.add('settled');
      }
    }, 2800);
  }

  function removeBees(zone) {
    var bees = zone.querySelectorAll('.bee');
    bees.forEach(function (bee) {
      bee.classList.remove('settled');
      bee.classList.add('bee-exit');
    });

    // Remove all bee elements after exit animation
    setTimeout(function () {
      var els = zone.querySelectorAll('.bee, .honey-drop, .bee-trail');
      els.forEach(function (el) { el.remove(); });
    }, 600);
  }

  // Find and wrap all Bumbee links/elements
  function init() {
    // Navbar Bumbee link
    var navBumbeeLinks = document.querySelectorAll('.navbar_bumbee-link');
    navBumbeeLinks.forEach(function (link) {
      wrapWithZone(link);
    });

    // Footer links
    var footerLinks = document.querySelectorAll('.footer_link');
    footerLinks.forEach(function (link) {
      if (link.textContent.toLowerCase().indexOf('bumbee') !== -1) {
        wrapWithZone(link);
      }
    });

    // Services title on homepage
    var serviceTitles = document.querySelectorAll('.home-services_title');
    serviceTitles.forEach(function (title) {
      if (title.textContent.toLowerCase().indexOf('bumbee') !== -1) {
        // Wrap the parent item
        var item = title.closest('.home-services_item') || title.parentElement;
        wrapWithZone(item);
      }
    });

    // FAQ items mentioning Bumbee
    var faqItems = document.querySelectorAll('.faq_question');
    faqItems.forEach(function (item) {
      if (item.textContent.toLowerCase().indexOf('bumbee') !== -1) {
        wrapWithZone(item);
      }
    });

    // Any other links mentioning bumbee
    var allLinks = document.querySelectorAll('a');
    allLinks.forEach(function (link) {
      if (link.textContent.toLowerCase().indexOf('bumbee') !== -1 &&
          !link.closest('.bumblebee-zone') &&
          !link.classList.contains('footer_link')) {
        wrapWithZone(link);
      }
    });
  }

  function wrapWithZone(el) {
    // If already wrapped, skip
    if (el.classList.contains('bumblebee-zone') || el.closest('.bumblebee-zone')) return;

    // For inline elements, wrap in a span
    var zone;
    if (el.tagName === 'A' || el.tagName === 'SPAN') {
      zone = document.createElement('span');
      zone.className = 'bumblebee-zone';
      zone.style.position = 'relative';
      zone.style.display = 'inline-block';
      el.parentNode.insertBefore(zone, el);
      zone.appendChild(el);
    } else {
      // For block elements, just add the class
      el.classList.add('bumblebee-zone');
      el.style.position = 'relative';
      zone = el;
    }

    zone.addEventListener('mouseenter', function () { spawnBees(zone); });
    zone.addEventListener('mouseleave', function () { removeBees(zone); });
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
