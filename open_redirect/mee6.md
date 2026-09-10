*Fixed on: ??/??/2026*

[Website](https://mee6.xyz) | [Discord](https://discord.gg/mee6)

MEE6 could be considered the biggest bot across Discord, with over 20M servers using it. But many people consider it evil and sketchy to the point that there's even [a complete page](https://www.alternativestomee6.com/) that shows alternatives to the bot, and tries to expose every bad thing about it.

So, their login page redirects users to the intended route after logging-in by using a query parameter, but the frontend failed to prevent protocol relative redirects. Just as YAGPDB or Welcomer:

https://github.com/user-attachments/assets/929fb78d-3956-4261-9943-64070681bc2b

Could have passed as just a minor bug or an informative one, but one of the MEE6 devs answered me that the bug was out of scope following the "HackerOne program".

Welp: this guys don't even have a HackerOne program, they only have [this Notion site](https://mee6.notion.site/Bug-bounty-program-47c17360a9ce498d8caf37035004cf80) and there is nothing about open redirects being out of scope, that's why I bothered to report this. I think that just saying "Hey, we don't consider this a security issue with impact on the site" was waay more easy than creating a big message with lies which can be easily disproved.








