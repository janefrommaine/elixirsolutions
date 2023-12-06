/**
 * decorates the sidebar
 * @param {Element} block The header block element
 */
export default function decorate(block) {
  const sidebarWrapper = block.parentElement;

  if (sidebarWrapper.dataset && sidebarWrapper.dataset.background) {
    const bgClass = `bg-${sidebarWrapper.dataset.background.replace(' ', '-').toLowerCase()}`;
    sidebarWrapper.classList.add(bgClass);
  }
}
