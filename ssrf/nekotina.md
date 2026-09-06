## Here is you welcome imag... wtf?
*Fixed on: ??/11/2025*

[Website](https://nekotina.com) | [Discord](https://nekotina.com/discord)

Nekotina is a mainly spanish multi purpose bot that is basically a must-have in almost all of the Discord spanish community. The most used features are the interaction/roleplay commands and global economy system.

There is a module that lets you create a welcome message, with many options:

![Welcome module](assets/nekotina1.png)

When you save settings, this payload is sent via server actions:

```json
{
  "channelId":"<Snowflake>",
  "content":"<String>",
  "card": "<WelcomeCard>",
  "embed":"<DiscordEmbed>",
  "type":"text",
  "imageUrl":"<URL>",
  "ignoreBots":"<Boolean>",
  "components":"Array<DiscordComponent>"
}
```

I tried to tamper the `imageUrl` field with an URL that points to a simple HTML page, and when I triggered the module, a request was received:

![Got request](assets/nekotina2.webp)

And Nekotina sent this weird attachment:

![wtf](assets/nekotina3.webp)


This file had the plain response from my server, and when I tried to contact `127.0.0.1` it was also retrieving me the responses from internal services.

I reported it, but for some reason the bot devs didn't contact me back. They just solved the issue.