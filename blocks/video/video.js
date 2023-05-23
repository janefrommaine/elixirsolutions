/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

export default async function decorate(block) {
  const a = block.querySelector('a');
  if (a) {
    const source = a.href;
    const img = block.querySelector('img');
    block.innerHTML = `
    <video controls poster="${img ? img.src : ''}">
      <source src="${source}" type="video/${source.split('.').pop()}" >
    </video>
    `;
  }
}
