# Obsidian Kindle Plugin

![CI/CD status](https://github.com/hadynz/obsidian-kindle-plugin/actions/workflows/main.yml/badge.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/hadynz/obsidian-kindle-plugin)

Sync (and resync) your Kindle notes and highlights directly into your [Obsidian][1] vault. You
can choose to sync using one of two methods:

### Amazon's Kindle Reader

Sync from the cloud any ebooks that you've purchased directly from Amazon. The plugin will
screen scrape your highlights from [Amazon's Kindle Reader][4] and continuously keep them in sync.

This method will not work for highlights from books, articles, PDFs, and personal documents
not purchased from Amazon (see next method).

### Kindle Device (My Clippings)

Sync your highlights by uploading your `My Clippings.txt` file stored on your Kindle device.
This file includes highlights, bookmarks and notes for any book on your Kindle regardless
if it has been purchased via Amazon.

You can extract your `My Clippings.txt` file by plugging it into your computer using USB.

![](https://user-images.githubusercontent.com/315585/117566330-39a78000-b10a-11eb-834f-52b90ccda1ac.gif)

## Features

- **Continuous, automatic syncing** — One button press to sync your highlights using your Amazon account via [Amazon's Kindle Reader][4].

  Subsequent syncing will do an intelligent diff and bring in any new highlights without impacting any edits that you've done to your highlights file.

- **Sync non-Amazon books** — Sync your highlights by uploading your `My Clippings.txt` file from your Kindle device

- **Enriched metadata** — Enrich your notes by downloading extra metadata information about your book from Amazon.com

- **Powerful, flexible templating with preview** — Customise your highlights and file names to your liking by configuring your own template using ([Nunjucks][2]) templating language with live preview

## Mission statement

Inspired by Obsidian's principle of "your data sitting in a local folder" and "never leaving
you're life's work held hostage in the cloud again", this plugin tries to do exactly that
with your precious Kindle notes and highlights. Why should you struggle in accessing your own
data, or paying for a third party service to access information that you own?

## Known considerations

### Security

If you choose to sync your highlights via Amazon's online Kindle Reader, it is important to note
that by logging in to your Amazon account via Obsidian your Amazon session becomes available to
any other plugin across your vaults until your session expires.

You can mitigate this risk by logging out after every sync (from settings) or using the offline
method of syncing by uploading your `My Clippings.txt` file instead.

### Export limits

For several reasons (see [here][5] and [here][6]) the Kindle platform can sometimes limit the amount
of highlighted text that can be exported from a particular book. This limit varies from book to book, purchased from Amazon or have DRM protection. There is currently no known alternative to work around this.

## Say Thanks

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="140">](https://www.buymeacoffee.com/hadynz)

[![GitHub Sponsors](https://img.shields.io/github/sponsors/hadynz?style=social)](https://github.com/sponsors/hadynz)

## License

[MIT](LICENSE)

[1]: https://obsidian.md
[2]: https://mozilla.github.io/nunjucks
[3]: https://github.com/pjeby/hot-reload
[4]: https://read.amazon.com/notebook
[5]: https://help.readwise.io/article/47-why-are-my-kindle-highlights-truncated-ellipses#:~:text=Publishers%20require%20Amazon%20to%20place,the%20book%20will%20be%20truncated.
[6]: https://brian.carnell.com/articles/2018/route-around-amazon-kindles-ridiculous-limits-on-highlights-exporting-with-bookcision/
