const occasionFields = `
  id ownerSub ownerEmail ownerName title description status occasionType
  respondents whenOptions whereOptions
  finalDate finalStartTime finalEndTime finalEndDate finalLocation finalNotes infoText infoUrl allowPublic playerOfDayVotes playerOfDayDeadline createdAt updatedAt
`;

export const createOccasion = /* GraphQL */ `
  mutation CreateOccasion($input: CreateOccasionInput!) {
    createOccasion(input: $input) { ${occasionFields} }
  }
`;

// Server-checked: organizers may edit anything; other participants only their
// own votes / joining a public occasion. Fails with ConflictError on a
// simultaneous write (retry).
export const editOccasion = /* GraphQL */ `
  mutation EditOccasion($input: EditOccasionInput!) {
    editOccasion(input: $input) { ${occasionFields} }
  }
`;

// Organizers only.
export const removeOccasion = /* GraphQL */ `
  mutation RemoveOccasion($id: ID!) {
    removeOccasion(id: $id) { id }
  }
`;
