document.getElementById('year').textContent = new Date().getFullYear();

(function () {
  var u = 'jdud.media';
  var d = 'gmail.com';
  var a = u + '@' + d;
  var link = document.getElementById('email-link');
  link.href = 'mailto:' + a;
  document.getElementById('email-text').textContent = a;
})();

function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

function showTab(name) {
  const tabs = ['businesses', 'creators', 'portraits'];
  tabs.forEach(function(t) {
    var panel = document.getElementById('panel-' + t);
    var tab = document.getElementById('tab-' + t);
    var active = t === name;
    panel.classList.toggle('hidden', !active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) {
      tab.classList.remove('border-white/20', 'text-muted');
      tab.classList.add('border-accent', 'bg-accent', 'text-ink');
    } else {
      tab.classList.remove('border-accent', 'bg-accent', 'text-ink');
      tab.classList.add('border-white/20', 'text-muted');
    }
  });
}
