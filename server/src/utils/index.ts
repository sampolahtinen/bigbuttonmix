import xml2js from 'xml2js'

export const parseList = async (rawData) => {
  try {
    const parsedResponse = await xml2js.parseStringPromise(rawData)
    const listItems =
      parsedResponse['soap:Envelope']['soap:Body'][0].GetListItemsResponse[0]
        .GetListItemsResult[0].listitems[0]['rs:data'][0]['z:row']
    const parsedListItems = listItems.map((item) => item['$'])
    return parsedListItems
  } catch (error) {
    console.log(error)
    throw new Error(JSON.stringify(error))
  }
}

export default {
  parseList,
}

export const isDev = process.env.NODE_ENV === 'development'
