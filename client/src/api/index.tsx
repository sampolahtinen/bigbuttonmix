import { getMapboxLocation } from './getMapboxLocation';

// type CustomResponse = Promise<{
//   status: number;
//   body: never | any;
// }>;

// type RequestType = 'GET' | 'PATCH' | 'PUT' | 'POST';

export const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://big-button-api.herokuapp.com/graphql'
    : 'http://localhost:5000/api';

// export const api = async function api(
//   requestMethod: RequestType = 'GET',
//   resource: string,
//   data?: Record<string, string>
// ): CustomResponse {
//   const res = await fetch(`${apiUrl}/${resource}`, {
//     method: requestMethod,
//     headers: {
//       'content-type': 'application/json'
//     },
//     body: data && JSON.stringify(data)
//   });
//   return {
//     status: res.status,
//     body: await res.json()
//   };
// };

export default {
  getMapboxLocation
};
