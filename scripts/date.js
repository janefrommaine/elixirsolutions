// Library for formatting dates across blocks

/*
 * Return date string in format Month day, year
 * Example: Aug 24, 2023
 * @param {date} date
 * @returns {string} formatted date string
*/
export function getBlogLongDateFormat(date) {
  const formatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleString('en-US', formatOptions);
}

/*
 * Return date string in format that html <time> requires
 * <time datetime="yyyy-mm-dd">
 * @param {date} date
 * @returns {string} formatted date string
*/
export function getTimeElementFormat(date) {
  if (!Date.parse(date)) return null;
  return date.toISOString().split('T')[0];
}

/*
 * Dates that are pulled from the word doc source are converted to UTC.
 * The UTC date is 1 day prior to the Word Doc date (EST->PDT) as most authors are from the US
 * Return the UTC date + 1 day to display the date that matches the word document
 * @param {date} utcDate date
 * @returns {date} updated date object
*/
export function updateUTCDateToMatchWordDocDate(utcDate) {
  return utcDate.setDate(utcDate.getDate() + 1);
}

/**
 * Returns UTC Unix date string from mm/dd/yyyy string
 * from the content (word doc, excel, etc)
 * @param {string} shortDateStr date string in mm/dd/yyyy format
 * @returns {string} utc unix date string
 */
export function getUTCUnixDateString(shortDateStr) {
  const [mm, dd, yyyy] = shortDateStr.split(/[^\d]+/);
  return Date.UTC(yyyy, mm - 1, dd);
}

/**
 * Returns UTC date from locale date string (EST -> PDT) with the mm/dd/yyyy format
 * The locale date string is pulled from the source content's metadata (word doc, excel, etc).
 * The purpose of this function is to sync the metadata date with the date generated
 * and indexed from query-index.json (see blog-feed.js post.date - Unix UTC date format)
 * @param {string} metaDateStr date string in mm/dd/yyyy format
 * @returns {date} utc date object
 */
export function getMetadataDate(metaDateStr) {
  const utcUnixDateStr = getUTCUnixDateString(metaDateStr);
  const utcDate = new Date(utcUnixDateStr);
  const test = updateUTCDateToMatchWordDocDate(utcDate);
  return new Date(test);
}
