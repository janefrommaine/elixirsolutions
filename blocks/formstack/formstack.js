import { readBlockConfig } from '../../scripts/lib-franklin.js';

function nodeScriptClone(node) {
  const script = document.createElement('script');
  script.text = node.innerHTML;

  [...node.attributes].forEach((attr) => {
    script.setAttribute(attr.name, attr.value);
  });

  return script;
}

function nodeScriptReplace(node) {
  if (node.tagName === 'SCRIPT') {
    node.parentNode.replaceChild(nodeScriptClone(node), node);
  } else {
    [...node.childNodes].forEach((child) => {
      nodeScriptReplace(child);
    });
  }

  return node;
}

export default function decorate(block) {
  const docWrite = document.write;
  let innerHtml = '';
  document.write = (s) => {
    innerHtml += s;
  };
  const cfg = readBlockConfig(block);
  const scriptSrc = `https://elixir-form.formstack.com/forms/js.php/${cfg['form-id']}?no_style_strict=1`;
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.setAttribute('type', 'text/javascript');
  block.innerHTML = '';
  block.append(script);

  setTimeout(() => {
    block.innerHTML = innerHtml;
    document.write = docWrite;
    nodeScriptReplace(block);
  }, 5000);
}
