import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
        region: import.meta.env.VITE_AWS_REGION,
        loginWith: { // allow username = email
          email: true,
        },
        signUpVerificationMethod: 'code', // confirm with a code
        userAttributes: {
          email: {
            required: true,
          },
        },
      },
    },
  });
}
