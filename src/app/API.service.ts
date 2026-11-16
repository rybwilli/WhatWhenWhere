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
  onCreateUserProfile: OnCreateUserProfileSubscription;
  onUpdateUserProfile: OnUpdateUserProfileSubscription;
  onDeleteUserProfile: OnDeleteUserProfileSubscription;
};

export type EditOccasionInput = {
  id: string;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserProfileInput = {
  id?: string | null;
  ownerSub: string;
  phone?: string | null;
};

export type ModelUserProfileConditionInput = {
  ownerSub?: ModelStringInput | null;
  phone?: ModelStringInput | null;
  and?: Array<ModelUserProfileConditionInput | null> | null;
  or?: Array<ModelUserProfileConditionInput | null> | null;
  not?: ModelUserProfileConditionInput | null;
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

export type UserProfile = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileInput = {
  id: string;
  ownerSub?: string | null;
  phone?: string | null;
};

export type DeleteUserProfileInput = {
  id: string;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
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
  finalEndDate?: ModelStringInput | null;
  finalLocation?: ModelStringInput | null;
  finalNotes?: ModelStringInput | null;
  infoText?: ModelStringInput | null;
  infoUrl?: ModelStringInput | null;
  allowPublic?: ModelBooleanInput | null;
  playerOfDayVotes?: ModelStringInput | null;
  playerOfDayDeadline?: ModelStringInput | null;
  and?: Array<ModelOccasionConditionInput | null> | null;
  or?: Array<ModelOccasionConditionInput | null> | null;
  not?: ModelOccasionConditionInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
};

export type ModelBooleanInput = {
  ne?: boolean | null;
  eq?: boolean | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
};

export type OccasionPage = {
  __typename: "OccasionPage";
  items: Array<Occasion>;
  nextToken?: string | null;
};

export type ModelUserProfileFilterInput = {
  id?: ModelIDInput | null;
  ownerSub?: ModelStringInput | null;
  phone?: ModelStringInput | null;
  createdAt?: ModelStringInput | null;
  updatedAt?: ModelStringInput | null;
  and?: Array<ModelUserProfileFilterInput | null> | null;
  or?: Array<ModelUserProfileFilterInput | null> | null;
  not?: ModelUserProfileFilterInput | null;
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

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection";
  items: Array<UserProfile | null>;
  nextToken?: string | null;
};

export type ModelSubscriptionUserProfileFilterInput = {
  id?: ModelSubscriptionIDInput | null;
  ownerSub?: ModelSubscriptionStringInput | null;
  phone?: ModelSubscriptionStringInput | null;
  createdAt?: ModelSubscriptionStringInput | null;
  updatedAt?: ModelSubscriptionStringInput | null;
  and?: Array<ModelSubscriptionUserProfileFilterInput | null> | null;
  or?: Array<ModelSubscriptionUserProfileFilterInput | null> | null;
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

export type EditOccasionMutation = {
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RemoveOccasionMutation = {
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserProfileMutation = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileMutation = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeleteUserProfileMutation = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetAccessibleOccasionQuery = {
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListOccasionsForUserQuery = {
  __typename: "OccasionPage";
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
    finalEndDate?: string | null;
    finalLocation?: string | null;
    finalNotes?: string | null;
    infoText?: string | null;
    infoUrl?: string | null;
    allowPublic?: boolean | null;
    playerOfDayVotes?: string | null;
    playerOfDayDeadline?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  nextToken?: string | null;
};

export type GetUserProfileQuery = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListUserProfilesQuery = {
  __typename: "ModelUserProfileConnection";
  items: Array<{
    __typename: "UserProfile";
    id: string;
    ownerSub: string;
    phone?: string | null;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
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
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnCreateUserProfileSubscription = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnUpdateUserProfileSubscription = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnDeleteUserProfileSubscription = {
  __typename: "UserProfile";
  id: string;
  ownerSub: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable({
  providedIn: "root"
})
export class APIService {
  async EditOccasion(input: EditOccasionInput): Promise<EditOccasionMutation> {
    const statement = `mutation EditOccasion($input: EditOccasionInput!) {
        editOccasion(input: $input) {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
          createdAt
          updatedAt
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <EditOccasionMutation>response.data.editOccasion;
  }
  async RemoveOccasion(id: string): Promise<RemoveOccasionMutation> {
    const statement = `mutation RemoveOccasion($id: ID!) {
        removeOccasion(id: $id) {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
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
    return <RemoveOccasionMutation>response.data.removeOccasion;
  }
  async CreateUserProfile(
    input: CreateUserProfileInput,
    condition?: ModelUserProfileConditionInput
  ): Promise<CreateUserProfileMutation> {
    const statement = `mutation CreateUserProfile($input: CreateUserProfileInput!, $condition: ModelUserProfileConditionInput) {
        createUserProfile(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          phone
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
    return <CreateUserProfileMutation>response.data.createUserProfile;
  }
  async UpdateUserProfile(
    input: UpdateUserProfileInput,
    condition?: ModelUserProfileConditionInput
  ): Promise<UpdateUserProfileMutation> {
    const statement = `mutation UpdateUserProfile($input: UpdateUserProfileInput!, $condition: ModelUserProfileConditionInput) {
        updateUserProfile(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          phone
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
    return <UpdateUserProfileMutation>response.data.updateUserProfile;
  }
  async DeleteUserProfile(
    input: DeleteUserProfileInput,
    condition?: ModelUserProfileConditionInput
  ): Promise<DeleteUserProfileMutation> {
    const statement = `mutation DeleteUserProfile($input: DeleteUserProfileInput!, $condition: ModelUserProfileConditionInput) {
        deleteUserProfile(input: $input, condition: $condition) {
          __typename
          id
          ownerSub
          phone
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
    return <DeleteUserProfileMutation>response.data.deleteUserProfile;
  }
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
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
  async GetAccessibleOccasion(id: string): Promise<GetAccessibleOccasionQuery> {
    const statement = `query GetAccessibleOccasion($id: ID!) {
        getAccessibleOccasion(id: $id) {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
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
    return <GetAccessibleOccasionQuery>response.data.getAccessibleOccasion;
  }
  async ListOccasionsForUser(
    effectiveDate: string,
    limit?: number,
    nextToken?: string
  ): Promise<ListOccasionsForUserQuery> {
    const statement = `query ListOccasionsForUser($effectiveDate: AWSDate!, $limit: Int, $nextToken: String) {
        listOccasionsForUser(
          effectiveDate: $effectiveDate
          limit: $limit
          nextToken: $nextToken
        ) {
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
            finalEndDate
            finalLocation
            finalNotes
            infoText
            infoUrl
            allowPublic
            playerOfDayVotes
            playerOfDayDeadline
            createdAt
            updatedAt
          }
          nextToken
        }
      }`;
    const gqlAPIServiceArguments: any = {
      effectiveDate
    };
    if (limit) {
      gqlAPIServiceArguments.limit = limit;
    }
    if (nextToken) {
      gqlAPIServiceArguments.nextToken = nextToken;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <ListOccasionsForUserQuery>response.data.listOccasionsForUser;
  }
  async GetUserProfile(id: string): Promise<GetUserProfileQuery> {
    const statement = `query GetUserProfile($id: ID!) {
        getUserProfile(id: $id) {
          __typename
          id
          ownerSub
          phone
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
    return <GetUserProfileQuery>response.data.getUserProfile;
  }
  async ListUserProfiles(
    filter?: ModelUserProfileFilterInput,
    limit?: number,
    nextToken?: string
  ): Promise<ListUserProfilesQuery> {
    const statement = `query ListUserProfiles($filter: ModelUserProfileFilterInput, $limit: Int, $nextToken: String) {
        listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            id
            ownerSub
            phone
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
    return <ListUserProfilesQuery>response.data.listUserProfiles;
  }
  OnCreateOccasionListener: Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateOccasion">>
  > = API.graphql(
    graphqlOperation(
      `subscription OnCreateOccasion {
        onCreateOccasion {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
          createdAt
          updatedAt
        }
      }`
    )
  ) as Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateOccasion">>
  >;

  OnUpdateOccasionListener: Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateOccasion">>
  > = API.graphql(
    graphqlOperation(
      `subscription OnUpdateOccasion {
        onUpdateOccasion {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
          createdAt
          updatedAt
        }
      }`
    )
  ) as Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateOccasion">>
  >;

  OnDeleteOccasionListener: Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteOccasion">>
  > = API.graphql(
    graphqlOperation(
      `subscription OnDeleteOccasion {
        onDeleteOccasion {
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
          finalEndDate
          finalLocation
          finalNotes
          infoText
          infoUrl
          allowPublic
          playerOfDayVotes
          playerOfDayDeadline
          createdAt
          updatedAt
        }
      }`
    )
  ) as Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteOccasion">>
  >;

  OnCreateUserProfileListener(
    filter?: ModelSubscriptionUserProfileFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateUserProfile">>
  > {
    const statement = `subscription OnCreateUserProfile($filter: ModelSubscriptionUserProfileFilterInput) {
        onCreateUserProfile(filter: $filter) {
          __typename
          id
          ownerSub
          phone
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
      SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateUserProfile">>
    >;
  }

  OnUpdateUserProfileListener(
    filter?: ModelSubscriptionUserProfileFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateUserProfile">>
  > {
    const statement = `subscription OnUpdateUserProfile($filter: ModelSubscriptionUserProfileFilterInput) {
        onUpdateUserProfile(filter: $filter) {
          __typename
          id
          ownerSub
          phone
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
      SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateUserProfile">>
    >;
  }

  OnDeleteUserProfileListener(
    filter?: ModelSubscriptionUserProfileFilterInput
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteUserProfile">>
  > {
    const statement = `subscription OnDeleteUserProfile($filter: ModelSubscriptionUserProfileFilterInput) {
        onDeleteUserProfile(filter: $filter) {
          __typename
          id
          ownerSub
          phone
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
      SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteUserProfile">>
    >;
  }
}
