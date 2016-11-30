define.dataSchema('HomePageLogin', {
    postLoginUrl: {
        'type': 'string',
        'default': 'http://www.wix.com',
        'description': 'some amazing description'
    },
    postSignUpUrl: {
        'type': 'string',
        'default': 'http://www.wix.com',
        'description': 'some amazing description'
    },
    startWith: {
        'type': 'string',
        'enum': ['login', 'createUser'],
        'default': 'login',
        'description': 'some amazing description'
    }
});
