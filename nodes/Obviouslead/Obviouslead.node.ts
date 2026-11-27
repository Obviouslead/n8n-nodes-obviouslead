import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class Obviouslead implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Obviouslead',
		name: 'obviouslead',
		icon: { light: 'file:obviouslead.svg', dark: 'file:obviouslead.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get your Obviouslead leads (prospect pages)',
		defaults: {
			name: 'Obviouslead',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'obviousleadApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://obviouslead.com/api/v1',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Lead',
						value: 'lead',
					},
				],
				default: 'lead',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['lead'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get a lead',
						description: 'Get a lead by its ID',
						routing: {
							request: {
								method: 'GET',
								url: '=/leads/{{encodeURIComponent($parameter.leadId)}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many leads',
						description: 'Get your most recent leads',
						routing: {
							request: {
								method: 'GET',
								url: '/leads',
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['get'] } },
				default: '',
				description: 'The ID of the lead to get',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['lead'], operation: ['getAll'] } },
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				routing: {
					send: {
						paginate: '={{ $value }}',
						type: 'query',
						property: 'limit',
						value: '100',
					},
					operations: {
						pagination: {
							type: 'generic',
							properties: {
								continue: '={{ $response.body.length === 100 }}',
								request: {
									qs: {
										limit: 100,
										page: '={{ ($request.qs?.page ?? 1) + 1 }}',
									},
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['lead'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
				routing: {
					send: {
						type: 'query',
						property: 'limit',
					},
				},
			},
		],
	};
}
