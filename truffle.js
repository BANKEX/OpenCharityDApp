module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!
	networks: {
		development: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*", // Match any network id,
			gas: 4712388,
			from: "0xce09126ace45e85ac8ca1c9c8de106acbfe81ea2"
		},
		ganache: {
			host: '127.0.0.1',
			port:7545,
			network_id: 5777,
			gas: 6721975
		},
		kovan: {
			host: 'localhost',
			port: 8545,
			network_id: 42,
			gas: 4700000,
			gasPrice: 20000000000
		},
		rinkeby: {
			host: "localhost", // Connect to geth on the specified
			port: 8545,
			network_id: 4,
			gas: 4612388,
			gasPrice: 20000000000,
			from: "0xdec98a7a34b68c7ba1d342f12069f9c44eeb4be4"
		},
		bankexStaging: {
			provider: function() {
				let WalletProvider = require("truffle-wallet-provider");
				let wallet = require('ethereumjs-wallet').fromPrivateKey(Buffer.from(process.env.ETH_KEY, 'hex'));
				return new WalletProvider(wallet, "https://rpcprovider.staging.bankex.team:8635")
			},
			gas: 4712388,
			gasPrice: 2000000000,
			network_id: '*'
		},
		bankexProduction: {
			provider: function() {
				let WalletProvider = require("truffle-wallet-provider");
				let wallet = require('ethereumjs-wallet').fromPrivateKey(Buffer.from(process.env.ETH_KEY, 'hex'));
				return new WalletProvider(wallet, "https://rpcprovider.opencharity.bankex.team:8635")
			},
			gas: 4712388,
			gasPrice: 2000000000,
			network_id: '*'
		},
		solc: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		},
		migrations_directory: './migrations'
	}
};
