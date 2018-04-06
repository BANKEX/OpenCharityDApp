// This script is used in CI environment to update contracts abis and organizations list
// It sends request with data to common settings storage in 3 cases
// 1. Deploy to production; 2. Deploy to staging; 3. Push/merge to master branch;

const constants = require('./constants');
const orgnaizationAbi = require('./build/contracts/Organization.json').abi;
const charityEventAbi = require('./build/contracts/CharityEvent.json').abi;
const incomingDonationAbi = require('./build/contracts/IncomingDonation.json').abi;
const openCharityTokenAbi = require('./build/contracts/CharityEvent.json').abi;
const request = require('request');


// это переменная, чтобы различать пуши в мастер и деплой на прод и стейджинг
// нужно брать из CI окружения
const env = 'master';
console.log(`env: ${env}`);

const setList = (type) => {
	const body = {
		type: type,
		list: organizationsList,
		abis: {
			Organization: orgnaizationAbi,
			CharityEvent: charityEventAbi,
			IncomingDonation: incomingDonationAbi,
			OpenCharityToken: openCharityTokenAbi
		}
	};

	request({
		url: setOrganizationsUrl,
		method: 'POST',
		json: true,
		body: body
	}, function (error, response, body){
		if (error) {
			console.log('ERROR:');
			console.log(error);
			return;
		}
		console.log(body);
	});
};


let setOrganizationsUrl;
let organizationsList;
let type = 0;

if (env === 'production') {
	setOrganizationsUrl = constants.PROD_ENVIRONMENT.apiUrl + 'settings/setOrganizationList';
	organizationsList = constants.PROD_ENVIRONMENT.organizations;
} else if(env === 'staging') {
	setOrganizationsUrl = constants.STAGING_ENVIRONMENT.apiUrl + 'settings/setOrganizationList';
	organizationsList = constants.STAGING_ENVIRONMENT.organizations;
} else if(env === 'master') {
	setOrganizationsUrl = constants.DEV_ENVIRONMENT.apiUrl + 'settings/setOrganizationList';
	organizationsList = constants.DEV_ENVIRONMENT.organizations;
	type = -1;
}

setList(type);

