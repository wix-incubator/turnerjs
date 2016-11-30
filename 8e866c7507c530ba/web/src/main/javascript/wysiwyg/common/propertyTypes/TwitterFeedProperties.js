define.dataSchema('TwitterFeedProperties', {
    numOfTweets: {
        'type': 'number',
        'default': '5',
        'description': 'Number of tweets in feed'
    },
    subject: {
        'type': 'string',
        'default': "What's being said about...",
        'description': 'subject line'
    },
    title: {
        'type': 'string',
        'default': 'Me...',
        'description': 'title line'
    }
});