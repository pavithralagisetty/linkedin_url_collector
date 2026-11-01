# linkedin_url_collector

A Chrome extension (Manifest V3) of job search and outreach helpers:

- **LinkedIn URL Collector**: copies the URLs of all open LinkedIn profile tabs to your clipboard, then closes those tabs.
- **Keyword alerts**: shows a warning banner on any page that mentions `sponsorship`, `citizen`, or `citizenship`.
- **AI fill for job applications**: adds a "✨ AI fill" button to free text fields on Ashby and Greenhouse application forms. The answer is written by Google Gemini from your profile and the job description.
- **Manual AI answer generator**: writes answers for application forms on any other site.

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

## Setup (for the AI features)

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Right click the extension icon and choose **Options**, or click **Details → Extension options** in `chrome://extensions`.
3. Fill in:
   - **Gemini API key** (required)
   - **Model** (optional, defaults to `gemini-flash-latest`)
   - **Your profile** (optional): extra background or notes for the AI to use
4. Click **Save**.

Your key and profile are kept in `chrome.storage.local`, so they stay in your browser. The only place they're sent is the Gemini API.

> **Note:** `background.js` has a hardcoded applicant profile (`PROFILE_BASE`) that goes into every prompt. Anything you type in the Options profile field is added after it. If you're not the original author, replace `PROFILE_BASE` with your own résumé text.

## Usage

Click the extension's toolbar icon to open the **side panel**. It stays open while you browse.

### Collect LinkedIn URLs

1. Open the LinkedIn profiles you want (`linkedin.com/in/...`) in tabs.
2. In the side panel, click **Copy LinkedIn URLs**.
3. Every open profile URL is copied to your clipboard, one per line, without query strings. **Those tabs are then closed.**

### Keyword alerts

There's nothing to set up. When a page mentions sponsorship or citizenship, an orange banner appears in the top right corner for 10 seconds. The side panel also lists any matches on the active tab when it opens.

### AI fill on Ashby and Greenhouse

1. Open an application form on `jobs.ashbyhq.com` or `*.greenhouse.io`.
2. Next to each free text field, click **✨ AI fill** to generate an answer and insert it.
3. To guide one answer, click **💬 Add context**, type your instructions (for example, "mention my Pure Fishing internship"), and press **Enter**.

The job description is filled in automatically: on Ashby it comes from Ashby's public posting API, and on Greenhouse it's read from the page.

### Manual answer generator (any other site)

1. In the side panel, under **AI answer generator**, paste the question, plus the job description and any context if you have them.
2. Click **Generate answer**. The answer appears in the panel and is copied to your clipboard.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension config and permissions |
| `popup.html` / `popup.js` | Side panel UI: URL collector, keyword scan, manual generator |
| `content.js` | Keyword alert banner on all pages |
| `ashby_fill.js` | Adds the AI fill buttons on Ashby and Greenhouse forms |
| `background.js` | Service worker: calls Gemini, fetches job descriptions, holds the profile and prompt rules |
| `options.html` / `options.js` | Settings page for the API key, model, and profile |
