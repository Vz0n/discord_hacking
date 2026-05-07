*Fixed on: ????*

[Website](https://mee6.xyz) | [Discord](https://discord.gg/mee6)

MEE6 could be considered the biggest bot across Discord, with over 20M servers using it. But many people consider it evil and sketchy to the point that there's even [a complete page](https://www.alternativestomee6.com/) that shows alternatives to the bot, and tries to expose every bad thing about it (this experience could also be added to that bad things list).

So, their login page redirects users to the intended route after logging-in by using a query parameter, but the frontend failed to prevent protocol relative redirects. Just as YAGPDB or Welcomer:

https://github.com/user-attachments/assets/929fb78d-3956-4261-9943-64070681bc2b

This could have passed as just a minor bug or an informative one, but one of the MEE6 devs answered me that the bug was out of scope following the "HackerOne program" and the rest of the message felt like "go fuck yourself".

Welp: this motherfuckers don't even have a HackerOne program, they only have [this shitty Notion site](https://mee6.notion.site/Bug-bounty-program-47c17360a9ce498d8caf37035004cf80) and there is nothing about open redirects being out of scope, that's why I bothered to report this. This just seems foolery to avoid giving me a reward, and personally I don't give a fuck about it (considering that it was "in the scope", It was only 50$, as it's a low one). The thing that gets me mad is how he threated me.

So Aleks, if you're reading this; suck my cock, you fucking liar.







