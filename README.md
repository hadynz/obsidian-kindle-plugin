# Obsidian Kindle Plugin

![CI/CD status](https://github.com/hadynz/obsidian-kindle-plugin/actions/workflows/main.yml/badge.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/hadynz/obsidian-kindle-plugin)

Sync your Kindle notes and highlights directly into your [Obsidian][1] vault. You can choose
to sync using one of two methods:

### Amazon's Kindle Reader

Sync from the cloud any ebooks that you've purchased directly from Amazon. The plugin will
screen scrape your highlights from [Amazon's Kindle Reader][4] and keep them in sync.

This method will not work for highlights from books, articles, PDFs, and personal documents
not purchased from Amazon.

### Kindle Device (My Clippings)

Sync your highlights by uploading your `My Clippings.txt` file stored on your Kindle device.
This file includes highlights, bookmarks and notes for any book on your Kindle regardless
if it has been purchased via Amazon.

You can extract your `My Clippings.txt` file by plugging it into your computer using USB.

![](https://user-images.githubusercontent.com/315585/117566330-39a78000-b10a-11eb-834f-52b90ccda1ac.gif)

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

## Features

- Sync your highlights using your Amazon account via [Amazon's Kindle Reader][4]

- Sync your highlights by uploading your `My Clippings.txt` file from your Kindle device

- Enrich your notes by downloading extra metadata information about your book from Amazon.com

- Configure your own ([Nunjucks][2]) template to generate notes in exactly the way that you want

- Sync on demand or on Obsidian startup (via Amazon account method only)

## Settings

- **Highlights folder**: Vault folder to use for plugin to write synced book highlights and notes
- **Note template**: Template ([Nunjucks][2]) to use for rendering your highlights when writing
  them to disk
- **Sync on startup [default: on]**: Download extra book metadata from Amazon.com (works for
  Amazon sync only)
- **Sync on startup [default: off]**: Enable to always automatically sync your latest highlights
  using your Amazon account
- **Reset sync**: Wipe your sync history (number of books and highlights synced). Does **not**
  delete any previously synced notes from your vault
- **Amazon region**: Select the Amazon account region which has your Kindle highlights data. 
  Currently only global (.com) Japan and Spain are supported
- **Sign out**: Log out from your Amazon account (appears only if you have logged in)

## Usage

You can start the sync process by clicking on the Kindle icon in the ribbon bar or clicking
on the plugin's status bar message at the bottom of Obsidian. You will be presented with a 
modal that gives you several two options to sync.

Start syncing by choosing between uploading a copy of your `My Clippings.txt` file or using 
your online Amazon account.

### Template tags

| Tag | Description | Amazon sync | My Clippings sync |
|-|-|-|-|
| `{{title}}` | Shortened book title | Always available | Always available |
| `{{fullTitle}}` | Full book title | Always available | Always available |
| `{{author}}` | Book author | Always available if book purchased from Amazon | Optional |
| `{{asin}}` | Book ASIN | Always available if book purchased from Amazon | Not available |
| `{{url}}` | Book URL on Amazon | Always available if book has an ASIN | Not available |
| `{{imageUrl}}` | Book cover image URL | Always available if book purchased from Amazon | Not available |
| `{{appLink}}` | Link to open book in Kindle app | Always available if book has an ASIN | Not available |
| `{{isbn}}` | Book ISBN | Usually available. Download metadata option must be turned on | Not available |
| `{{pages}}` | Print length | Always available. Download metadata option must be turned on | Not available |
| `{{publication}}` | Publication date | Always available. Download metadata option must be turned on | Not available |
| `{{publisher}}` | Publisher | Always available. Download metadata option must be turned on | Not available |
| `{{authorUrl}}` | Book author URL on Amazon | Always available. Download metadata option must be turned on | Not available |
| `{{highlights}}` | List of highlights for book | Always available | Always available |

Properties of every item in `{{highlights}}`:

| Tag | Description | Amazon sync | My Clippings sync |
|-|-|-|-|
| `{{text}}` | Highlighted text | Always available | Always available |
| `{{location}}` | Highlighted text location | Usually available. If not, then  `{{page}}`  will be available | Usually available. If not, then  `{{page}}`  will be available |
| `{{page}}` | Highlighted text page | Usually available. If not, then  `{{location}}`  will be available | Usually available. If not, then  `{{location}}`  will be available |
| `{{note}}` | Associated note to highlight | Optional | Optional |
| `{{appLink}}` | Link to open highlight in Kindle app | Always available if highlight location and book ASIN available | Not available |
| `{{color}}` | Color of the highlight | Always available | Not available |

#### Highlight colors available
- Pink
- Blue
- Yellow
- Orange

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
