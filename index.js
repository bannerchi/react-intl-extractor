#!/usr/bin/env node

let cli = require('commander');
let path = require('path');
let iso639 = require('locale-code');
let chalk = require('chalk');
let glob = require('glob');
let fs = require('fs');
let mkdirp = require('mkdirp');
let sorter = require('sort-object');
let _ = require('lodash');

function initOptions() {

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

  cli.requiredOption('-f, --format <format>', 'How to save extracted keys, possible values are "json" or "module" (it affects filename, it will be xx-XX.json or xx-XX.js)', 'json');
  cli.requiredOption('-o, --outputDir <path>', 'Where to save output files, relative or absolute path to folder, default is current directory', process.cwd());

  cli.parse(process.argv);

}

function getFiles() {

  let files;
  let absolutePath = path.resolve(process.cwd(), cli.root);
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

  return files;
}

function getFileContent(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (error, data) => {

      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
}

function extractTagMessages(content) {

  let extractions = {};

  let matches = content.match(/\<Formatted(?:HTML)?Message.*id\=['"]{1}([^"']+)['"]{1}.*\/\>/gi);

  if (matches === null) {
    return;
  }

  console.log(chalk.gray(`Found ${matches.length} translation entries in file, processing`));

  matches.forEach(entry => {

    let regex = /id\=['"]{1}([^'"]+)['"]{1}/i;
    let match = entry.match(regex);

    if (match === null) {
      console.error(`Found unexpected translation ${entry}, check the source code, we cannot find attribute "id" (regex is ${regex.toString()}), skipped`);
      return;
    }

    let id = match[1];

    extractions[id] = "";

  });

  return extractions;
}

function extractSourceMessages(content) {

  let extractions = {};

  let matches = content.match(/formatMessage\s*\(\s*\{.*id\s*['"]?\:\s*['"]{1}([^'"]+)["']{1}.*\}/gi);

  if (matches === null) {
    return;
  }

  console.log(chalk.gray(`Found ${matches.length} translation entries in file, processing`));

  matches.forEach(entry => {

    let regex = /id\:\s*['"]{1}([^'"]+)['"]{1}/i;
    let match = entry.match(regex);

    if (match === null) {
      console.error(`Found unexpected translation ${entry}, check the source code, we cannot find attribute "id" (regex is ${regex.toString()}), skipped`);
      return;
    }

    let id = match[1];

    extractions[id] = "";

  });

  return extractions;
}

async function extract(files) {

  let extractions = {};

  try {
    await Promise.all(files.map(async (filepath) => {

      console.log(chalk.gray(`Processing file ${filepath}`));

      let content = await getFileContent(filepath);

      addExtractions(extractTagMessages(content));
      addExtractions(extractSourceMessages(content));

    }));

  } catch (error) {
    console.log(chalk.red(`Could not process file, see the error below:\n`));
    throw new Error(error);
  }

  return extractions;

  function addExtractions(model) {
    extractions = Object.assign(extractions, model);
  }

}

function getLocaleFilePath(locale) {

  let folder = path.resolve(cli.root, cli.outputDir);

  mkdirp.sync(folder);

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

  return path.resolve(folder, `${locale}.${ext}`);
}

function loadLocale(locale) {

  let file = getLocaleFilePath(locale);

  let data;

  if (cli.format === 'json') {
    try {
      data = require(file);
      console.log(chalk.green(`Found file ${file}, it will be extended`));
    } catch (error) {
      data = {};
      console.log(chalk.gray(`File ${file} does not exists, it will be created`));
    }
  }

  return data;
}

function extractionToMessages(extraction) {

  let translations = {};

  _.forEach(_.keys(extraction), key => {

    let path = _.toPath(key);

    path.reduce((current, key, index) => {

      if (index === path.length - 1) {
        current[key] = "";
      } else {
        if (!_.isObject(current[key])) {
          current[key] = {};
        }
      }

      return current[key];

    }, translations);

  });

  return translations;
}

function writeLocale(locale, translations) {

  let file = getLocaleFilePath(locale);
  let content;

  console.log(chalk.gray(`Writing the file ${file}`));

  switch (cli.format) {

    case 'json':
      content = JSON.stringify(translations, null, 2);
      break;

    case 'module':
      content = 'export default ' + JSON.stringify(translations, null, 2);
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

}

async function main() {

  initOptions();

  let files = getFiles();

  console.log(chalk.gray(`Found ${files.length} file(s), processing`));

  let extraction = await extract(files);

  console.log(chalk.green(`Cool, found ${Object.keys(extraction).length} translation keys in total`));
  console.log(chalk.gray(`Exporting keys (format ${cli.format})`));

  cli.locales.forEach(locale => {

    console.log(chalk.gray(`Processing locale ${locale}`));

    let data = loadLocale(locale); // It is an object
    let translations = extractionToMessages(extraction); // It is an object too, not just pairs

    translations = _.extend(translations, data);
    translations = sorter(translations);

    writeLocale(locale, translations);
  });

}

main();
