import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

// EmailConfiguration was previously set out-of-band (console/CLI), outside the
// Amplify-managed template, which meant any CloudFormation update to this stack
// silently reset it back to COGNITO_DEFAULT (Cognito's shared "no-reply@
// verificationemail.com" sender) -- exactly what happened during a routine
// EmailVerificationMessage change. Declaring it here makes it part of the
// managed template so it can no longer drift.
export function override(resources: AmplifyAuthCognitoStackTemplate) {
  if (resources.userPool) {
    resources.userPool.emailConfiguration = {
      emailSendingAccount: 'DEVELOPER',
      from: 'What?When?Where?Who? <mail@whatwhenwherewho.com>',
      sourceArn: 'arn:aws:ses:us-east-1:963108102266:identity/whatwhenwherewho.com',
    };
  }
}
