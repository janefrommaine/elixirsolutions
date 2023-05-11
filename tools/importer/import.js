/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */
const isBlogPost = (params) => {
  const urlAsUrl = new URL(params.originalURL);
  return urlAsUrl.host === 'blog.elixirsolutions.com';
};

const transformBlocks = (main, document) => {
  const sectionBreak = document.createElement('p');
  sectionBreak.innerHTML = '---';

  // blog feed
  const blog = main.querySelector('.blog');
  if (blog) {
    const blogCells = [
      ['Blog Feed'],
    ];
    const blogBlock = WebImporter.DOMUtils.createTable(blogCells, document);
    blog.replaceWith(blogBlock);
  }

  // news feed
  const news = main.querySelector('.news');
  if (news) {
    const newsCells = [
      ['News Feed'],
    ];
    const newsBlock = WebImporter.DOMUtils.createTable(newsCells, document);
    news.replaceWith(newsBlock);
  }

  // hero
  const hero = main.querySelector('.heroimage');
  if (hero) {
    const heroImg = hero.querySelector('.el-hero-image');
    if (heroImg) {
      hero.prepend(heroImg);

      if (hero.classList.contains('cmp-hero-syle_pink-bg')) {
        const metdataCells = [
          ['Section Metadata'],
          ['Style', 'Alternate Hero'],
        ];
        const sectionMetadataBlock = WebImporter.DOMUtils.createTable(metdataCells, document);
        hero.append(sectionMetadataBlock);
      }

      hero.append(sectionBreak.cloneNode(true));
    }
  }

  // teaser
  main.querySelectorAll('.teaser:not(.tile)').forEach((teaser) => {
    if (teaser.classList.contains('cmp-teaser-fullwidthbluebox')) {
      teaser.insertAdjacentElement('beforebegin', sectionBreak.cloneNode('true'));
      teaser.insertAdjacentElement('afterend', sectionBreak.cloneNode('true'));
      const metdataCells = [
        ['Section Metadata'],
        ['Style', 'Highlight'],
      ];
      const sectionMetadataBlock = WebImporter.DOMUtils.createTable(metdataCells, document);
      teaser.insertAdjacentElement('afterend', sectionMetadataBlock);
    }

    const contentCols = [];
    const rowCols = teaser.querySelector('.row-cols');
    if (rowCols) {
      if (rowCols.classList.contains('floatright')) {
        // content first
        contentCols.push(rowCols.querySelector('.col-two-thirds'));
        contentCols.push(rowCols.querySelector('.col-thirds'));
      } else {
        // image first
        contentCols.push(rowCols.querySelector('.col-thirds'));
        contentCols.push(rowCols.querySelector('.col-two-thirds'));
      }

      const columnCells = [
        ['Columns (teaser)'],
        contentCols,
      ];

      const colsBlock = WebImporter.DOMUtils.createTable(columnCells, document);
      teaser.replaceWith(colsBlock);
    }
  });

  // cards
  main.querySelectorAll('.row-cols.icons, .full-width-blue-box .blue-box .row-cols').forEach((cards) => {
    const colContainer = cards.closest('.columncontainer');
    if (colContainer && colContainer.querySelector(':scope > .full-width-blue-box')) {
      colContainer.insertAdjacentElement('beforebegin', sectionBreak.cloneNode('true'));
      colContainer.insertAdjacentElement('afterend', sectionBreak.cloneNode('true'));
      const metdataCells = [
        ['Section Metadata'],
        ['Style', 'Highlight'],
      ];
      const sectionMetadataBlock = WebImporter.DOMUtils.createTable(metdataCells, document);
      colContainer.insertAdjacentElement('afterend', sectionMetadataBlock);
    }

    const cardCells = [
      ['Cards'],
    ];
    cards.querySelectorAll('.teaser').forEach((card) => {
      const cardData = [card.querySelector('img'), [card.querySelector('h5'), card.querySelector('.desc-tile'), card.querySelector('.more')]];
      cardCells.push(cardData);
    });

    const cardsBlock = WebImporter.DOMUtils.createTable(cardCells, document);
    cards.replaceWith(cardsBlock);
  });

  const createAccordion = (elem, headingLevel) => {
    const accContent = document.createElement('div');
    elem.querySelectorAll(':scope > .cmp-accordion__item').forEach((item) => {
      const button = item.querySelector('.cmp-accordion__button');
      const panelId = button.getAttribute('aria-controls');
      const panel = item.querySelector(`#${panelId}`);

      const heading = document.createElement(headingLevel);
      heading.innerHTML = button.querySelector('.accordion').textContent;
      accContent.append(heading);
      accContent.append(panel);
    });
    return accContent;
  };

  const processAccordionPanel = (panel) => {
    panel.querySelectorAll('ul.expand').forEach((acc) => {
      const accContent = createAccordion(acc, 'h3');
      acc.replaceWith(accContent);
    });

    return panel;
  };

  // accordion
  main.querySelectorAll('ul.expand-groups').forEach((acc) => {
    acc.insertAdjacentElement('beforebegin', sectionBreak.cloneNode('true'));
    acc.insertAdjacentElement('afterend', sectionBreak.cloneNode('true'));
    const metdataCells = [
      ['Section Metadata'],
      ['Style', 'Accordion'],
    ];
    const sectionMetadataBlock = WebImporter.DOMUtils.createTable(metdataCells, document);
    acc.insertAdjacentElement('afterend', sectionMetadataBlock);

    const accContent = createAccordion(acc, 'h2');
    acc.replaceWith(processAccordionPanel(accContent));
  });

  main.querySelectorAll('.row-cols').forEach((cols) => {
    let columnVar = '';
    if (cols.querySelector('.col-twenty') && cols.querySelector('.col-eighty')) columnVar = ' (fifths)';
    if (cols.querySelector('.col-two-thirds') && cols.querySelector('.col-thirds')) columnVar = ' (thirds)';
    const columnCells = [
      [`Columns ${columnVar}`],
      [...cols.children],
    ];
    if (cols.classList.contains('floatright')) {
      columnCells[1].reverse();
    }

    const colsBlock = WebImporter.DOMUtils.createTable(columnCells, document);
    cols.replaceWith(colsBlock);
  });

  // fix links
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      a.href = `https://www.elixirsolutions.com${a.href}`;
    }
  });
};

