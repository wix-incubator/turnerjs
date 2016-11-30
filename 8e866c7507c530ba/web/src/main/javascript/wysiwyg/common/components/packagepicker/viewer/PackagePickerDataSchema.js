define.dataSchema('PackagePicker',
	{
		'packageId': "string",
		'buttonImageUrl': "string",
		'tooltipText': "string",
		'billingCycle': {
			"type": "string",
			"enum": ["monthly", "yearly"],
			"default": "monthly"
		},
		'selectByDefault': {
			'type': 'boolean',
			'default': false
		}
});