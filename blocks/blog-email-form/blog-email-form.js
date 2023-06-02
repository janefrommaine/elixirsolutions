import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  if (placeholders.blogForm) {
    const url = new URL(placeholders.blogForm);
    block.innerHTML = '';
    const fragment = await loadFragment(url.pathname);
    if (fragment) {
      const fragmentSectionContainer = fragment.querySelector(':scope .section > .section-container');
      if (fragmentSectionContainer) {
        block.append(...fragmentSectionContainer.childNodes);
      }
    }
  }
}
