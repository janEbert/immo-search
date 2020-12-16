# ImmoSearch

Easily see relevant information for real estate listings. This only
applies local transformations to individual listing pages so the user
can worry about captchas, JavaScript and other fun.

You can store any listing using the button at the top of the page.
These are stored in the Firefox local storage as JSON with a
uniquely-identifiable key.

There is also machine-processable data hidden in a `details` tag below
the human-readable table (in formats for [Org
Mode](https://orgmode.org) tables and JSON). For those, you can click
on the text and it will be copied to your clipboard.

## Installation

### Temporary

Navigate to `about:debugging#/runtime/this-firefox` and select "Load
Temporary Add-on...". Then select the [manifest.json](./manifest.json)
file in this repository's root.

### Persistent

<details>
<summary>
You should not do this and instead wait for signed releases.
</summary>

Go to `about:config` and set `xpinstall.signatures.required` to `false`.

Zip the repository's root folder:
```shell
zip -r -FS immo-search.xpi * --exclude '*.git*'
```

Then navigate to `about:addons`, click on the gears icon and select
"Install Add-on From File...". Finally, select the immo-search.xpi
file you created.
</details>

## Websites

Currently works with
- [immobilienscout24.de](https://immobilienscout24.de)
- [wg-gesucht.de](https://wg-gesucht.de)

## Further notes

Not all functionality is implemented; this is more a proof of concept.

As the supported websites are all German, the translations are
currently also only available in German.
