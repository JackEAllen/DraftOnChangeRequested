// Copyright (c) 2024 Jack Allen
// SPDX - License-Identifier: GPL-3.0-or-later

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const context = github.context;

        // Validate the event type
        if (context.eventName !== 'pull_request_review') {
            return core.info('Action only runs on PR review events');
        }

        const { review, pull_request: pullRequest } = context.payload;  // Destructure payload for clarity

        // Check if the review state is 'changes_requested'
        if (review.state !== 'changes_requested') {
            return core.info(`Review state is "${review.state}", skipping conversion`);
        }

        if (pullRequest.draft) {
            return core.info('Pull request is already a draft, skipping conversion');
        }

    } catch (error) {
        // Redact sensitive information from error messages safely so they don't leak tokens or secrets
        const safeError = error.message?.replace(/token|auth|secret/gi, '[REDACTED]');
        core.setFailed(`Action failed: ${safeError}`);
    }
}

run();