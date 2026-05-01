Many sites, after some process like logging-in, getting into a tab... etc. sends to you a redirect to the page that you were before starting the process. They often save the page that you were before in attributes like `redirect`, `to`, `go`... etc. On URL that could be represented as:

`/login?redirect=/dashboard`

When there is no validation of that `redirect` parameter, you can put something like `https://google.com` instead, and when you end the process, you will be redirected to Google. There is no restriction for the redirect so it's "open".

This is very useful for phishing attacks, as many people will only look that the first URL that they entered is from your app, and will trust everything that you app redirects to.

Moreover, you can make the redirect happen on two ways:

- Sending a 30x HTTP status code with the `Location` header set to the destination
- Use JavaScript by doing something like `window.location.href = "[destination]"`

When it's the second case, you can easily escalate this to a XSS, as all the browsers will happily interpret a URL like `javascript:<code here>` as JavaScript code to execute.


