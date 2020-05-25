
const config = require('./config');


var projectId = config.get('GCLOUD_PROJECT');
var sheetName = config.get('SPREADSHEET_NAME' );


/*
  Test charts 
*/
function sendCRUXNotification(imageUrl){

  //
  //var imageUrl = chartCRUX();
  
 payload.sections[0].images[0].image = imageUrl;
  // Because payload is a JavaScript object, it is interpreted as
  // as form data. (No need to specify contentType; it automatically
  // defaults to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  var options = {
    "method" : "post",
    "contentType": "application/json", 
    "payload" : JSON.stringify(payload),
    "muteHttpExceptions": false 
  };
  
  var chuckNorrisObject = JSON.stringify(options);
  Logger.log('Send CRUX Notification');
  var response = UrlFetchApp.fetch(config.get('TEAMS_WEBHOOK'), options);
  //Logger.log(response.getContentText());
}


function chartCRUX(){


    var html = HtmlService.createTemplateFromFile("chart").evaluate();
    html.setTitle("Dynamic Webpage");

    var imageData = Utilities.base64Encode(html.getAs('application/pdf').getBytes());
    var imageUrl = "data:image/png;base64," + encodeURI(imageData);
    
    return imageUrl;
    //return  htmlOutput.append("<img border=\"1\" src=\"" + imageUrl + "\">");


}

function doGet() {
  var html = HtmlService.createTemplateFromFile("chart").evaluate();
  html.setTitle("Dynamic Webpage");
  return html;
}


/**
* Init header for crux sheet 
*/
function initOrUpdateColumnTitles(headers) {

    ///var sheetName = "crux.countries";
    //var sheetName = "fcp-fid-all-countries-competitors";

    if (!sheetName) {
        throw new Error('should define SHEET_NAME in .env')
    }
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    if (!activeSpreadsheet) {
        throw new Error('Not found active spreadsheet')
    }
    const sheet = activeSpreadsheet.getSheetByName(sheetName)
    if (!sheet) {
        throw new Error(`Not found sheet by name:${sheetName}`)
    }
    const firstRange = sheet.getRange(1, 1, 1, 1)
    const firstCellValue = firstRange.getValue()
    // if 1:1 value is `yyyymm`, update columns 
    // if 1:1 value is not `yyyymm`, add new empty row and update columns
    //TODO: 
    const FIRST_CELL_VALUE = headers[0];
    if (firstCellValue !== FIRST_CELL_VALUE) {
        // if have not column title, add new row to first
        sheet.insertRowBefore(1)
    }

    //const titles = [FIRST_CELL_VALUE].concat(header)
    const targetRange = sheet.getRange(1, 1, 1, headers.length)
    targetRange.setValues([headers])

}

/**
* Runs a BigQuery query and logs the results in a spreadsheet.
*/
function runQuery() {
    // Replace this value with the project ID listed in the Google
    // Cloud Platform project.
    var request = {
        query: CRUX_QUERY
    };

    var test = request.CRUX_QUERY;


    var queryResults = BigQuery.Jobs.query(request, projectId);
    var jobId = queryResults.jobReference.jobId;

    // Check on status of the Query Job.
    var sleepTimeMs = 500;
    while (!queryResults.jobComplete) {
        Utilities.sleep(sleepTimeMs);
        sleepTimeMs *= 2;
        queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
    }

    // Get all the rows of results.
    var rows = queryResults.rows;
    while (queryResults.pageToken) {
        queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
            pageToken: queryResults.pageToken
        });
        rows = rows.concat(queryResults.rows);
    }

    if (rows) {
        var spreadsheet = SpreadsheetApp.getActive();

        if (!spreadsheet) {
            throw new Error('Not found active spreadsheet');
        }
        var sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
            throw new Error("Not found sheet by name:" + sheetName);
        }

        // Append the headers.
        var headers = queryResults.schema.fields.map(function (field) {
            return field.name;
        });

        //1. Check header
        initOrUpdateColumnTitles(headers);
        //sheet.appendRow(headers);

        //2. Map results 

        //3. Append the results.
        var data = new Array(rows.length);
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].f;
            data[i] = new Array(cols.length);
            for (var j = 0; j < cols.length; j++) {
                data[i][j] = cols[j].v;
            }
        }

        var lastRow = Math.max(sheet.getLastRow(), 1);
        //sheet.getRange(lastRow + 1, 1).setValue(timestamp);

        sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(data);

        Logger.log('Results spreadsheet created: %s',
            spreadsheet.getUrl());
    } else {
        Logger.log('No rows returned.');
    }
}

/*
  for CRUX we should refer to dataset like this  '202004';
    e.g.  SELECT  *, '202004' AS yyyymm FROM `chrome-ux-report.all.202004` 
    and our placeholder SELECT  *, '${table_prefix}' AS yyyymm FROM `chrome-ux-report.all.${table_prefix}` 
*/

// millis per day for previous month calculation
var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;


var table_prefix = Utilities.formatDate(new Date(new Date().getTime() - 19 * MILLIS_PER_DAY), 'GMT', 'yyyyMM');
//var noon = new Date(noonString);

