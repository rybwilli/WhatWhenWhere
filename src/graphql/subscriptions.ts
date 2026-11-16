// Subscriptions only signal "something changed" so the service refetches its
// server-filtered list; request the id alone so other users' occasion data
// isn't pushed to every client.
const occasionFields = `id`;

export const onCreateOccasion = /* GraphQL */ `
  subscription OnCreateOccasion { onCreateOccasion { ${occasionFields} } }
`;

export const onUpdateOccasion = /* GraphQL */ `
  subscription OnUpdateOccasion { onUpdateOccasion { ${occasionFields} } }
`;

export const onDeleteOccasion = /* GraphQL */ `
  subscription OnDeleteOccasion { onDeleteOccasion { ${occasionFields} } }
`;
