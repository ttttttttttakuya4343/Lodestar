// Cognito 認証（Amplify v6）。同期が設定されているときだけ使う。
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { syncConfig } from './config';

let configured = false;

export function configureAuth(): void {
  if (configured) return;
  if (!syncConfig.userPoolId || !syncConfig.clientId) return;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: syncConfig.userPoolId,
        userPoolClientId: syncConfig.clientId,
      },
    },
  });
  configured = true;
}

export async function login(email: string, password: string): Promise<void> {
  configureAuth();
  await signIn({ username: email, password });
}

export async function logout(): Promise<void> {
  await signOut();
}

/** ログイン中のメール（未ログインなら null）。 */
export async function currentEmail(): Promise<string | null> {
  configureAuth();
  try {
    const user = await getCurrentUser();
    return user.signInDetails?.loginId ?? user.username;
  } catch {
    return null;
  }
}

/** API 認証用の ID トークン（HTTP API の JWT オーソライザーは aud=clientId を検証するため ID トークンを使う）。 */
export async function idToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
