import _ from 'lodash';

export const handleIsInvalidField = (field: string | undefined) =>
  field != undefined ? true : undefined;

export const toCamelCaseSlugify = (str: string) =>
  _.camelCase(
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );

export const findReplaceString = (string: string, find: string, replace: string) => {
  if (/[a-zA-Z\_]+/g.test(string)) {
    return string.replace(new RegExp('{{(?:\\s+)?(' + find + ')(?:\\s+)?}}', 'g'), replace);
  } else {
    throw new Error('Find statement does not match regular expression: /[a-zA-Z_]+/');
  }
};
