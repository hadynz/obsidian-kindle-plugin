# Obsidian Kindle Plugin

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

https://user-images.githubusercontent.com/315585/115801054-f4a7fc00-a42f-11eb-81e6-cd642b11fb9b.mp4

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

- Configure your own ([Nunjucks][2]) template to generate notes in exactly the way that you want

- Sync on demand or on Obsidian startup (via Amazon account method only)

## Settings

- **Highlights folder**: Vault folder to use for plugin to write synced book highlights and notes
- **Note template**: Template ([Nunjucks][2]) to use for rendering your highlights when writing
  them to disk
- **Sync on startup [default: off]**: Enable to always automatically sync your latest highlights
  using your Amazon account
- **Reset sync**: Wipe your sync history (number of books and highlights synced). Does **not**
  delete any previously synced notes from your vault.
- **Sign out**: Log out from your Amazon account (appears only if you have logged in)

## Security considreation

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
