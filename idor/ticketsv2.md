## Hey, you can't put th- oh it's disabled, go ahead then.
*Fixed on: ??/04/2026*

[Website](https://tickets.bot) | [Discord](https://discord.gg/ticketsbot)

It's another ticket management system, and as I know, is a continuation of another discontinued tickets bot.

On their dashboard, when you create a ticket panel, you have various options to set:

![Panel options](assets/tickets1.png)

The settings are saved via a `PATCH` to `/api/:guild_id/panels/:panel_id` with the following data:

```json
{
    "message_id":"<Snowflake>",
    "channel_id":"<Snowflake>",
    "title":"<String>",
    "content":"<String>",
    "colour":"<Integer>",
    "category_id":"<Snowflake>",
    "welcome_message_embed":"<Integer>",
    "default_team":"<Boolean>",
    "custom_id":"<String>",
    "button_style":"Enum<ButtonStyle>",
    "button_label":"<String>",
    "form_id":null,
    "naming_scheme":null,
    "force_disabled":"<Boolean>",
    "disabled":"<Boolean>",
    "exit_survey_form_id":null,
    "pending_category":null,
    "delete_mentions":"<Boolean>",
    "transcript_channel_id":"<Snowflake>",
    "use_threads":"<Boolean>",
    "cooldown_seconds":0,
    "ticket_limit":0,
    "hide_close_button":"<Boolean>",
    "hide_close_with_reason_button":"<Boolean>",
    "hide_claim_button":"<Boolean>",
    "welcome_message":{ 
        // [snip]
    },
    "use_custom_emoji":"<Boolean>",
    "emote":"<Emoji>",
    "mentions":null,
    "teams":[],
    "use_server_default_naming_scheme":"<Boolean>",
    "access_control_list":"Array<RoleAccessControl>",
    "has_support_hours":"<Boolean>",
    "is_currently_active":"<Boolean>",
    "ticket_permissions":{
        // [snip]
    },
    "support_hours":"<PanelSupportHours>",
    "ticket_notification_channel":null
}
```

I tried to put a random number in `transcript_channel_id` and it worked, also with a channel ID from another guild. That allowed me to send the transcript message to other channels where probably I can't write.

Now, with the `ticket_notification_channel` field this also happened, but only if the `use_threads` field was set to true, and there was a global option for enabling threads even if the panel explicitly had it disabled. I can do the same as above but with the notification messages (when a ticket is opened, and so on)

![weird behaviour](assets/tickets2.png)

Don't know how much the dev took to fix it, as an admin got mad at me for using this on a public channel (to prove that you can do what i'm saying) and closed the ticket. But yeah, it's fixed now.