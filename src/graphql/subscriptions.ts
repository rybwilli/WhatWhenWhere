const occasionFields = `
  id ownerSub ownerEmail ownerName title description status occasionType
  respondents whenOptions whereOptions
  finalDate finalStartTime finalEndTime finalLocation finalNotes infoText infoUrl createdAt updatedAt
`;

export const onCreateOccasion = /* GraphQL */ `
  subscription OnCreateOccasion { onCreateOccasion { ${occasionFields} } }
`;

export const onUpdateOccasion = /* GraphQL */ `
  subscription OnUpdateOccasion { onUpdateOccasion { ${occasionFields} } }
`;

export const onDeleteOccasion = /* GraphQL */ `
  subscription OnDeleteOccasion { onDeleteOccasion { id } }
`;
