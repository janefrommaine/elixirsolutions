export default function decorate(block) {
  block.innerHTML = `
    <div class="gear one">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
  </div>
  <div class="gear two">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
  <div class="gear three">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>`;
}
