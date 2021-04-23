# Obsidian Kindle Plugin

Sync your Kindle notes and highlights directly from Amazon into your [Obsidian][1] vault. You
can choose which folder to sync into and configure your own template to make this plugin
fit in your very own workflow.

## Mission statement

Inspired by Obsidian's principle of "your data sitting in a local folder" and "never leaving
you're life's work held hostage in the cloud again", this plugin tries to do exactly that
with your precious Kindle notes and highlights. Why should you struggle in accessing your own
data, or paying for a third party service to access information that you own?

## Key features

- Log in securely to your Amazon account to access your Kindle data. No login information
  needs to be managed or stored by the plugin

- Configure your own ([Nunjucks][2]) template to generate notes in exactly the way that you want

- Sync on demand or on Obsidian startup

## How the sync process work

This plugin works by wrapping itself around https://read.amazon.com and screen scraping your
Kindle notes and highlights in the background.

## Development

Pull requests are encouraged and always welcome.

To install and work on this plugin locally:

```bash
cd /Users/<user>/<Obsidian vault>/.obsidian/plugins/obsidian-kindle-highlights
git clone https://github.com/hadynz/obsidian-kindle-plugin.git
cd obsidian-kindle-plugin
npm install
```

To build this plugin into a single package:

```bash
npm run build
```

To watch for changes and continually rebuild the package:

```bash
npm run dev
```

Your development flow can be made very productive with the [Hot-Reload plugin][3] for Obsidian.

### Running Tests

```bash
npm run test
```

## License

[MIT](LICENSE)

[1]: https://obsidian.md
[2]: https://mozilla.github.io/nunjucks
[3]: https://github.com/pjeby/hot-reload
