let a = <FormattedMessage id="foo" />;
let b = <FormattedHTMLMessage id="bar" />;
let c = <FormattedMessage id="baz.bar.foo" />;
let d = formatMessage({ id: 'some.test.message' });

let e = defineMessages({
    greeting: {
        id: 'app.home.greeting',
        description: 'Message to greet the user.',
        defaultMessage: 'Hello, {name}!',
    },
    another: {
        id: 'app.welcome.greeting',
        description: 'Another to greet the user.',
        defaultMessage: 'Another {name}!',
    },
    third: {
        id: 'app.welcome.third.greeting',
        description: 'Another to greet the user.',
        defaultMessage: 'Another third {name}!',
        some: {
            id: 'someMessage',
            description: 'Another message to greet the user.',
            defaultMessage: 'Another message plus name "{name}"!',
        }
    }
});