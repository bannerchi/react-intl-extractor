#!/usr/bin/env node

let cli = require('commander');
let path = require('path');
let iso639 = require('locale-code');
let chalk = require('chalk');
let glob = require('glob');
let fs = require('fs');
let mkdirp = require('mkdirp');
let sorter = require('sort-object');

const textContainerRegex = /\<Formatted(?:HTML)?Message.*id\=\"([^"]+)\".*\/\>/gi;
const idRegex = /id\=\"([^"]+)\"/i;

async function main() {

  cli.requiredOption('-l, --locales <items>', 'Comma-separated list of locales files to output (ex. "en-US,ru-RU"', function (value) {

    let locales = value.split(',');

    if (locales.filter(locale => iso639.validateCountryCode(locale)).length !== locales.length) {
      throw new TypeError(`Some of locales is invalid (cannot pass locale code validation, google "iso-639"), check the input ${value}`);
    }

    return locales;
  });

  cli.requiredOption('-r, --root <path>', 'Project root, where to start searching keys for extraction (relative path or absolute path), default is current folder', process.cwd());

  cli.requiredOption('-e, --extensions <items>', 'Comma-separated list with files extensions to search (ex. js,jsx,ts,tsx)', function (value) {
    return value.split(',');
  }, ['js', 'jsx', 'ts', 'tsx']);

  cli.requiredOption('-f, --format <format>', 'How to save extracted keys, possible values are "json" or "module" (it affects filename, it will be xx-XX.json or xx-XX.js)', 'module');
  cli.requiredOption('-o, --outputDir <path>', 'Where to save output files, relative or absolute path to folder, default is current directory', process.cwd())

  cli.parse(process.argv);

  let files;
  let absolutePath = path.resolve(__dirname, cli.root);
  let pattern = `${absolutePath}/**/*.@(${cli.extensions.join('|')})`;

  console.log(chalk.green('Searching for the files by pattern (glob): ' + pattern));

  try {
    files = glob.sync(pattern, {
      nodir: true,
      ignore: [
        '**/@(node_modules|bower_components)/**'
      ]
    });
  } catch (error) {
    console.error(chalk.red('There is an error happened while reading directories contents, look at it below:\n'));
    throw new Error(chalk.red(error.message));
  }

  console.log(chalk.gray(`Found ${files.length} file(s), processing`));

  let extraction = {};

  try {
    await Promise.all(files.map(async (filepath) => {

      console.log(chalk.gray(`Processing file ${filepath}`));

      let content = await new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (error, data) => {

          if (error) {
            reject(error);
          }

          resolve(data);
        });
      });

      let matches = content.match(textContainerRegex);

      // <FormattedMessage id="test" />
      // <FormattedMessage id="a" />

      if (matches === null) {
        return;
      }

      console.log(chalk.gray(`Found ${matches.length} translation entries in file ${filepath}, processing`));

      matches.forEach(entry => {

        let match = entry.match(idRegex);

        if (match === null) {
          console.error(`Found unexpected translation ${entry}, check the source code, we cannot find attribute "id" (regex is ${idRegex.toString()}), skipped`);
          return;
        }

        let id = match[1];

        extraction[id] = "";

      });

    }));

  } catch (error) {
    console.log(chalk.red(`Could not process file, see the error below:\n`));
    throw new Error(error);
  }

  console.log(chalk.green(`Cool, found ${Object.keys(extraction).length} translation keys in total`));
  console.log(chalk.gray(`Exporting keys (format ${cli.format})`));

  cli.locales.forEach(locale => {

    console.log(chalk.gray(`Processing locale ${locale}`));

    let folder = path.resolve(cli.root, cli.outputDir);

    mkdirp.sync(folder);

    let data;
    let ext;

    switch (cli.format) {

      case 'json':
        ext = 'json';
        break;

      case 'module':
        ext = 'js';
        break;

      default:
        throw new Error(`Unknown output type ${cli.format}`);
    }

    let file = path.resolve(folder, `${locale}.${ext}`);

    if (ext === 'json') {
      try {
        data = require(file);
        console.log(chalk.green(`Found file ${file}, it will be extended`));
      } catch (error) {
        console.log(chalk.gray(`File ${file} does not exists, it will be created`));
      }
    }

    if (data) {
  
      Object.keys(data).forEach(key => {

        if (data[key] !== '') {
          return;
        }

        delete data[key];
      });

      data = { ...extraction, ...data };
    } else {
      data = extraction;
    }

    data = sorter(data);

    console.log(chalk.gray(`Writing the file ${file}`));

    let content;

    switch (cli.format) {

      case 'json':
        content = JSON.stringify(data, null, 2);
        break;

      case 'module':
        content = 'export default ' + JSON.stringify(data, null, 2);
        break;

      default:
        throw new Error(`Unknown output type ${cli.format}`);
    }

    try {
      fs.writeFileSync(file, content, 'utf8');
    } catch (error) {
      console.log(chalk.red(`Cannot write file, see the error below:\n`));
      throw new Error(error);
    }

    console.log(chalk.green(`File ${file} has been written!`));

  });

}

main();
