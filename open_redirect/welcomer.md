*Fixed on: 22/04/2026*

[Website](https://welcomer.gg) | [Discord](https://welcomer.gg/support)

This bot is basically for what his name indicates: welcoming functions. And it's [open source](https://github.com/WelcomerTeam/Welcomer)

On the `/callback` route of the website, the following check is made against the saved `path` query parameter of a previous request to the `/login` route: 

```go
// welcomer-backend/backend/routes_session.go
	if !ok || !strings.HasPrefix(queryPath, "/") {
		queryPath = "/"
	}
```

This didn't account for relative protocol URLs, so putting something like `//example.com` in `path` would get you redirected to `https://example.com` after authorizing the app.

