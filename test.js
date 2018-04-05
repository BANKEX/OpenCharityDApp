const constants = require('./test-constants');
const apiUrl = constants.STAGING_ENVIRONMENT.apiUrl;
const env = '$CI_COMMIT_REF_NAME';

if (env === 'production') {
	fet

} else if(env === 'staging') {

} else if(env === 'master') {

}

console.log(env);

