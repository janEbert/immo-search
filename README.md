# ImmoSearch

Easily see relevant information for real estate listings.

You can store any listing using the button at the top of the page.
These are stored in the Firefox local storage as JSON with a
uniquely-identifiable key.

There is also machine-processable data hidden in a `details` tag below
the human-readable table (in formats for [Org
Mode](https://orgmode.org) tables and JSON). For those, you can click
on the text and it will be copied to your clipboard.

## Installation

Go to <about:debugging#/runtime/this-firefox> and select "Load
Temporary Add-on...". Then select the [manifest.json](./manifest.json)
file in this repository's root.

## Websites

Currently works with
- immobilienscout24.de
- wg-gesucht.de

## Further notes

Not all functionality is implemented; this is more a proof of concept.

As the supported websites are all German, the translations are
currently also only available in German.
