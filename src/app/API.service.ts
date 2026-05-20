/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.
import { Injectable } from "@angular/core";
import API, { graphqlOperation, GraphQLResult } from "@aws-amplify/api-graphql";
import { Observable } from "zen-observable-ts";

export interface SubscriptionResponse<T> {
  value: GraphQLResult<T>;
}

export type __SubscriptionContainer = {
  onCreateOccasion: OnCreateOccasionSubscription;
  onUpdateOccasion: OnUpdateOccasionSubscription;
  onDeleteOccasion: OnDeleteOccasionSubscription;
};

export type CreateOccasionInput = {
  id?: string | null;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
};

export type ModelOccasionConditionInput = {
  ownerSub?: ModelStringInput | null;
  ownerEmail?: ModelStringInput | null;
  ownerName?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  status?: ModelStringInput | null;
  occasionType?: ModelStringInput | null;
  respondents?: ModelStringInput | null;
  whenOptions?: ModelStringInput | null;
  whereOptions?: ModelStringInput | null;
  finalDate?: ModelStringInput | null;
  finalStartTime?: ModelStringInput | null;
  finalEndTime?: ModelStringInput | null;
  finalLocation?: ModelStringInput | null;
  finalNotes?: ModelStringInput | null;
  infoText?: ModelStringInput | null;
  infoUrl?: ModelStringInput | null;
  and?: Array<ModelOccasionConditionInput | null> | null;
  or?: Array<ModelOccasionConditionInput | null> | null;
  not?: ModelOccasionConditionInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type ModelStringInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null"
}

export type ModelSizeInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
};

export type Occasion = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateOccasionInput = {
  id: string;
  ownerSub?: string | null;
  ownerEmail?: string | null;
  ownerName?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
};

export type DeleteOccasionInput = {
  id: string;
};

export type ModelOccasionFilterInput = {
  id?: ModelIDInput | null;
  ownerSub?: ModelStringInput | null;
  ownerEmail?: ModelStringInput | null;
  ownerName?: ModelStringInput | null;
  title?: ModelStringInput | null;
  description?: ModelStringInput | null;
  status?: ModelStringInput | null;
  occasionType?: ModelStringInput | null;
  respondents?: ModelStringInput | null;
  whenOptions?: ModelStringInput | null;
  whereOptions?: ModelStringInput | null;
  finalDate?: ModelStringInput | null;
  finalStartTime?: ModelStringInput | null;
  finalEndTime?: ModelStringInput | null;
  finalLocation?: ModelStringInput | null;
  finalNotes?: ModelStringInput | null;
  infoText?: ModelStringInput | null;
  infoUrl?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelOccasionFilterInput | null> | null;
  or?: Array<ModelOccasionFilterInput | null> | null;
  not?: ModelOccasionFilterInput | null;
};

export type ModelIDInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export type ModelOccasionConnection = {
  __typename: "ModelOccasionConnection";
  items: Array<Occasion | null>;
  nextToken?: string | null;
};

export type ModelSubscriptionOccasionFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  ownerSub?: ModelSubscriptionStringInput | null;
  ownerEmail?: ModelSubscriptionStringInput | null;
  ownerName?: ModelSubscriptionStringInput | null;
  title?: ModelSubscriptionStringInput | null;
  description?: ModelSubscriptionStringInput | null;
  status?: ModelSubscriptionStringInput | null;
  occasionType?: ModelSubscriptionStringInput | null;
  respondents?: ModelSubscriptionStringInput | null;
  whenOptions?: ModelSubscriptionStringInput | null;
  whereOptions?: ModelSubscriptionStringInput | null;
  finalDate?: ModelSubscriptionStringInput | null;
  finalStartTime?: ModelSubscriptionStringInput | null;
  finalEndTime?: ModelSubscriptionStringInput | null;
  finalLocation?: ModelSubscriptionStringInput | null;
  finalNotes?: ModelSubscriptionStringInput | null;
  infoText?: ModelSubscriptionStringInput | null;
  infoUrl?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionOccasionFilterInput | null> | null;
  or?: Array<ModelSubscriptionOccasionFilterInput | null> | null;
};

export type ModelSubscriptionIDInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  in?: Array<string | null> | null;
  notIn?: Array<string | null> | null;
};

export type ModelSubscriptionStringInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  in?: Array<string | null> | null;
  notIn?: Array<string | null> | null;
};

