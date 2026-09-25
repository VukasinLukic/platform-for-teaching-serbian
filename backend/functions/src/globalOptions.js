/**
 * Global options for every Cloud Function.
 *
 * Must be imported in index.js right after initAdmin.js and BEFORE any module that
 * defines a function: firebase-functions v2 reads global options eagerly when
 * onCall()/onSchedule() is called, and ES module imports are evaluated before the
 * body of index.js runs (so calling setGlobalOptions in index.js had no effect).
 *
 * Every function runs in europe-west1 (closest region to Serbia, EU data location).
 * Do not add per-function `region` overrides: the frontend uses a single
 * europe-west1 Functions instance (frontend/src/services/firebase.js).
 */

import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 10,
});
