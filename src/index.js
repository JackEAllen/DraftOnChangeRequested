// Copyright (c) 2024 Jack Allen
// SPDX - License-Identifier: GPL-3.0-or-later

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        core.log('Convert to Draft on Change Request Action');
    } catch (error) {
        core.setFailed(`Action failed: ${error.message}`);
    }
}

run();