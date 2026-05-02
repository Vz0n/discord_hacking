*Fixed on: 09/03/2025*

[Webiste](https://yagpdb.xyz) | [Discord](https://discord.gg/4udtcA5)

**Y**et **A**nother **G**eneral **P**urpose **D**iscord **B**ot is another multi-purpose bot owned by BotLabs. This one [is open source](https://github.com/botlabs-gg/yagpdb)

This check was made on the OAuth callback after logging-in, against the saved redirect in `/login?goto=<URL>`:

```go
  if redir != "" && strings.HasPrefix(redir, "/") {
		common.RedisPool.Do(radix.Cmd(nil, "SET", "csrf_redir:"+csrfToken, redir, "EX", "500"))
  }
```

As the welcomer one, this didn't account for protocol relative redirects.

The dev fixed it quickly after reporting it.