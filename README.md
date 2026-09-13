## My Discord ecosystem hacking adventures

Since 2024, after a short series of videos made by the youtuber [No Text To Speech](https://www.youtube.com/@NoTextToSpeech) with [xyzeva](https://github.com/xyzeva) as collaborator, I decided to go and hunt bugs across all the bots and popular apps/websites in the Discord community, specially the ones that are widely recommended by many users.

I found very nasty bugs across all these apps and I documented them on this repository, moving away from [my blog](https://vzon.moe/blog) as very few people visits it (and also, the original language of the posts was Spanish, making it a bit more difficult getting known).

By viewing the repo, you should get how it's structured. Every folder's name is a class of bug and its contents are the apps where I found that type of bug. The file contains an explanation on how the bug works. The fix date in every case/writeup follows the `DD/MM/YYYY` format. 

It's interesting that there was previous people hunting for bugs in specific apps (like Carl or Dyno), and nobody caught some nasty bugs that are here. Many of them were really easy to find and exploit... at least for me.

> Yes, the cringe repo name is intentional btw

## About exploitation attempts in the wild

As far as I know, I'm the only one who got all of this. If you suspect that somebody exploited a vulnerability in this repo before the fix date, contact me with proofs. 

## FAQs that may arise

#### Did you get paid?

Yes, I got bounties from various developers. The rewards ranged from Discord Nitro to real money. (for those who want amounts, the sole `query_injection` section has 505€ worth)

#### Isn't this illegal?

Yes and no. Legally speaking, I'm in a grey area, but far away from legal stuff; would you take actions against somebody who is disclosing a security issue to you? If your answer is "yes" without even viewing logs to watch what I did and/or viewing my behavior (like, if I was demanding for a bounty to disclose the issue, that's extortion), you're completely braindead.

#### Aren't you scared of Discord?

You may ask this because you saw what happened with [BotGhost in 2025](https://www.youtube.com/watch?v=gKtqAYbGvPs), and the answer is no. I highly doubt that Discord would even care about this. (even if the entire path_cancel section bugs gave me the chance of blowing up a large portion of the platform)

*The assets (videos, images) are made by me and all rights are reserved.*

![POCK](/pock.gif)
