## You have raid protection? Well, I'll hack the protection!
*Fixed on: 04/01/2025*

[Website](https://wick.bot) | [Discord](https://wick.bot/support)

> Of all the vulnerabilities in this repository, this is one of the most interesting.

Wick is probably one of the most used and recommended anti raid & protection bots.

The dashboard has a function to manage Discord auto mod rules:

![Automod manager](assets/wick1.png)

When you save a rule, this is sent by `POST` to `/api/fetch/guilds/:guild_id/builtinautomod/save`

```json
{
    "data":[
        {
            "id":":rule_id",
            "name":"uwu owo",
            "event_type":1,
            "actions":[
                {
                    "type":1,
                    "metadata":{
                        "custom_message":"Nova: This word is not allowed."
                    }
                }
            ],
            "trigger_type":1,
            "enabled":true,
            "exempt_roles":[],
            "exempt_channels":[],
            "trigger_metadata":{
                "keyword_filter":["uwu"],
                "regex_patterns":[],
                "allow_list":[]
            }
        }
    ]
}
```

So, I putted a `#` at the end of the automod rule, and it was still working. Going to the Discord API docs I saw this route:


> **Modify Auto Moderation rule**
>
> `PATCH /guilds/{guild.id}/auto-moderation/rules/{auto_moderation_rule.id}`
>
> Modify an existing rule. Returns an auto moderation rule on success. Fires an Auto Moderation Rule Update Gateway event.

So, I tried to slowly go back in the patch with `../rules/<rule-id>` and so on; still working. And when I got into `/guilds`, I tried to edit a moderation rule from other server with `../../../<guild-id>/auto-moderation/rules/<rule-id>`, and it worked:

![Edited!](assets/wick2.png)

With this, I got into the API root by adding another `../`, and here it was... but there is something that is unknown to me, and is... every other field on that request that is not from Wick is sent to the Discord API? can I add other fields?

I need to test it... but even if it the second question was false, I have a `name`, and the endpoint to edit a guild `/guilds/{guilds.id}` accepts it, has no required fields and every other thing that is not an accepted field is ignored. So let's test.

At the first attempt, I didn't work, but when I made the path look uglier as it wont accept more than three `../` (`../../../a/../../guilds/<guild-id>`)... it worked:

![Edited x2](assets/wick3.png)

Now, I removed every field from the request, preserved the `name` and added a `description`, and well:

![Edited x3](assets/wick4.png)

So, I can send a `PATCH` request to anywhere with any JSON I want.

This is **extremely lethal** as this is an anti-raid bot, and it normally requires a high spot in the roles positions with admin permissions. You can even edit the application profile and their slash commands.

The dev quickly fixed the issue when he knowed about. He gave me a little scolding for using it to do things like changing a custom bot's name of a spanish Discord partner server called [Programadores y Estudiantes (PyE)](https://discord.gg/programacion) to "uwu owo"
