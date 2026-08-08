# Girosto Google Sheet submission endpoint

The destination spreadsheet is **Girosto.com | Data**:

https://docs.google.com/spreadsheets/d/1I4nDR0qpOjPeSQiVWCkfnUqf2NzGyUtwj_jks_NW3Aw/edit

The website sends checkout orders to the lowercase orders tab. Contact-us and future lead forms send leads to the lowercase contacts tab.

## One-time deployment

1. Open the spreadsheet, then choose **Extensions > Apps Script**.
2. Replace the editor contents with Code.gs from this folder and save.
3. Select setupGirostoSheets in the function menu, click **Run**, and authorize it. This initializes the orders and contacts headers.
4. Choose **Deploy > New deployment > Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
6. Authorize the script, deploy it, and copy the URL ending in /exec.
7. Paste that URL between the quotes in assets/js/submission-config.js.

When Code.gs changes later, deploy a new version from **Deploy > Manage deployments**. Do not put Google account credentials or API keys in the website.