// markup https://www.w3.org/blog/2023/introducing-web-sustainability-guidelines/
import ffetch from '../../scripts/ffetch.js';
import {
  decorateIcons,
  getMetadata,
} from '../../scripts/lib-franklin.js';
import {
  getBlogLongDateFormat,
  getTimeElementFormat,
  getMetadataDate,
} from '../../scripts/date.js';
import { createElement } from '../../scripts/scripts.js';

let blogAuthorsCache;

async function buildBylineIcon(block) {
  const icon = createElement('span', ['icon', 'icon-document-approval']);
  block.insertAdjacentElement('beforeend', icon);
  await decorateIcons(block);
}

function buildBylinePublishDate(block, publishDate) {
  const longDateFormat = getBlogLongDateFormat(publishDate);
  const dashedDateFormat = getTimeElementFormat(publishDate);

  const timeEl = createElement('time', null, {
    datetime: dashedDateFormat,
  }, longDateFormat);

  const dtEl = createElement('dt', 'blog-byline-date', null, 'Published: ');
  block.append(dtEl);

  const ddEl = createElement('dd', 'blog-byline-date');
  ddEl.append(timeEl);
  block.append(ddEl);
}

async function loadBlogAuthorCache() {
  blogAuthorsCache = ffetch('/blog/blog-authors.json')
    .chunks(1000)
    .all();
}

function buildBylineAuthorDefault(block) {
  const dtEl = createElement('dt', 'blog-byline-author', null, 'By: ');
  block.append(dtEl);
  const ddEl = createElement('dd', 'blog-byline-author');
  ddEl.append('Elixir');
  block.append(ddEl);
}

function buildBylineAuthor(block, authorIds, lookupData) {
  const authorIdList = authorIds.replaceAll(' ', '').split(',');
  const grpAuthors = lookupData
    .filter((p) => authorIdList.includes(p.personId));

  if (grpAuthors.length > 0) {
    const dtEl = createElement('dt', 'blog-byline-author', null, 'By: ');
    block.append(dtEl);

    grpAuthors.forEach((author) => {
      const ddEl = createElement('dd', 'blog-byline-author');
      if (author.url !== 'N/A') {
        const linkEl = createElement('a', null, { href: author.url }, author.displayName);
        ddEl.append(linkEl);
      } else {
        ddEl.append(`${author.displayName}`);
      }

      block.append(ddEl);
    });
  } else {
    buildBylineAuthorDefault(block);
  }
}

function buildBylineReviewer(block, rewiewerIds, lookupData) {
  const reviewerIdList = rewiewerIds.replaceAll(' ', '').split(',');
  const grpReviewers = lookupData
    .filter((p) => reviewerIdList.includes(p.personId));

  if (grpReviewers.length > 0) {
    const dtEl = createElement('dt', 'blog-byline-clinician', null, 'Clinically reviewed by: ');
    block.append(dtEl);

    grpReviewers.forEach((reviewer) => {
      const ddEl = createElement('dd', 'blog-byline-clinician');
      if (reviewer.url !== 'N/A') {
        const linkEl = createElement('a', null, { href: reviewer.url }, reviewer.displayName);
        ddEl.append(linkEl);
      } else {
        ddEl.append(`${reviewer.displayName}`);
      }

      block.append(ddEl);
    });
  }
}

export default async function decorate(block) {
  const metaDateStr = getMetadata('publication-date');
  const publishDate = getMetadataDate(metaDateStr);

  const author = getMetadata('author');
  const reviewer = getMetadata('reviewer');

  if (!publishDate && !author && !reviewer) return;

  const h2El = createElement('h2', 'sr-only', null, 'Author(s) and publish date');
  block.append(h2El);

  const byline = createElement('div', 'blog-byline-meta');

  buildBylineIcon(byline);

  const dlEl = createElement('dl');
  byline.append(dlEl);

  buildBylinePublishDate(dlEl, publishDate);

  let lookupData;
  if (author || reviewer) {
    loadBlogAuthorCache();
    lookupData = await blogAuthorsCache;
  }

  if (author) {
    buildBylineAuthor(dlEl, author, lookupData);
  } else {
    buildBylineAuthorDefault(dlEl);
  }

  if (reviewer) {
    buildBylineReviewer(dlEl, reviewer, lookupData);
  }

  block.append(byline);
}
