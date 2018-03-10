export const OrganizationContractAbi = [
	{
		'constant': true,
		'inputs': [],
		'name': 'name',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'incomingDonationCount',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'name': 'admins',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'charityEventCount',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'name': 'incomingDonationIndex',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'employeeCount',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'name': 'employeeIndex',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'name': 'charityEventIndex',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'name': 'employees',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'name': 'incomingDonations',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'name': 'charityEvents',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'name': '_token',
				'type': 'address'
			},
			{
				'name': '_admins',
				'type': 'address[]'
			},
			{
				'name': '_name',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'constructor'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'organization',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'employee',
				'type': 'address'
			}
		],
		'name': 'EmployeeAdded',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'organization',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'charityEvent',
				'type': 'address'
			}
		],
		'name': 'CharityEventAdded',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'organization',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'incomingDonation',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'who',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'amount',
				'type': 'uint256'
			}
		],
		'name': 'IncomingDonationAdded',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'ownerAddress',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'metaStorageHash',
				'type': 'string'
			}
		],
		'name': 'MetaStorageHashUpdated',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'incomingDonation',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'charityEvent',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'sender',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'amount',
				'type': 'uint256'
			}
		],
		'name': 'FundsMovedToCharityEvent',
		'type': 'event'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_firstName',
				'type': 'string'
			},
			{
				'name': '_lastName',
				'type': 'string'
			}
		],
		'name': 'addEmployee',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_name',
				'type': 'string'
			},
			{
				'name': '_target',
				'type': 'uint256'
			},
			{
				'name': '_payed',
				'type': 'uint256'
			},
			{
				'name': '_tags',
				'type': 'bytes1'
			},
			{
				'name': '_metaStorageHash',
				'type': 'string'
			}
		],
		'name': 'addCharityEvent',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_realWorldIdentifier',
				'type': 'string'
			},
			{
				'name': '_amount',
				'type': 'uint256'
			},
			{
				'name': '_note',
				'type': 'string'
			},
			{
				'name': '_tags',
				'type': 'bytes1'
			}
		],
		'name': 'setIncomingDonation',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_incomingDonation',
				'type': 'address'
			},
			{
				'name': '_charityEvent',
				'type': 'address'
			},
			{
				'name': '_amount',
				'type': 'uint256'
			}
		],
		'name': 'moveDonationFundsToCharityEvent',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_charityEvent',
				'type': 'address'
			},
			{
				'name': '_hash',
				'type': 'string'
			}
		],
		'name': 'updateCharityEventMetaStorageHash',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'isAdmin',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': 'admin',
				'type': 'address'
			},
			{
				'name': 'value',
				'type': 'bool'
			}
		],
		'name': 'setAdmin',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	}
];
export const CharityEventContractAbi = [
	{
		'constant': true,
		'inputs': [],
		'name': 'name',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'metaStorageHash',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'payed',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'target',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'tags',
		'outputs': [
			{
				'name': '',
				'type': 'bytes1'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'name': '_name',
				'type': 'string'
			},
			{
				'name': '_target',
				'type': 'uint256'
			},
			{
				'name': '_payed',
				'type': 'uint256'
			},
			{
				'name': '_tags',
				'type': 'bytes1'
			},
			{
				'name': '_metaStorageHash',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'constructor'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'isCharityEvent',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'pure',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_metaStorageHash',
				'type': 'string'
			}
		],
		'name': 'updateMetaStorageHash',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	}
];
export const IncomingDonationContractAbi = [
	{
		'constant': true,
		'inputs': [],
		'name': 'note',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'realWorldIdentifier',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'tags',
		'outputs': [
			{
				'name': '',
				'type': 'bytes1'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'token',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'name': '_token',
				'type': 'address'
			},
			{
				'name': '_realWorldIdentifier',
				'type': 'string'
			},
			{
				'name': '_note',
				'type': 'string'
			},
			{
				'name': '_tags',
				'type': 'bytes1'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'constructor'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_charityEvent',
				'type': 'address'
			},
			{
				'name': '_amount',
				'type': 'uint256'
			}
		],
		'name': 'moveToCharityEvent',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': 'donationTags',
				'type': 'bytes1'
			},
			{
				'name': 'eventTags',
				'type': 'bytes1'
			}
		],
		'name': 'validateTags',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'isIncomingDonation',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'pure',
		'type': 'function'
	}
];
export const OpenCharityTokenContractAbi = [
	{
		'constant': true,
		'inputs': [],
		'name': 'mintingFinished',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'name',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_spender',
				'type': 'address'
			},
			{
				'name': '_value',
				'type': 'uint256'
			}
		],
		'name': 'approve',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'totalSupply',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_from',
				'type': 'address'
			},
			{
				'name': '_to',
				'type': 'address'
			},
			{
				'name': '_value',
				'type': 'uint256'
			}
		],
		'name': 'transferFrom',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'decimals',
		'outputs': [
			{
				'name': '',
				'type': 'uint8'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_to',
				'type': 'address'
			},
			{
				'name': '_amount',
				'type': 'uint256'
			}
		],
		'name': 'mint',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_value',
				'type': 'uint256'
			}
		],
		'name': 'burn',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'name': 'mintAgents',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': 'addr',
				'type': 'address'
			},
			{
				'name': 'state',
				'type': 'bool'
			}
		],
		'name': 'setMintAgent',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_spender',
				'type': 'address'
			},
			{
				'name': '_subtractedValue',
				'type': 'uint256'
			}
		],
		'name': 'decreaseApproval',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '_owner',
				'type': 'address'
			}
		],
		'name': 'balanceOf',
		'outputs': [
			{
				'name': 'balance',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [],
		'name': 'finishMinting',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'owner',
		'outputs': [
			{
				'name': '',
				'type': 'address'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [],
		'name': 'symbol',
		'outputs': [
			{
				'name': '',
				'type': 'string'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_to',
				'type': 'address'
			},
			{
				'name': '_value',
				'type': 'uint256'
			}
		],
		'name': 'transfer',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_spender',
				'type': 'address'
			},
			{
				'name': '_addedValue',
				'type': 'uint256'
			}
		],
		'name': 'increaseApproval',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': true,
		'inputs': [
			{
				'name': '_owner',
				'type': 'address'
			},
			{
				'name': '_spender',
				'type': 'address'
			}
		],
		'name': 'allowance',
		'outputs': [
			{
				'name': '',
				'type': 'uint256'
			}
		],
		'payable': false,
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': '_to',
				'type': 'address'
			},
			{
				'name': '_amount',
				'type': 'uint256'
			}
		],
		'name': 'mintTest',
		'outputs': [
			{
				'name': '',
				'type': 'bool'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'constant': false,
		'inputs': [
			{
				'name': 'newOwner',
				'type': 'address'
			}
		],
		'name': 'transferOwnership',
		'outputs': [],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'name': '_name',
				'type': 'string'
			},
			{
				'name': '_symbol',
				'type': 'string'
			},
			{
				'name': '_decimals',
				'type': 'uint8'
			}
		],
		'payable': false,
		'stateMutability': 'nonpayable',
		'type': 'constructor'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'burner',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'value',
				'type': 'uint256'
			}
		],
		'name': 'Burn',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': false,
				'name': 'addr',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'state',
				'type': 'bool'
			}
		],
		'name': 'MintingAgentChanged',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'to',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'amount',
				'type': 'uint256'
			}
		],
		'name': 'Mint',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [],
		'name': 'MintFinished',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'previousOwner',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'newOwner',
				'type': 'address'
			}
		],
		'name': 'OwnershipTransferred',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'owner',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'spender',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'value',
				'type': 'uint256'
			}
		],
		'name': 'Approval',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'name': 'from',
				'type': 'address'
			},
			{
				'indexed': true,
				'name': 'to',
				'type': 'address'
			},
			{
				'indexed': false,
				'name': 'value',
				'type': 'uint256'
			}
		],
		'name': 'Transfer',
		'type': 'event'
	}
];
