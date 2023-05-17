import { readBlockConfig } from '../../scripts/lib-franklin.js';

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
    const dp = new window.DOMParser();
    const html = dp.parseFromString(formHtml, 'text/html');
    const embed = html.querySelector('.fsEmbed');
    let scriptsToLoad;
    if (embed) {
      scriptsToLoad = [...embed.querySelectorAll('script')].map((s) => {
        const { src, type, textContent } = s;
        s.remove();
        return { src, type, textContent };
      });
      wrapper.append(embed);
      const scriptLoadInterval = setInterval(() => {
        if (scriptsToLoad.length === 0) {
          clearInterval(scriptLoadInterval);
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
  }, 3000);

  // block.innerHTML = `<formstack-form formId=${formId}></formstack-form>`;
}
