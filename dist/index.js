/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 180:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 940:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// Copyright (c) 2024 Jack Allen
// SPDX - License-Identifier: GPL-3.0-or-later

const core = __nccwpck_require__(180);
const github = __nccwpck_require__(940);

async function run() {
    try {
        const ccontext = github.context;

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
module.exports = __webpack_exports__;
/******/ })()
;