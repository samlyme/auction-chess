import type { TokenResponse, UserCredentials } from '../schemas/types';

const URL = '/api';

// OAuth spec, kinda ugly
export function usernamePasswordLogin(
  credentials: UserCredentials
): Promise<TokenResponse> {
  console.trace();

  const encodedParams = new URLSearchParams();
  encodedParams.set('grant_type', 'password');
  encodedParams.set('username', credentials.username);
  encodedParams.set('password', credentials.password);
  encodedParams.set('scope', '');
  encodedParams.set('client_id', '');
  encodedParams.set('client_secret', '');

  return fetch(`${URL}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: encodedParams,
  })
    .then((res: Response) => res.json())
    .then((res: TokenResponse) => {
      console.log('auth at token response', res);

      if (res.token_type.toLowerCase() !== 'bearer')
        throw new Error('Wrong access token type');
      return res;
    });
}

export function testAuth(access_token: string): Promise<boolean> {
  console.trace();

  return fetch(`${URL}/auth`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      accept: 'application/json',
    },
  }).then((res: Response) => {
    return res.ok;
  });
}