const transformBlogBlocks = (main, document) => {
  const sectionBreak = document.createElement('p');
  sectionBreak.innerHTML = '---';

  // hero
  const hero = main.querySelector('.post-header');
  if (hero) {
    hero.append(sectionBreak.cloneNode(true));
  }
};

const addBlogMetadata = (meta, main, html, document) => {
  const topics = [];
  main.querySelectorAll('.topic-link').forEach((topic) => {
    topics.push(topic.innerHTML);
  });
  meta.Tags = topics.join(', ');

  const dp = new DOMParser();
  const dpDoc = dp.parseFromString(html, 'text/html');
  const postedBy = dpDoc.querySelector('.posted-by--blog');
  if (postedBy) {
    for (let i = 0; i < postedBy.childNodes.length; i += 1) {
      if (postedBy.childNodes[i].nodeType === Node.COMMENT_NODE) {
        const commentText = postedBy.childNodes[i].textContent;
        const dateStr = commentText.replace('<!--', '').replace('-->', '');
        const d = new Date(dateStr);
        console.log(d);
        console.log(dateStr);
        meta['Publication Date'] = `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
      }
    }
  }
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  return meta;
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    const meta = createMetadata(main, document);

    if (isBlogPost(params)) {
      addBlogMetadata(meta, main, html, document);
      WebImporter.DOMUtils.remove(main, [
        '.header-container-wrapper',
        '.footer-container-wrapper',
        '#hubspot-topic_data',
        '.hs_cos_wrapper_type_social_sharing',
        '.widget-type-post_filter',
      ]);

      // create block structures within the dom
      transformBlogBlocks(main, document);
    } else {
      // use helper method to remove header, footer, etc.
      WebImporter.DOMUtils.remove(main, [
        '.header',
        '.footer',
        '.breadcrumb',
      ]);

      // create block structures within the dom
      transformBlocks(main, document);
    }

    const metaBlock = WebImporter.Blocks.getMetadataBlock(document, meta);
    main.append(metaBlock);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const urlAsUrl = new URL(params.originalURL);
    const prefix = urlAsUrl.host === 'blog.elixirsolutions.com' ? '/blog' : '';
    return WebImporter.FileUtils.sanitizePath(prefix + urlAsUrl.pathname.replace(/\.html$/, '').replace(/\/$/, ''));
  },
};
