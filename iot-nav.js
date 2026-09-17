(() => {
  const addIoTLink = () => {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-iot-link]')) return;

    const link = document.createElement('a');
    link.href = new URL('iot-session.html', document.baseURI).href;
    link.textContent = 'IoT Session';
    link.dataset.iotLink = 'true';

    const contact = [...nav.querySelectorAll('a')].find(item => {
      const href = item.getAttribute('href') || '';
      return href === '/contact' || href.endsWith('/contact');
    });

    if (contact) nav.insertBefore(link, contact);
    else nav.appendChild(link);
  };

  addIoTLink();

  if (document.body) {
    new MutationObserver(addIoTLink).observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
