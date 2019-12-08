a = <FormattedMessage id="test" />;
a = <FormattedMessage id="foo" />;
a = <FormattedMessage id="foo.bar" />;
a = <FormattedMessage id="foo.bar.baz" />;

a = <FormattedHTMLMessage id="bar" />;
a = <FormattedHTMLMessage id="bar.bar" />;
a = <FormattedHTMLMessage id="bar.bar.baz" />;

a = formatMessage({ data: 1, id: 'fas' });
a = formatMessage({ data: 1, id: 'baz' });
a = formatMessage({ data: 1, n: { x: [{ b: { a: 4 + 2 } }] }, id: 'goo.bar' });
a = formatMessage({ id: 'goo.bar.baz' });