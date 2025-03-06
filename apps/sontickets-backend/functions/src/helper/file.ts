import * as fs from 'fs';
const fsReadFileHtml = (path = ''): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, htmlString) => {
      if (!error && htmlString) {
        resolve(htmlString);
      } else {
        reject(error);
      }
    });
  });
};

export { fsReadFileHtml };
