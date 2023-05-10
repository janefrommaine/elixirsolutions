import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

function buildSmallPost(post) {
  const postCard = document.createElement('div');
  postCard.classList.add('blog-post-card', 'blog-post-mini-card');

  postCard.innerHTML = `
    <div class="blog-post-content">
      <a class="post-title" href="${post.path}">${post.title}</a>
      <p class="post-description">${post.description}</p>
    </div>
  `;

  return postCard;
}

function buildPost(post, eager) {
  const postCard = document.createElement('div');
  postCard.classList.add('blog-post-card');

  postCard.innerHTML = `
      <div class="blog-post-image">
        <a href="${post.path}">${createOptimizedPicture(post.image, `Teaser image for ${post.title}`, eager).outerHTML}</a>
      </div>
      <div class="blog-post-content">
        <a class="post-title" href="${post.path}">${post.title}</a>
        <ul class="post-tags">
        </ul>
        <a class="post-description" href="${post.path}">
          <p>${post.description}</p>
          <span>Read More</span>
        </a>
      </div>
    </a>
  `;

  const tagsUl = postCard.querySelector('.post-tags');
  const tags = JSON.parse(post.tags);
  tags.forEach((tag) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="/blog/tag?tag=${encodeURIComponent(tag)}"><span class="icon icon-tag"></span>${tag}</a>`;
    tagsUl.append(li);
  });

  decorateIcons(postCard);
  return postCard;
}

export default async function decorate(block) {
  const small = block.classList.contains('mini');
  const limit = small ? 4 : 10;
  const usp = new URLSearchParams(window.location.search);
  const page = usp.get('page');
  const pageNum = Number(!page ? '0' : page);
  const offset = pageNum * limit;

  const blogPosts = ffetch('/query-index.json')
    .filter((p) => p.path.startsWith('/blog/'))
    .slice(offset, limit);

  const ul = document.createElement('ul');
  ul.classList.add('blog-list');

  let i = 0;
  // eslint-disable-next-line no-restricted-syntax
  for await (const post of blogPosts) {
    const li = document.createElement('li');
    if (small) {
      if (i === 0) {
        const callout = buildPost(post);
        callout.classList.add('blog-post-callout-card');
        block.append(callout);
      } else {
        li.append(buildSmallPost(post));
        ul.append(li);
      }
    } else {
      li.append(buildPost(post, i < 1));
      ul.append(li);
    }

    i += 1;
  }
  block.append(ul);

  if (small) {
    const formWrapper = document.createElement('div');
    // todo add insight form block
    block.append(formWrapper);
  }

  block.classList.add('appear');
}
