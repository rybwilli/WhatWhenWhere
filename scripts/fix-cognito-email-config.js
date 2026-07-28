#!/usr/bin/env node
// EmailConfiguration (SES sending) was set out-of-band, outside Amplify's
// managed CloudFormation template, so any deploy that updates the auth stack
// can silently reset it back to COGNITO_DEFAULT (Cognito's shared
// no-reply@verificationemail.com sender). This runs after every build to
// detect that drift and restore the correct SES config, carrying forward
// every other User Pool setting exactly as it currently is.
const {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
  UpdateUserPoolCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const USER_POOL_ID = 'us-east-1_pWeKyVhP9';
const REGION = 'us-east-1';
const DESIRED_EMAIL_CONFIG = {
  SourceArn: 'arn:aws:ses:us-east-1:963108102266:identity/whatwhenwherewho.com',
  From: 'What?When?Where?Who? <mail@whatwhenwherewho.com>',
  EmailSendingAccount: 'DEVELOPER',
};

async function main() {
  const client = new CognitoIdentityProviderClient({ region: REGION });

  const { UserPool: up } = await client.send(new DescribeUserPoolCommand({ UserPoolId: USER_POOL_ID }));

  const current = up.EmailConfiguration || {};
  if (
    current.EmailSendingAccount === DESIRED_EMAIL_CONFIG.EmailSendingAccount &&
    current.SourceArn === DESIRED_EMAIL_CONFIG.SourceArn
  ) {
    console.log('Cognito EmailConfiguration already correct, nothing to do.');
    return;
  }

  console.log('Cognito EmailConfiguration drifted to', JSON.stringify(current), '- restoring SES config...');

  const update = {
    UserPoolId: USER_POOL_ID,
    Policies: up.Policies,
    DeletionProtection: up.DeletionProtection,
    LambdaConfig: up.LambdaConfig,
    AutoVerifiedAttributes: up.AutoVerifiedAttributes,
    SmsVerificationMessage: up.SmsVerificationMessage,
    EmailVerificationMessage: up.EmailVerificationMessage,
    EmailVerificationSubject: up.EmailVerificationSubject,
    VerificationMessageTemplate: up.VerificationMessageTemplate,
    SmsAuthenticationMessage: up.SmsAuthenticationMessage,
    UserAttributeUpdateSettings: up.UserAttributeUpdateSettings,
    MfaConfiguration: up.MfaConfiguration,
    DeviceConfiguration: up.DeviceConfiguration,
    EmailConfiguration: DESIRED_EMAIL_CONFIG,
    UserPoolTags: up.UserPoolTags,
    AdminCreateUserConfig: up.AdminCreateUserConfig,
    AccountRecoverySetting: up.AccountRecoverySetting,
  };

  // Omit anything the pool doesn't currently have set, rather than sending explicit nulls.
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  await client.send(new UpdateUserPoolCommand(update));
  console.log('Restored Cognito EmailConfiguration to SES/DEVELOPER.');
}

main().catch((err) => {
  console.error('Failed to verify/restore Cognito EmailConfiguration:', err);
  // Never fail the whole deploy over this -- log loudly and move on.
  process.exit(0);
});
