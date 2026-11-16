// Server-side filtered: only occasions the caller can access, on or after effectiveDate.
export const listOccasionsForUser = /* GraphQL */ `
  query ListOccasionsForUser($effectiveDate: AWSDate!, $nextToken: String) {
    listOccasionsForUser(effectiveDate: $effectiveDate, nextToken: $nextToken) {
      nextToken
      items {
        id ownerSub ownerEmail ownerName title description status occasionType
        respondents whenOptions whereOptions
        finalDate finalStartTime finalEndTime finalEndDate finalLocation finalNotes infoText infoUrl allowPublic playerOfDayVotes playerOfDayDeadline createdAt updatedAt
      }
    }
  }
`;

export const getOccasion = /* GraphQL */ `
  query GetOccasion($id: ID!) {
    getOccasion(id: $id) {
      id ownerSub ownerEmail ownerName title description status occasionType
      respondents whenOptions whereOptions
      finalDate finalStartTime finalEndTime finalEndDate finalLocation finalNotes infoText infoUrl allowPublic playerOfDayVotes playerOfDayDeadline createdAt updatedAt
    }
  }
`;
