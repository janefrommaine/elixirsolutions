import { readBlockConfig } from '../../scripts/lib-franklin.js';

function loadFormScripts(scriptsToLoad, block) {
  // delay here between each script allows each script to load and parse before we load the next one
  const scriptLoadInterval = setInterval(() => {
    if (scriptsToLoad.length === 0) {
      clearInterval(scriptLoadInterval);
      // once all script are loaded call loadFormstack
      if (typeof window.loadFormstack === 'function') {
        window.loadFormstack();
      }
      return;
    }
    const toLoad = scriptsToLoad.shift();
    const scr = document.createElement('script');
    if (toLoad.src) scr.src = toLoad.src;
    if (toLoad.type) scr.type = toLoad.type;
    if (toLoad.textContent) {
      scr.innerHTML = toLoad.textContent;
    }
    block.appendChild(scr);
  }, 500);
}

function loadForm(formHtml, wrapper, block) {
  const dp = new window.DOMParser();
  const html = dp.parseFromString(formHtml, 'text/html');
  const embed = html.querySelector('.fsEmbed');
  let scriptsToLoad;
  if (embed) {
    wrapper.append(embed);
    // script elements aren't actually processed, so need to remove and re-add
    scriptsToLoad = [...embed.querySelectorAll('script')].map((s) => {
      const { src, type, textContent } = s;
      s.remove();
      return { src, type, textContent };
    });
    loadFormScripts(scriptsToLoad, block);
  }
}

export default function decorate(block) {
  const cfg = readBlockConfig(block);
  const formId = cfg['form-id'];

  const wrapper = document.createElement('div');
  wrapper.classList.add('form-wrapper');
  block.innerHTML = '';
  block.append(wrapper);

  let formHtml = '';
  const docWrite = document.write;
  document.write = (s) => {
    formHtml += s;
  };

  const scriptSrc = `https://elixir-form.formstack.com/forms/js.php/${formId}?no_style_strict=1`;
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.setAttribute('type', 'text/javascript');
  block.append(script);

  setTimeout(() => {
    document.write = docWrite;
    loadForm(formHtml, wrapper, block);
  }, 3000);
}
