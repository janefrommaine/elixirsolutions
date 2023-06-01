import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) {
        let fieldVal = payload[fe.dataset.id];
        if (!fieldVal) {
          fieldVal = [];
        } else {
          fieldVal = JSON.parse(fieldVal);
        }
        fieldVal.push(fe.value);
        payload[fe.dataset.id] = JSON.stringify(fieldVal);
      }
    } else if (fe.type === 'radio') {
      if (fe.checked) {
        payload[fe.dataset.id] = fe.value;
      }
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitHubspotForm(form) {
  // todo
}

async function submitForm(form) {
  let payload;
  if (form.dataset.guid && form.dataset.portalId) {
    payload = submitHubspotForm(form);
  } else {
    payload = constructPayload(form);
    const resp = await fetch(form.dataset.action, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: payload }),
    });
    await resp.text();
  }

  if (form.dataset.thankYou) {
    window.location.href = form.dataset.thankYou;
  } else {
    form.innerHTML = `
      <p class="form-text">Thank you for your submisison!</p>
    `;
  }
  return payload;
}

function buildSubmitField(fieldDef) {
  const btn = createElement('button', ['button', 'button-primary'], {
    type: 'submit',
  }, fieldDef.Label);

  btn.addEventListener('click', (evt) => {
    evt.preventDefault();
    const form = btn.closest('form');
    if (form) {
      form.classList.add('was-validated');
    }
    const valid = form.reportValidity();
    if (valid) {
      submitForm(form);
    }
  });

  return btn;
}

function buildSelectField(fieldDef) {
  const formGroup = createElement('div', 'form-group');

  fieldDef.Placeholder = fieldDef.Placeholder || 'Please Select One';
  formGroup.innerHTML = `
  <label for="${fieldDef.Field}">${fieldDef.Label} </label>
  <select class="custom-select" id="${fieldDef.Field}">
    <option selected disabled value="">${fieldDef.Placeholder}</option>
  </select>
  <div class="invalid-feedback">${fieldDef.Placeholder}</div>
  `;

  const select = formGroup.querySelector('select');
  if (fieldDef['Help Text']) {
    const helpId = `form-SelectHelp${fieldDef.idx}`;
    select.setAttribute('aria-describedby', helpId);
    const help = createElement('span', 'form-text', {
      id: helpId,
    }, fieldDef['Help Text']);
    select.insertAdjacentElement('beforebegin', help);
  }

  if (fieldDef.Mandatory) {
    select.setAttribute('required', '');
  } else {
    formGroup.querySelector('label').insertAdjacentHTML('beforeend', '<span>optional</span>');
  }

  const opts = fieldDef.Options.split(', ');
  opts.forEach((o) => {
    const opt = createElement('option', '', { value: o.toLowerCase().replaceAll(' ', '-') }, o);
    select.append(opt);
  });

  return formGroup;
}

function buildCheckboxField(fieldDef) {
  const fieldSet = createElement('fieldset');
  const legend = createElement('legend', '', {}, fieldDef.Label);
  fieldSet.append(legend);
  const formGroup = createElement('div', 'form-group');
  fieldSet.append(formGroup);
  if (fieldDef.Style) formGroup.classList.add(`form-group-${fieldDef.Style}`);

  const opts = fieldDef.Options.split(', ');
  opts.forEach((o, i) => {
    const control = createElement('div', ['custom-control', `custom-${fieldDef.Type}`]);
    control.innerHTML = `
      <input type="${fieldDef.Type}" class="custom-control-input" 
      data-id="${fieldDef.Field}" id="${fieldDef.Field}-${i}"
      ${fieldDef.Mandatory ? 'required' : ''} value="${o}"
      ${fieldDef.Type === 'radio' ? `name=radio-${fieldDef.idx}` : ''}>
      <label class="custom-control-label" for="${fieldDef.Field}-${i}">${o}</label>
    `;

    if (fieldDef.Type === 'checkbox') {
      control.innerHTML += '<div class="invalid-feedback">This checkbox is required</div>';
    }
    if (fieldDef.Type === 'radio' && i === (opts.length - 1)) {
      control.innerHTML += '<div class="invalid-feedback">Please make a selection</div>';
    }
    formGroup.append(control);
  });

  return fieldSet;
}

function buildInputField(fieldDef) {
  const formGroup = createElement('div', 'form-group');

  const inputAttrs = {
    type: fieldDef.Type,
    placeholder: fieldDef.Placeholder,
  };
  let inputTag = 'input';
  if (fieldDef.Type === 'textarea') {
    inputTag = 'textarea';
    inputAttrs.rows = '3';
  }
  inputAttrs.id = `${fieldDef.Field}`;
  if (fieldDef['Help Text']) {
    const helpId = `form-${inputTag}Help${fieldDef.idx}`;
    inputAttrs['aria-describedby'] = helpId;
    const help = createElement('span', 'form-text', {
      id: helpId,
    }, fieldDef['Help Text']);
    formGroup.append(help);
  }
  if (fieldDef.Mandatory) {
    inputAttrs.required = '';
  }
  if (fieldDef.Type === 'currency') {
    inputAttrs.step = '.01';
    inputAttrs.type = 'number';
  }
  const input = createElement(inputTag, 'form-control', inputAttrs);
  formGroup.append(input);

  const labelText = `${fieldDef.Label} ${fieldDef.Mandatory ? '' : '<span>optional</span>'}`;
  const label = createElement('label', '', {
    for: inputAttrs.id,
  }, labelText);
  formGroup.prepend(label);

  formGroup.insertAdjacentHTML('beforeend', `<div class="invalid-feedback">This field is ${fieldDef.Mandatory ? 'required/' : ''}invalid</div>`);

  return formGroup;
}

function buildFormField(fieldDef) {
  fieldDef.Type = fieldDef.Type ? fieldDef.Type.toLowerCase() : 'text';

  if (fieldDef.Type === 'radio' || fieldDef.Type === 'checkbox') {
    return buildCheckboxField(fieldDef);
  }
  if (fieldDef.Type === 'select') {
    return buildSelectField(fieldDef);
  }
  if (fieldDef.Type === 'submit') {
    return buildSubmitField(fieldDef);
  }

  return buildInputField(fieldDef);
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fieldDef, i) => {
    fieldDef.idx = i;
    const formField = buildFormField(fieldDef);
    form.append(formField);
  });
  return form;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  if (cfg.source && cfg.source.endsWith('.json')) {
    const formEl = await createForm(cfg.source);
    block.innerHTML = '';
    block.append(formEl);
    if (cfg['thank-you']) {
      formEl.dataset.thankYou = cfg['thank-you'];
    }

    if (block.classList.contains('hubspot')) {
      formEl.dataset.guid = cfg.guid;
      formEl.dataset.portalId = cfg['portal-id'];
    }

    formEl.querySelectorAll('.form-control').forEach((ctrl) => {
      ctrl.addEventListener('blur', () => {
        const group = ctrl.closest('.form-group');
        if (group) {
          group.classList.add('was-validated');
        }
      });
    });
  }
}
