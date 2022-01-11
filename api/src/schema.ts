import { makeSchema, nullabilityGuardPlugin } from 'nexus';
import * as path from 'path';
import * as types from './graphql';

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.join(__dirname, '/generated/nexus-typegen.ts'),
    typegen: path.join(__dirname, '/generated/schema.graphql.ts')
  },
  sourceTypes: {
    modules: [
      {
        module: path.join(__dirname, 'typeDefs.ts'),
        alias: 't'
      }
    ]
  },
  contextType: {
    module: path.join(__dirname, 'context.ts'),
    export: 'Context'
  }

  // plugins: [
  //   nullabilityGuardPlugin({
  //     shouldGuard: true,
  //     fallbackValues: {
  //       String: () => '',
  //       ID: () => 'MISSING_ID',
  //       Boolean: () => true
  //     }
  //   })
  // ],
  // sourceTypes: {
  //   modules: [
  //     {
  //       module: path.join(__dirname, 'types', 'backingTypes.ts'),
  //       alias: 'swapi'
  //     }
  //   ]
  // },
  // contextType: {
  //   module: path.join(__dirname, 'types', 'context.ts'),
  //   export: 'ContextType'
  // },
  // prettierConfig: require.resolve('../../../.prettierrc'),
  // features: {
  //   abstractTypeStrategies: {
  //     resolveType: true
  //   }
  // }
});
