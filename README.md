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

- **Powerful, flexible templating** — Customise your highlights to your liking by configuring your own template using ([Nunjucks][2]) templating language

## Mission statement

Inspired by Obsidian's principle of "your data sitting in a local folder" and "never leaving
you're life's work held hostage in the cloud again", this plugin tries to do exactly that
with your precious Kindle notes and highlights. Why should you struggle in accessing your own
data, or paying for a third party service to access information that you own?

## Usage

After enabling the plugin in the settings menu, your Obsidian's status bar will start showing
your Kindle sync status. Click on the status bar to start adhoc syncing or to see more
detailed information on your sync status to date.

Configure the settings of the plugin to specify the folder location for your syncing.

## Settings

- **Highlights folder**: Vault folder to use for plugin to write synced book highlights and notes
- **Note template**: Template ([Nunjucks][2]) to use for rendering your highlights when writing
  them to disk
- **Sync on startup [default: on]**: Download extra book metadata from Amazon.com (works for
  Amazon sync only)
- **Sync on startup [default: off]**: Enable to always automatically sync your latest highlights
  using your Amazon account
- **Amazon region**: Select the Amazon account region which has your Kindle highlights data.
  Currently only global (.com), India, Japan, Spain and Germany are supported
- **Sign out**: Log out from your Amazon account (appears only if you have logged in)

## Usage

You can start the sync process by clicking on the Kindle icon in the ribbon bar or clicking
on the plugin's status bar message at the bottom of Obsidian. You will be presented with a
modal that gives you several two options to sync.

Start syncing by choosing between uploading a copy of your `My Clippings.txt` file or using
your online Amazon account.

### Template tags

| Tag            | Description                                         | Present                                                                            |
| -------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `{{text}}`     | Annotated text                                      | Always in all sync modes                                                           |
| `{{location}}` | Highlighted text location                           | Usually available in all sync modes. If not, then `{{page}}` will be available     | Usually available. If not, then `{{page}}` will be available |
| `{{page}}`     | Highlighted text page                               | Usually available in all sync modes. If not, then `{{location}}` will be available |
| `{{note}}`     | Associated note to highlight                        | Optional                                                                           |
| `{{appLink}}`  | Link to open highlight in Kindle app                | Available only for Amazon books synced through Amazon online                       |
| `{{color}}`    | Color of the highlight (pink, blue, yellow, orange) | Available only for Amazon books synced through Amazon online                       |

## Security consideration

If you choose to sync your highlights via Amazon's online Kindle Reader, it is important to note
that by logging in to your Amazon account via Obsidian your Amazon session becomes available to
any other plugin across your vaults until your session expires.

You can mitigate this risk by logging out after every sync (from settings) or using the offline
method of syncing by uploading your `My Clippings.txt` file instead.

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
