export default function decorate(block) {
  const topics = document.createElement('div');
  topics.innerHTML = '<p>Topics</p>';
  block.append(topics);
  console.log('here');
}
