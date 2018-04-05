const constants = require('./test-constants');
const apiUrl = constants.STAGING_ENVIRONMENT.apiUrl;
const env = '$CI_COMMIT_REF_NAME';

console.log(env);

