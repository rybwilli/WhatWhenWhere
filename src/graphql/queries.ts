export const listOccasions = /* GraphQL */ `
  query ListOccasions {
    listOccasions {
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
      id ownerSub ownerEmail ownerName title description status
      respondents whenOptions whereOptions
      finalDate finalStartTime finalEndTime finalEndDate finalLocation finalNotes infoText infoUrl allowPublic playerOfDayVotes playerOfDayDeadline createdAt updatedAt
    }
  }
`;
