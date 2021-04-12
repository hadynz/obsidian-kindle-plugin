# Obsidian Kindle Plugin



## How the sync process work

## Usage

### Templating

The built-in template will generate a note with the following structure:

```markdown
- **URL:** {{ source_url }}
- **Author:** {{ author }}
- **Tags:** #{{ category }}
- **Date:** [[{{ updated }}]]
---
```

This can be overwritten by configuring the `Custom Note Header Template` setting to point to a different template. The templating system in use is [Nunjucks](https://mozilla.github.io/nunjucks/).

The available parameters for the templates are:

- title
- source_url
- author
- category
- updated

### Settings

- `Readwise API Token`: Add/update your Readwise API token.
- `Sync on startup`: If enabled, will sync highlights from Readwise when Obsidian starts
- `Custom Note Header Template`: Path to override default template for Readwise notes
- `Disable Notifications`: Toggle for pop-up notifications

### Commands

`Readwise: Sync highlights`:  Will pull any new highlights from Readwise since the last time it was synced.

### Features

- Sync highlights on Obsidian startup
- Update existing notes with new highlights
- Support templating note's header

### Compatibility

This plugin is being tested with Obsidian v0.11.9 and up