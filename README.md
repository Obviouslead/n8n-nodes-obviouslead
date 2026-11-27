# n8n-nodes-obviouslead

[Obviouslead](https://obviouslead.com) gives each prospect a personal page with your video and a few questions. Instead of a cold message, they get a page made for them, and you see who opened it, who watched, and who replied.

This package brings those signals into [n8n](https://n8n.io), so a reply or a booked meeting can update your CRM, alert your team or start a follow-up without copy and paste.

[Installation](#installation) · [Credentials](#credentials) · [Nodes](#nodes) · [Example workflows](#example-workflows) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install `n8n-nodes-obviouslead`.

## Credentials

1. Log in to Obviouslead and open **Integrations > n8n** in your dashboard.
2. Click **Create key** and copy the key. It starts with `ol_` and is shown only once.
3. In n8n, create an **Obviouslead API** credential and paste the key.

The Obviouslead API is available on the Basic and Pro plans. Revoking the key in Obviouslead also removes the webhooks n8n created with it.

## Nodes

### Obviouslead Trigger

Starts a workflow when one of these events happens:

| Event | When it fires |
| --- | --- |
| New Response | A prospect replies on one of your pages, interested or not |
| Meeting Booked | A prospect books a meeting from one of your pages |
| Page Viewed | A prospect opens your page or watches your video without replying yet. Sent once per lead per day |

n8n registers the webhook in Obviouslead when you activate the workflow and removes it when you deactivate it. Each event carries the lead (name, status, page URL), the event details (answers, meeting time and link, or watch progress) and a link to your dashboard.

### Obviouslead

| Resource | Operation | Description |
| --- | --- | --- |
| Lead | Get | Get one lead by its ID |
| Lead | Get Many | Get your most recent leads, newest first |

The node can also be used as a tool by n8n AI agents.

## Example workflows

- **Hot reply to Slack.** Obviouslead Trigger (New Response) > IF `data.response.decision` is `interested` > Slack message with `data.lead.name` and `data.dashboard_url`.
- **Meeting to calendar and CRM.** Obviouslead Trigger (Meeting Booked) > create a deal in your CRM with `data.meeting.starts_at` and `data.meeting.meeting_url`.
- **Follow up warm viewers.** Obviouslead Trigger (Page Viewed) > IF `data.view.watched_percent` is above 50 > add a task to call the prospect.

## Compatibility

Tested with n8n 1.x and later. Requires an Obviouslead Basic or Pro plan.

## Resources

- [Obviouslead API documentation](https://obviouslead.com/docs/api#n8n)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version history

See [CHANGELOG.md](CHANGELOG.md).
