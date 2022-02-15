export const mockRandomEventResponse = {
  type: 'FeatureCollection',
  query: [0.9057401346041076, 41.2642173761493],
  features: [
    {
      id: 'address.1980669087837360',
      type: 'Feature',
      place_type: ['address'],
      relevance: 1,
      properties: { accuracy: 'point' },
      text: 'Carrer De La Miranda',
      place_name:
        'Carrer De La Miranda 9, 43360 Cornudella de Montsant, Tarragona, Spain',
      center: [0.905707568268867, 41.2642351235139],
      geometry: {
        type: 'Point',
        coordinates: [0.905707568268867, 41.2642351235139]
      },
      address: '9',
      context: [
        { id: 'postcode.15955534260835070', text: '43360' },
        {
          id: 'place.14119434259104640',
          wikidata: 'Q995601',
          text: 'Cornudella de Montsant'
        },
        {
          id: 'region.8952992544868490',
          short_code: 'ES-T',
          wikidata: 'Q98392',
          text: 'Tarragona'
        },
        {
          id: 'country.3373497261570100',
          wikidata: 'Q29',
          short_code: 'es',
          text: 'Spain'
        }
      ]
    },
    {
      id: 'postcode.15955534260835070',
      type: 'Feature',
      place_type: ['postcode'],
      relevance: 1,
      properties: {},
      text: '43360',
      place_name: '43360, Cornudella de Montsant, Tarragona, Spain',
      bbox: [0.865072, 41.207607, 0.94483, 41.326653],
      center: [0.905202, 41.265576],
      geometry: { type: 'Point', coordinates: [0.905202, 41.265576] },
      context: [
        {
          id: 'place.14119434259104640',
          wikidata: 'Q995601',
          text: 'Cornudella de Montsant'
        },
        {
          id: 'region.8952992544868490',
          short_code: 'ES-T',
          wikidata: 'Q98392',
          text: 'Tarragona'
        },
        {
          id: 'country.3373497261570100',
          wikidata: 'Q29',
          short_code: 'es',
          text: 'Spain'
        }
      ]
    },
    {
      id: 'place.14119434259104640',
      type: 'Feature',
      place_type: ['place'],
      relevance: 1,
      properties: { wikidata: 'Q995601' },
      text: 'Cornudella de Montsant',
      place_name: 'London, United Kingdom',
      bbox: [0.865072, 41.207607, 0.976122, 41.326653],
      center: [0.90504, 41.2657],
      geometry: { type: 'Point', coordinates: [0.90504, 41.2657] },
      context: [
        {
          id: 'region.8952992544868490',
          short_code: 'ES-T',
          wikidata: 'Q98392',
          text: 'Tarragona'
        },
        {
          id: 'country.3373497261570100',
          wikidata: 'Q29',
          short_code: 'es',
          text: 'Spain'
        }
      ]
    },
    {
      id: 'region.8952992544868490',
      type: 'Feature',
      place_type: ['region'],
      relevance: 1,
      properties: { short_code: 'ES-T', wikidata: 'Q98392' },
      text: 'Tarragona',
      place_name: 'Tarragona, Spain',
      bbox: [
        0.159680417971343, 40.4658160927736, 1.65354533969865, 41.5829099987745
      ],
      center: [1, 41.16667],
      geometry: { type: 'Point', coordinates: [1, 41.16667] },
      context: [
        {
          id: 'country.3373497261570100',
          wikidata: 'Q29',
          short_code: 'es',
          text: 'Spain'
        }
      ]
    },
    {
      id: 'country.3373497261570100',
      type: 'Feature',
      place_type: ['country'],
      relevance: 1,
      properties: { wikidata: 'Q29', short_code: 'uk' },
      text: 'United Kingdom',
      place_name: 'United Kingdom',
      bbox: [
        -18.26058679677, 27.549342501341, 4.42745558602024, 43.8623514995921
      ],
      center: [-4.05568501525488, 41.2948556295683],
      geometry: {
        type: 'Point',
        coordinates: [-4.05568501525488, 41.2948556295683]
      }
    }
  ],
  attribution:
    'NOTICE: © 2021 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service (https://www.mapbox.com/about/maps/). This response and the information it contains may not be retained. POI(s) provided by Foursquare.'
};
