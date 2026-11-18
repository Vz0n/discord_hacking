<!-- P5 -->
*Fixed on: ??/??/2026*

[Website](https://mee6.xyz) | [Discord](https://discord.gg/mee6)

MEE6 could be considered the biggest bot across Discord, with over 20M servers using it. But many people consider it evil and sketchy to the point that there's even [a complete page](https://www.alternativestomee6.com/) that shows alternatives to the bot, and tries to expose every bad thing about it.

So, their login page redirects users to the intended route after logging-in by using a query parameter, but the frontend failed to prevent protocol relative redirects. Just as YAGPDB or Welcomer:

https://github.com/user-attachments/assets/929fb78d-3956-4261-9943-64070681bc2b

Could have passed as just a minor bug or an informative one, but one of the MEE6 devs answered me with a big chunk of text to say that the bug was out of scope following the HackerOne program. Turns out that indeed, they seemingly have a private HackerOne program (platform which has strict rules, and specifically considers this bug out of scope if the impact is just phishing in the core inelligible findings).

I think that they must update [this Notion site](https://mee6.notion.site/Bug-bounty-program-47c17360a9ce498d8caf37035004cf80) to reflect that, because I only bothered to report this because I didn't think of it (but I wasn't expecting something anyways).







