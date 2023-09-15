// Library for formatting dates across blocks

export function getBlogLongDateFormat(date) {
  const formatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleString('en-US', formatOptions);
}

export function getTimeElementFormat(date) {
  return date.toISOString().split('T')[0];
}