var CRUX_QUERY =
    `WITH crux AS (` +
    `    # pull data from CRUX \n` +
    `  SELECT  *, \'${table_prefix}\' AS yyyymm FROM \`chrome-ux-report.all.${table_prefix}\`     ` +
    `      WHERE` +
    `      origin = \'https://www.se.com\' ` +
    `      OR origin = \'https://www.apc.com\' ` +
    `      OR origin = \'https://www.honeywell.com\' ` +
    `      OR origin = \'https://new.siemens.com\'  ` +
    `      OR origin = \'https://group.bnpparibas\'` +
    `      OR origin = \'https://www.groupe-psa.com\'` +
    `      OR origin = \'https://www.essilorluxottica.com\'` +
    `      OR origin = \'https://www.ge.com\'` +
    `   ` +
    `  ),` +

    `  #calculate FCP with 3 sec buckets` +
    `  FCPs AS (` +
    `    SELECT` +
    `      origin,` +
    `      yyyymm,` +
    `      form_factor.name as fcp_device,` +
    `      ROUND(SUM(IF(fcp.start < 3000 , fcp.density, 0)), 4) AS fast_3_fcp,` +
    `      ROUND(SUM(IF(fcp.start >= 3000, fcp.density, 0)), 4) AS slow_3_fcp,` +

    `      FROM crux,` +
    `      UNNEST(first_contentful_paint.histogram.bin) AS fcp` +
    `` +
    `    WHERE` +
    `      origin = \'https://www.se.com\' ` +
    `      OR origin = \'https://www.apc.com\' ` +
    `      OR origin = \'https://www.honeywell.com\' ` +
    `      OR origin = \'https://new.siemens.com\'  ` +
    `      OR origin = \'https://group.bnpparibas\'` +
    `      OR origin = \'https://www.groupe-psa.com\'` +
    `      OR origin = \'https://www.essilorluxottica.com\'` +
    `      OR origin = \'https://www.ge.com\'` +
    `    GROUP BY` +
    `      yyyymm,` +
    `      origin,` +
    `      fcp_device` +
    `    ORDER BY` +
    `      yyyymm` +
    `   ` +
    `   ), ` +

    `   #calculate FID with 300 ms buckets` +
    `   FIDs AS (` +
    `    SELECT` +
    `      yyyymm,` +
    `      form_factor.name as fid_device,` +
    `      origin,` +
    `      #fid` +
    `      ROUND(SUM(IF(fid.start < 300, fid.density, 0)), 4) AS fast_3_fid,` +
    `      ROUND(SUM(IF(fid.start >= 300, fid.density, 0)), 4) AS slow_3_fid,` +

    `    FROM` +
    `      crux,` +
    `      UNNEST(first_input.delay.histogram.bin) AS fid` +

    `    WHERE` +
    `      origin = \'https://www.se.com\' ` +
    `      OR origin = \'https://www.apc.com\' ` +
    `      OR origin = \'https://www.honeywell.com\' ` +
    `      OR origin = \'https://new.siemens.com\'  ` +
    `      OR origin = \'https://group.bnpparibas\'` +
    `      OR origin = \'https://www.groupe-psa.com\'` +
    `      OR origin = \'https://www.essilorluxottica.com\'` +
    `      OR origin = \'https://www.ge.com\'` +
    `    GROUP BY` +
    `      yyyymm,` +
    `      origin,` +
    `      fid_device` +
    `    ORDER BY` +
    `      yyyymm` +
    `   ` +
    `  )   ` +

    `SELECT    ` +
    `      #FCP related ` +
    `      FCPs.yyyymm, ` +
    `      FCPs.origin,` +
    `      fcp_device,` +
    `      FCPs.fast_3_fcp,` +
    `      FCPs.slow_3_fcp,` +
    `      ` +
    `      #FID related ` +
    `      FIDs.fast_3_fid,` +
    `      FIDs.slow_3_fid` +

    `      FROM FCPs join FIDs ON FCPs.yyyymm = FIDs.yyyymm AND` +
    `                             FCPs.origin = FIDs.origin AND` +
    `                             FCPs.fcp_device = FIDs.fid_device;`;
    
    
    
var payload = {
	"@type": "MessageCard",
	"@context": "https://schema.org/extensions",
	"summary": "2 new Yammer posts",
	"themeColor": "0078D7",
	"sections": [
		{
			"activityImage": "https://user-images.githubusercontent.com/1120896/55263154-74aa0a80-5246-11e9-96c3-5741f798f3aa.png",
			"images": [{
	                "image": "https://user-images.githubusercontent.com/1120896/55263154-74aa0a80-5246-11e9-96c3-5741f798f3aa.png",
	                "title": "ffff"
	         }],
			"activityTitle": "CRUXer",
			"activitySubtitle": "right now",
			"facts": [
				{
					"name": "Month:",
					"value": "April,15"
				},
				{
					"name": "Origin:",
					"value": "se.com"
				}
			],
			"text": "Hi CrUX users, This is your monthly announcement that the latest dataset has been published to BigQuery!",
                        "heroImage": {
                "image": "https://developers.google.com/web/updates/images/2018/08/crux-dash-fcp.png"
            },
			"potentialAction": [
				{
					"@type": "OpenUri",
					"name": "View se.com report ",
                    "targets": [
                        { "os": "default", "uri": "https://datastudio.google.com/reporting/ec2947ce-efe2-46da-8551-7c67b28ca14f" }
                    ]
				}
			]
 	}
	]
};