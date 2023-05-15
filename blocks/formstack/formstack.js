import { readBlockConfig } from '../../scripts/lib-franklin.js';

function nodeScriptClone(node) {
  const script = document.createElement('script');
  script.setAttribute('replaced', true);
  script.text = node.innerHTML;

  [...node.attributes].forEach((attr) => {
    script.setAttribute(attr.name, attr.value);
  });

  return script;
}

function nodeScriptReplace(node) {
  if (node.tagName === 'SCRIPT' && !node.hasAttribute('replaced')) {
    node.parentNode.replaceChild(nodeScriptClone(node), node);
    return true;
  }

  for (let i = 0; i < node.childNodes.length; i += 1) {
    const child = node.childNodes[i];
    const replaced = nodeScriptReplace(child);
    if (replaced) {
      return true;
    }
  }

  return false;
}

class FormstackForm extends HTMLElement {
  constructor() {
    super();

    // overwrite doc write to append to the shadow dom
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-wrapper');
    shadow.appendChild(wrapper);

    let formHtml = '';
    const docWrite = document.write;
    document.write = (s) => {
      formHtml += s;
    };

    let htmlLen = 0;
    let prevHtmlLen = -1;
    const interValId = setInterval(() => {
      htmlLen = formHtml.length;
      if (htmlLen > prevHtmlLen) {
        // keep going
        prevHtmlLen = htmlLen;
      } else {
        // write
        clearInterval(interValId);
        document.write = docWrite;
        wrapper.innerHTML = formHtml;

        const scriptIntervalId = setInterval(() => {
          const replaced = nodeScriptReplace(wrapper);
          if (!replaced) {
            clearInterval(scriptIntervalId);
          }
        }, 300);
      }
    }, 250);
    this.renderForm();
  }

  renderForm() {
    const shadow = this.shadowRoot;
    const formId = this.getAttribute('formId');
    if (formId) {
      const scriptSrc = `https://elixir-form.formstack.com/forms/js.php/${formId}?no_style_strict=1`;
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.setAttribute('type', 'text/javascript');
      shadow.appendChild(script);
    }
  }
}
customElements.define('formstack-form', FormstackForm);

export default function decorate(block) {
  const cfg = readBlockConfig(block);
  block.innerHTML = `<formstack-form formId=${cfg['form-id']}></formstack-form>`;
}
