import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ObviousleadApi implements ICredentialType {
	name = 'obviousleadApi';

	displayName = 'Obviouslead API';

	icon: Icon = { light: 'file:obviouslead.svg', dark: 'file:obviouslead.dark.svg' };

	documentationUrl = 'https://obviouslead.com/docs/api#n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Create your key in Obviouslead > Integrations > n8n. It starts with "ol_". The API is available on the Basic and Pro plans.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://obviouslead.com/api/v1',
			url: '/me',
		},
	};
}
