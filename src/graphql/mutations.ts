const occasionFields = `
  id ownerSub ownerEmail ownerName title description status occasionType
  respondents whenOptions whereOptions
  finalDate finalStartTime finalEndTime finalEndDate finalLocation finalNotes infoText infoUrl allowPublic createdAt updatedAt
`;

export const createOccasion = /* GraphQL */ `
  mutation CreateOccasion($input: CreateOccasionInput!) {
    createOccasion(input: $input) { ${occasionFields} }
  }
`;

export const updateOccasion = /* GraphQL */ `
  mutation UpdateOccasion($input: UpdateOccasionInput!) {
    updateOccasion(input: $input) { ${occasionFields} }
  }
`;

export const deleteOccasion = /* GraphQL */ `
  mutation DeleteOccasion($input: DeleteOccasionInput!) {
    deleteOccasion(input: $input) { id }
  }
`;
