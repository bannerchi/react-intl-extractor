# React i18n extractor
Command line tool for extraction of i18n keys from your app with `react-intl`. Fast and simple.

## Installation
`npm install react-intl-extractor -g`

## Usage
This tool crawl all files in your application, searches strings `<FormattedMessage ... id="..." />` and then 
extracts and saves gathered IDs in your JSON or JS file.

### Examples
Extract keys from all files inside ../Projects/your-project-root, and place them as JSON files to folder ../Projects/your-project-root/locales

`react-intl-extractor -l en-US,ru-RU,be-BY -r ../Projects/your-project-root -f json -o ../Projects/your-project-root/locales`

It will output files:
* `...your-project-root/locales/en-US.json`
* `...your-project-root/locales/ru-RU.json`
* `...your-project-root/locales/be-BY.json`


Note: All existing JSON files will be loaded and merged with new extracted keys, i.e. you will not lost all your current translations

### Options
See help message `react-intl-extractor --help`:
```
Usage: react-intl-extractor [options]

Options:

  -l, --locales <items>     Comma-separated list of locales files to output (ex. "en-US,ru-RU")
  
  -r, --root <path>         Project root, where to start searching keys for extraction (relative path or absolute path), default is current 
                            folder
  
  -e, --extensions <items>  Comma-separated list with files extensions to search (ex. js,jsx,ts,tsx)
  
  -f, --format <format>     How to save extracted keys, possible values are "json" or "module" (it affects filename, it will be xx-XX.json or 
                            xx-XX.js)
  
  -o, --outputDir <path>    Where to save output files, relative or absolute path to folder, default is current directory
  
  -h, --help                output usage information
```