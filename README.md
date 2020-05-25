# crux-reporter


![CRUX report automation tool](https://raw.githubusercontent.com/ikalachy/crux-reporter/master/img/CRUX%20Automation.jpeg)

## Requirements

- Node.js
  - This script is written by Node.js
- [Yarn](https://yarnpkg.com/)
  - package manager
  - This repository is managed by Yarn
- Google Account
  - Need to login with [clasp](https://github.com/google/clasp).
  - `crux-reporter` is a Google Apps Script.
- Google Spreadsheet
  - `crux-reporter` record the result of CRUX dataset query to Google Spreadsheet
  - we use Bigquery to get result from CRUX dataset 
- GCP project ID
  - we use CRUX dataset and bigquery 
  - we need to do it in scope of GCP project hence project id is required 
- Google datastudio
  - in case we want to visualize data

# Installation 

0. Install all dependencies 
```
yarn install
```

1. yarn clasp login

>  `clasp` allows you to develop your Apps Script projects locally. That means you can check-in your code into source control, collaborate with other developers, and use your favorite tools to develop Apps Script.

2. Create app holder for the script and sheet as a data storage Run following command:

```
yarn run create-app "<script title>" "<spreadsheet id>"
# Example
# yarn run create-app "crux-demo" "1tgVIzqVo1QdKbW7beY5UVEoXmNjxNyiwqCMktCjcRyc"
```

3. Open `/src/index.js` and change *sheetName* and *projectId* properties 

4. Deploy the `crux-demo` script to your Google Apps Script: e.g.

```
# yarn run deploy
```



