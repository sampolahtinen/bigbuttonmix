import axios, { AxiosRequestConfig } from 'axios'
import cookie from 'cookie'

/**
 * On initial sign in, we pass SharePoint username and password. ON success user gets to the info-screen
 * After that, the function utilizes service account username / password configured in the .env file
 * Consult SharePoint admins or Ilkka for the credentials
 */
export const getFedAuthCookie = async (
  username?: string,
  password?: string
) => {
  const {
    SERVICE_ACCOUNT_USERNAME,
    SERVICE_ACCOUNT_PASSWORD
  } = process.env
  
  const authEnvelope = `<?xml version="1.0" encoding="utf-8"?>\r\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\r\n  <soap:Body>\r\n    <Login xmlns="http://schemas.microsoft.com/sharepoint/soap/">\r\n      <username>${username || SERVICE_ACCOUNT_USERNAME}</username>\r\n      <password>${password || SERVICE_ACCOUNT_PASSWORD}</password>\r\n    </Login>\r\n  </soap:Body>\r\n</soap:Envelope>`

  const config = {
    method: 'post',
    url: 'https://secure.taloyhtio.info/10p/_vti_bin/authentication.asmx',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
    },
    data: authEnvelope,
  } as AxiosRequestConfig
  const response = await axios(config)
  if (response.data.includes('<ErrorCode>PasswordNotMatch</ErrorCode>')) {
    throw new Error(JSON.stringify(response.data))
  }

  const parsedCookie = cookie.parse(response.headers['set-cookie'][0])

  return parsedCookie.FedAuth
}

export default {
  getFedAuthCookie,
}
