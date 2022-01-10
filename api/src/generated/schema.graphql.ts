/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

import type * as t from "./../typeDefs"
import type { Context } from "./../context"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Artist: { // root type
    id?: string | null; // String
    name?: string | null; // String
    soundcloudUrl?: string | null; // String
  }
  Event: { // root type
    address?: string | null; // String
    artists?: Array<NexusGenRootTypes['Artist'] | null> | null; // [Artist]
    date?: string | null; // String
    eventUrl?: string | null; // String
    id?: string | null; // String
    openingHours?: string | null; // String
    randomEventScLink?: string | null; // String
    randomTrack?: NexusGenRootTypes['SoundCloudMeta'] | null; // SoundCloudMeta
    title?: string | null; // String
    venue?: string | null; // String
  }
  Query: {};
  SoundCloudMeta: t.SoundCloudMeta;
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Artist: { // field return type
    id: string | null; // String
    name: string | null; // String
    soundcloudUrl: string | null; // String
  }
  Event: { // field return type
    address: string | null; // String
    artists: Array<NexusGenRootTypes['Artist'] | null> | null; // [Artist]
    date: string | null; // String
    eventUrl: string | null; // String
    id: string | null; // String
    openingHours: string | null; // String
    randomEventScLink: string | null; // String
    randomTrack: NexusGenRootTypes['SoundCloudMeta'] | null; // SoundCloudMeta
    title: string | null; // String
    venue: string | null; // String
  }
  Query: { // field return type
    randomEvent: NexusGenRootTypes['Event'] | null; // Event
  }
  SoundCloudMeta: { // field return type
    author_url: string | null; // String
    description: string | null; // String
    thumbnail_url: string | null; // String
    title: string | null; // String
    track_url: string | null; // String
    widget_src: string | null; // String
  }
}

export interface NexusGenFieldTypeNames {
  Artist: { // field return type name
    id: 'String'
    name: 'String'
    soundcloudUrl: 'String'
  }
  Event: { // field return type name
    address: 'String'
    artists: 'Artist'
    date: 'String'
    eventUrl: 'String'
    id: 'String'
    openingHours: 'String'
    randomEventScLink: 'String'
    randomTrack: 'SoundCloudMeta'
    title: 'String'
    venue: 'String'
  }
  Query: { // field return type name
    randomEvent: 'Event'
  }
  SoundCloudMeta: { // field return type name
    author_url: 'String'
    description: 'String'
    thumbnail_url: 'String'
    title: 'String'
    track_url: 'String'
    widget_src: 'String'
  }
}

export interface NexusGenArgTypes {
  Query: {
    randomEvent: { // args
      autoPlay?: boolean | null; // Boolean
      city: string; // String!
      country: string; // String!
      date: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}