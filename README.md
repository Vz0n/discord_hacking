## My Discord ecosystem hacking adventures

Since 2024, after a short series of videos made by the youtuber [No Text To Speech](https://www.youtube.com/@NoTextToSpeech) with [xyzeva](https://github.com/xyzeva) as collaborator, I decided to go and hunt bugs across all the bots and popular apps/websites in the Discord community, especially the ones that are widely recommended by many users.

I found very nasty bugs across all these apps and I documented them on this repository, moving away from [my blog](https://vzon.moe/blog) as very few people visit it (and also, the original language of the posts was Spanish, making it a bit more difficult getting known).

By viewing the repo, you should get how it's structured. Every folder's name is a class of bug and its contents are the apps where I found that type of bug. The file contains an explanation on how the bug works. The fix date in every case/writeup follows the `DD/MM/YYYY` format. 

It's interesting that there were previous people hunting for bugs in specific apps (like Carl or Dyno), and nobody caught some bugs that are here. Many of them were really easy to find and exploit... at least for me.

> Yes, the cringe repo name is intentional btw

## About exploitation attempts in the wild

As far as I know, I'm the only one who got all of this. If you suspect that somebody exploited a vulnerability in this repo before the fix date, contact me with proofs. 

## FAQs that may arise

#### Did you get paid?

Yes, I got bounties from various developers. The rewards ranged from Discord Nitro to real money.

#### Isn't this illegal?

Yes and no. Legally speaking, I'm in a grey area, but far away from legal stuff; would you take actions against somebody who is disclosing a security issue to you? If your answer is "yes" without even viewing logs to watch what I did and/or viewing my behavior (like, if I was demanding for a bounty to disclose the issue, that's extortion), you're completely braindead.

#### Aren't you scared of Discord?

You may ask this because you saw what happened with [BotGhost in 2025](https://www.youtube.com/watch?v=gKtqAYbGvPs), and the answer is no. I highly doubt that Discord would even care about this. (even if the entire path_cancel section bugs gave me the chance of blowing up a large portion of the platform)

#### Do you have a team or something?

No, I work completely alone as stated above the FAQs section. I don't want to team with other people also.

## Final disclaimer

Everything here was responsibly disclosed and testing was kept to what was necessary. Don't use any of this to exploit live systems and do mischievous stuff, you **will** get in a real trouble and I'm not going to be responsible for that misuse. 

The main intention of this repository and the work is to help Discord apps devs to protect their services and of course, showcase findings. Various developers only have those bots as side project/hobbies and don't have strong security standards (even with AI), and some of these projects have access/control over a big amount of data across the Discord platform.

Not only are the obvious e-gangsters and scammers around, there are also bad people that only report issues if they get paid a big amount of money or directly exploit it and extort with them. The [Double Counter breach](https://doublecounter.gg/blog/security-incident-october-2026) and the [Sapphire image repository hack](https://github.com/Sapphire-Discord-Bot/images/commit/540d8deb48662d6c00011096e26185f6f60b9e5d) (I really hate to have missed that image repository) are two examples of this.

![POCK](/pock.gif)

*The assets (videos, images) are made by me and all rights are reserved.*
