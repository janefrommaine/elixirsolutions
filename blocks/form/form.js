import { createElement } from '../../scripts/scripts.js';

function buildSubmitField(fieldDef) {
  const btn = createElement('button', ['button', 'button-primary'], {
    type: 'submit',
  }, fieldDef.Label);

  btn.addEventListener('click', () => {
    const form = btn.closest('form');
    if (form) {
      form.classList.add('was-validated');
    }
  });

  return btn;
}

function buildSelectField(fieldDef) {
  const formGroup = createElement('div', 'form-group');

  fieldDef.Placeholder = fieldDef.Placeholder || 'Please Select One';
  formGroup.innerHTML = `
  <label for="formSelect-select${fieldDef.idx}">${fieldDef.Label} </label>
  <select class="custom-select" id="formSelect-select${fieldDef.idx}">
    <option selected disabled value="">${fieldDef.Placeholder}</option>
  </select>
  <div class="valid-feedback">Valid selection</div>
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
      id="form-${fieldDef.Type}${fieldDef.idx}-${i}" 
      ${fieldDef.Mandatory ? 'required' : ''}
      ${fieldDef.Type === 'radio' ? `name=radio-${fieldDef.idx}` : ''}>
      <label class="custom-control-label" for="form-${fieldDef.Type}${fieldDef.idx}-${i}">${o}</label>
    `;

    if (fieldDef.Type === 'checkbox') {
      control.innerHTML += `<div class="valid-feedback">This field is valid</div>
      <div class="invalid-feedback">This checkbox is required</div>`;
    }
    if (fieldDef.Type === 'radio' && i === (opts.length - 1)) {
      control.innerHTML += `<div class="valid-feedback">This field is valid</div>
      <div class="invalid-feedback">Please make a selection</div>`;
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
  inputAttrs.id = `form-${inputTag}${fieldDef.idx}`;
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

  formGroup.insertAdjacentHTML('beforeend', `<div class="valid-feedback">This field is valid</div>
  <div class="invalid-feedback">This field is invalid</div>`);

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
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    const formEl = await createForm(form.href);
    block.innerHTML = '';
    block.append(formEl);

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
