/* Portfolio category filter. The page is fully usable without JavaScript (all items are visible). */
(function () {
  var chips = document.querySelectorAll('.chip');
  if (!chips.length) return;
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.classList.toggle('on', c === chip); });
      document.querySelectorAll('.card[data-cat]').forEach(function (card) {
        card.hidden = !(f === 'all' || card.dataset.cat === f);
      });
      document.querySelectorAll('.year').forEach(function (y) {
        y.hidden = !y.querySelector('.card:not([hidden])');
      });
    });
  });
})();

/* Lecture archive search. Without JavaScript the whole list stays visible. */
(function () {
  var q = document.getElementById('q'), ser = document.getElementById('ser'), chn = document.getElementById('chn');
  if (!q) return;
  var rows = document.querySelectorAll('.lec li'), count = document.getElementById('count');
  function run() {
    var t = q.value.trim().toLowerCase(), n = 0;
    rows.forEach(function (li) {
      var ok = (!t || li.dataset.t.indexOf(t) > -1) && (ser.value === 'all' || li.dataset.s === ser.value) && (chn.value === 'all' || li.dataset.c === chn.value);
      li.hidden = !ok; if (ok) n++;
    });
    document.querySelectorAll('.ly').forEach(function (y) { y.hidden = !y.querySelector('li:not([hidden])'); });
    count.textContent = n.toLocaleString() + '편';
  }
  [q, ser, chn].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
})();
