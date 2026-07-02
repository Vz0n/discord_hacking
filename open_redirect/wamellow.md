*Fixed on: 30/06/2026*

[Website](https://wamellow.com) | [Discord](https://wamellow.com/support)

It's a multi-purpose Discord bot focused more on accessibility and fun stuff, like posting random Neko girl/[Blahaj](https://www.ikea.com/us/en/p/blahaj-soft-toy-shark-90373590/) images in channels, text-to-speech, and so on. The frontend of the bot is [open source](https://github.com/shi-gg/mellow-web).

Looking at the source code, in [`app/login/route.ts`](https://github.com/shi-gg/mellow-web/blob/1309d8e21991a43e6b68853581863844c56e8a9d/app/login/route.ts#L112-L119), I noticed this function:

```ts
function parseRedirectUrlFromState(state: string | null) {
    if (!state) return "/";

    const path = decodeURIComponent(state);
    if (path.includes("://")) return "/";

    return path || "/";
}
```

This seems like a solution that you can think by watching a normal URL, but protocol relative URLs exists and most user agents transforms a URL like `http:/google.com` into `http://google.com`. So you can easily bypass it:

https://github.com/user-attachments/assets/3750273e-06ce-4852-8a8f-f9525d1e691a

The dev said she was going to fix it in the coming days, but [she made the fix quickly](https://github.com/shi-gg/mellow-web/commit/33a61ae687beaaf2810779499c750f2432b1354e) on the day of the report. She watched me doing strange things on the API before I reported the bug, but she was nice and even added me as a co-author of the fix commit.

<img width="300" height="380" alt="Luna Seemann <luna@wamellow.com> wrote: Hello, Thank you a lot for reaching out. I was alerted to the probing due to elevated error responses in the API. I'll fix this in the coming days and add your email as a git co-author on the commit. Regarding the other bugs, I assume you tried submitting invalid role and channel IDs that either don't exist or don't belong to the guild. The API doesn't perform checks on supplied IDs beyond the regex validation you encountered, although IDs are cross-referenced at runtime. -- Mit freundlichen Grüßen / Best regards Luna Seemann" src="assets/wamellow2.jpg" />
