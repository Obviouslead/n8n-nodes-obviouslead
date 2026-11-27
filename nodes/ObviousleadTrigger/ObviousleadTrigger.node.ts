import {
	NodeApiError,
	NodeConnectionTypes,
	type JsonObject,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

const API_BASE = 'https://obviouslead.com/api/v1';

export class ObviousleadTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Obviouslead Trigger',
		name: 'obviousleadTrigger',
		icon: { light: 'file:obviouslead.svg', dark: 'file:obviouslead.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when something happens on your Obviouslead pages',
		defaults: {
			name: 'Obviouslead Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'obviousleadApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'new_response',
				options: [
					{
						name: 'New Response',
						value: 'new_response',
						description: 'A prospect replies on one of your pages (interested or not interested)',
					},
					{
						name: 'Meeting Booked',
						value: 'meeting_booked',
						description: 'A prospect books a meeting from one of your pages',
					},
					{
						name: 'Page Viewed',
						value: 'page_viewed',
						description:
							'A prospect opens one of your pages or watches your video, without replying yet (sent once per lead per day)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) return false;
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const subscriptions = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'obviousleadApi',
					{ method: 'GET', url: `${API_BASE}/webhooks`, json: true },
				)) as IDataObject[];
				const found = (subscriptions || []).some(
					(s) => s.id === webhookData.webhookId && s.url === webhookUrl && s.event === event,
				);
				if (!found) delete webhookData.webhookId;
				return found;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'obviousleadApi', {
					method: 'POST',
					url: `${API_BASE}/webhooks`,
					body: { event, url: webhookUrl, source: 'n8n' },
					json: true,
					ignoreHttpStatusErrors: true,
					returnFullResponse: true,
				})) as { statusCode: number; body: IDataObject };
				if (response.statusCode >= 400) {
					const apiMessage = typeof response.body?.error === 'string' ? response.body.error : '';
					throw new NodeApiError(this.getNode(), (response.body ?? {}) as JsonObject, {
						httpCode: String(response.statusCode),
						message: `Obviouslead refused the webhook${apiMessage ? `: ${apiMessage}` : ''}`,
						description:
							response.statusCode === 400
								? 'Obviouslead can only send events to an n8n instance that is reachable from the internet over https. On a self-hosted n8n, set the WEBHOOK_URL environment variable to its public https address.'
								: undefined,
					});
				}
				const subscription = response.body;
				if (!subscription || !subscription.id) return false;
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = subscription.id as string;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) return true;
				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'obviousleadApi', {
						method: 'DELETE',
						url: `${API_BASE}/webhooks/${encodeURIComponent(webhookData.webhookId as string)}`,
						json: true,
					});
				} catch (error) {
					// A 404 means the subscription is already gone (key revoked or removed in Obviouslead).
					const status = (error as { httpCode?: string; statusCode?: number }).httpCode ??
						(error as { statusCode?: number }).statusCode;
					if (String(status) !== '404') throw new NodeApiError(this.getNode(), error as JsonObject);
				}
				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
