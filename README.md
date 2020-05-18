# crux-reporter

![CRUX report automation tool](https://raw.githubusercontent.com/ikalachy/crux-reporter/master/img/CRUX%20Automation.jpeg)


# Installation 

Install all dependencies 
```
yarn install
```

1. yarn clasp login

`clasp` allows you to develop your Apps Script projects locally. That means you can check-in your code into source control, collaborate with other developers, and use your favorite tools to develop Apps Script.

2. Create app holder for the script and sheet as a data storage Run following command:

```
yarn run create-app "<script title>" "<spreadsheet id>"
# Example
# yarn run create-app "crux-demo" "1tgVIzqVo1QdKbW7beY5UVEoXmNjxNyiwqCMktCjcRyc"
```

3. Deploy the `crux-demo` script to your Google Apps Script: `yarn run deploy`

```
# yarn run deploy
```

