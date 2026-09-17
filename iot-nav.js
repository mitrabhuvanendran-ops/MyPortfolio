(() => {
  const addIoTLink = () => {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-iot-link]')) return;
    const link = document.createElement('a');
    link.href = '/iot-session.html';
    link.textContent = 'IoT Session';
    link.dataset.iotLink = 'true';
    nav.appendChild(link);
  };
  addIoTLink();
  new MutationObserver(addIoTLink).observe(document.body, { childList: true, subtree: true });
})();
