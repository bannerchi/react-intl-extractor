# React i18n extractor
Command line tool for extraction of i18n keys from your app with `react-intl`. Fast and simple.

## Installation
`npm install react-intl-extractor -g`

### Demo
![](https://raw.githubusercontent.com/yakimchuk/react-intl-extractor/master/docs/demo.gif)

### Usage
See options below

### Formats
This tool support formats:

* `<FormatMessage id="<string>" />`
* `<FormatHTMLMessage id="<string>" />`
* `formatMessage({ id: "<string>" })`

Where `string` is ID of your i18n key in output. If it has dots (like, `foo.bar.baz`), then it will be 
split in nested structure (see the demo).

### Notes

Cool things about the tool:

* If you already have JSON file with i18n, then it will override it preserving your current i18n values (output objects will be merged)
* Very fast (all extraction process can be done almost immediately)
* Supports all needed formats, except `defineMessages` (see todo section below)

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

### Todo

Friends, be free to contribute. Now there are a few features needed:
* Extraction from `defineMessages`
* Command Line Interface (step-by-step interaction; GUI)

Cheers!