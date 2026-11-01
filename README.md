# linkedin_url_collector

A Chrome extension (Manifest V3) of job search and outreach helpers:

- **LinkedIn URL Collector**: copies the URLs of all open LinkedIn profile tabs to your clipboard, then closes those tabs.
- **Keyword alerts**: shows a warning banner on any page that mentions `sponsorship`, `citizen`, or `citizenship`.

## Install

1. Clone or download this repo.
   ```bash
   git clone https://github.com/pavithralagisetty/linkedin_url_collector.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the cloned folder.
5. Optional: pin the extension to your toolbar.

If you change the code, click the reload icon on the extension's card in `chrome://extensions`.

## Usage

Click the extension's toolbar icon to open the **side panel**. It stays open while you browse.

### Collect LinkedIn URLs

1. Open the LinkedIn profiles you want (`linkedin.com/in/...`) in tabs.
2. In the side panel, click **Copy LinkedIn URLs**.
3. Every open profile URL is copied to your clipboard, one per line, without query strings. **Those tabs are then closed.**

### Keyword alerts

There's nothing to set up. When a page mentions sponsorship or citizenship, an orange banner appears in the top right corner for 10 seconds. The side panel also lists any matches on the active tab when it opens.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension config and permissions |
| `popup.html` / `popup.js` | Side panel UI: URL collector and keyword scan |
| `content.js` | Keyword alert banner on all pages |
