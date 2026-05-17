const occasionFields = `
  id ownerSub ownerEmail ownerName title description status
  respondents whenOptions whereOptions
  finalDate finalLocation finalNotes createdAt updatedAt
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
