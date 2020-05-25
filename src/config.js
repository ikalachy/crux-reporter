// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'GCLOUD_PROJECT',
    'SPREADSHEET_NAME',
    'TEAMS_WEBHOOK'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({

    // This is the id of your project in the Google Cloud Developers Console.
    // and spreadsheet name  
    GCLOUD_PROJECT: 'crux-report-268618',
    SPREADSHEET_NAME: 'fcp-fid-all-countries-competitors',
    TEAMS_WEBHOOK: 'https://outlook.office.com/webhook/5c805597-e383-40c0-88fd-aab571492372@b41b72d0-4e9f-4c26-8a69-f949f367c91d/IncomingWebhook/46ef085c35964cd9b8688d94e3e0a9da/1c496063-340f-4bee-9559-5c4fdfddc160'

  });

// Check for required settings
checkConfig('GCLOUD_PROJECT');
checkConfig('SPREADSHEET_NAME');
checkConfig('TEAMS_WEBHOOK');

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
} 