export type CreateOccasionMutation = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateOccasionMutation = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeleteOccasionMutation = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetOccasionQuery = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListOccasionsQuery = {
  __typename: "ModelOccasionConnection";
  items: Array<{
    __typename: "Occasion";
    id: string;
    ownerSub: string;
    ownerEmail: string;
    ownerName: string;
    title: string;
    description: string;
    status: string;
    occasionType?: string | null;
    respondents?: string | null;
    whenOptions?: string | null;
    whereOptions?: string | null;
    finalDate?: string | null;
    finalStartTime?: string | null;
    finalEndTime?: string | null;
    finalLocation?: string | null;
    finalNotes?: string | null;
    infoText?: string | null;
    infoUrl?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null>;
  nextToken?: string | null;
};

export type OnCreateOccasionSubscription = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnUpdateOccasionSubscription = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnDeleteOccasionSubscription = {
  __typename: "Occasion";
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable({
  providedIn: "root"
})
export class APIService {
  async CreateOccasion(
    input: CreateOccasionInput,
    condition?: ModelOccasionConditionInput
  ): Promise<CreateOccasionMutation> {
    const statement = `mutation CreateOccasion($input: CreateOccasionInput!, $condition: ModelOccasionConditionInput) {
        createOccasion(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <CreateOccasionMutation>response.data.createOccasion;
  }
  async UpdateOccasion(
    input: UpdateOccasionInput,
    condition?: ModelOccasionConditionInput
  ): Promise<UpdateOccasionMutation> {
    const statement = `mutation UpdateOccasion($input: UpdateOccasionInput!, $condition: ModelOccasionConditionInput) {
        updateOccasion(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <UpdateOccasionMutation>response.data.updateOccasion;
  }
  async DeleteOccasion(
    input: DeleteOccasionInput,
    condition?: ModelOccasionConditionInput
  ): Promise<DeleteOccasionMutation> {
    const statement = `mutation DeleteOccasion($input: DeleteOccasionInput!, $condition: ModelOccasionConditionInput) {
        deleteOccasion(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <DeleteOccasionMutation>response.data.deleteOccasion;
  }
  async GetOccasion(id: string): Promise<GetOccasionQuery> {
    const statement = `query GetOccasion($id: ID!) {
        getOccasion(id: $id) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {
      id
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <GetOccasionQuery>response.data.getOccasion;
  }
  async ListOccasions(
    filter?: ModelOccasionFilterInput,
    limit?: number,
    nextToken?: string
  ): Promise<ListOccasionsQuery> {
    const statement = `query ListOccasions($filter: ModelOccasionFilterInput, $limit: Int, $nextToken: String) {
        listOccasions(filter: $filter, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            id
            ownerSub
            ownerEmail
            ownerName
            title
            description
            status
            occasionType
            respondents
            whenOptions
            whereOptions
            finalDate
            finalStartTime
            finalEndTime
            finalLocation
            finalNotes
            infoText
            infoUrl
            createdAt
            updatedAt
          }
          nextToken
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    if (limit) {
      gqlAPIServiceArguments.limit = limit;
    }
    if (nextToken) {
      gqlAPIServiceArguments.nextToken = nextToken;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <ListOccasionsQuery>response.data.listOccasions;
  }
  OnCreateOccasionListener(
    filter?: ModelSubscriptionOccasionFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateOccasion">>
  > {
    const statement = `subscription OnCreateOccasion($filter: ModelSubscriptionOccasionFilterInput) {
        onCreateOccasion(filter: $filter) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    return API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    ) as Observable<
      SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateOccasion">>
    >;
  }

  OnUpdateOccasionListener(
    filter?: ModelSubscriptionOccasionFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateOccasion">>
  > {
    const statement = `subscription OnUpdateOccasion($filter: ModelSubscriptionOccasionFilterInput) {
        onUpdateOccasion(filter: $filter) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    return API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    ) as Observable<
      SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateOccasion">>
    >;
  }

  OnDeleteOccasionListener(
    filter?: ModelSubscriptionOccasionFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteOccasion">>
  > {
    const statement = `subscription OnDeleteOccasion($filter: ModelSubscriptionOccasionFilterInput) {
        onDeleteOccasion(filter: $filter) {
          __typename
          id
          ownerSub
          ownerEmail
          ownerName
          title
          description
          status
          occasionType
          respondents
          whenOptions
          whereOptions
          finalDate
          finalStartTime
          finalEndTime
          finalLocation
          finalNotes
          infoText
          infoUrl
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    return API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    ) as Observable<
      SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteOccasion">>
    >;
  }
}
