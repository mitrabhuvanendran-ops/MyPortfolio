(() => {
  const tasksRoot = document.querySelector('#iot-tasks');
  if (!tasksRoot) return;

  const cards = [...tasksRoot.querySelectorAll('.iot-card')];
  if (!cards.length) return;

  const chooser = document.createElement('section');
  chooser.className = 'iot-task-chooser';
  chooser.setAttribute('aria-label', 'Choose an IoT task');
  chooser.innerHTML = '<h2>Explore the four tasks</h2><p>Select a task to view its complete explanation, implementation steps and source code.</p><div class="iot-task-buttons"></div>';
  const buttons = chooser.querySelector('.iot-task-buttons');

  cards.forEach((card, index) => {
    const title = card.querySelector('h2')?.textContent || `Task ${index + 1}`;
    const number = card.querySelector('.eyebrow')?.textContent || `Task ${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'iot-task-button';
    button.innerHTML = `<span>${number}</span><strong>${title}</strong><em>View details →</em>`;
    button.addEventListener('click', () => {
      cards.forEach(item => item.hidden = true);
      buttons.querySelectorAll('button').forEach(item => item.classList.remove('active'));
      card.hidden = false;
      button.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    buttons.appendChild(button);
    card.hidden = true;
  });

  tasksRoot.parentNode.insertBefore(chooser, tasksRoot);
  cards[0].hidden = false;
  buttons.firstElementChild.classList.add('active');
})();
