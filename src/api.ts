type CustomResponse = Promise<{
    status: number,
    body: never | any,
}>

type RequestType = 'GET' | 'PATCH' | 'PUT' | 'POST'

const base = '/api'

export const api = async function api(
    requestMethod: RequestType = 'GET', 
    resource: string, 
    data?: Record<string, string>
): CustomResponse {
	const res = await fetch(`${base}/${resource}`, {
		method: requestMethod,
		headers: {
			'content-type': 'application/json'
		},
		body: data && JSON.stringify(data)
	});
	return {
		status: res.status,
		body: await res.json()
	};
}