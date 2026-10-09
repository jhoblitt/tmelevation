// A classic script: it still runs when the module graph cannot load or
// parse, which is the failure app.js cannot report itself.
{
  const root = document.documentElement;
  const started = () => root.dataset.app === 'started';
  const fail = () => {
    root.dataset.state = 'error';
    document.getElementById('load-error').hidden = false;
  };

  // A module of the graph failed to fetch.
  document.getElementById('app-module').addEventListener('error', fail);
  // A module of the graph failed to parse or link.
  window.addEventListener('error', () => {
    if (!started()) {
      fail();
    }
  });
  // Waits for app.js to start, not to finish calibrating: a background tab
  // throttles the page enough that calibration can outlast any deadline.
  setTimeout(() => {
    if (!started()) {
      fail();
    }
  }, 10000);
}
