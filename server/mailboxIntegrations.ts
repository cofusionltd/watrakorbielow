import { createHash, randomBytes } from 'node:crypto';
import { Request, Response as ExpressResponse } from 'express';
import {
  buildGmailRawMessage,
  decryptMailboxRefreshToken,
  encryptMailboxRefreshToken,
  inquiryEmailContent,
  validateMailboxTokenEncryptionKey,
} from './mailboxEmail.ts';
import {
  dbConsumeMailboxOauthState,
  dbCreateMailboxOauthState,
  dbDeleteMailboxIntegration,
  dbGetContactInquiry,
  dbGetMailboxIntegration,
  dbGetMailboxIntegrations,
  dbSaveMailboxIntegration,
} from '../src/db/repository.ts';

type MailboxProvider = 'google' | 'microsoft';

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface OAuthTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

function getProvider(value: string): MailboxProvider | null {
  return value === 'google' || value === 'microsoft' ? value : null;
}

function getAppOrigin(): string {
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) throw new Error('APP_URL is not configured');
  const url = new URL(appUrl);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('APP_URL must use HTTPS in production');
  }
  return url.origin;
}

function getProviderConfig(provider: MailboxProvider): ProviderConfig {
  const appOrigin = getAppOrigin();
  const clientId = provider === 'google'
    ? process.env.GMAIL_OAUTH_CLIENT_ID?.trim()
    : process.env.MICROSOFT_OAUTH_CLIENT_ID?.trim();
  const clientSecret = provider === 'google'
    ? process.env.GMAIL_OAUTH_CLIENT_SECRET
    : process.env.MICROSOFT_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(`${provider} OAuth credentials are not configured`);
  }
  return {
    clientId,
    clientSecret,
    redirectUri: `${appOrigin}/api/admin/mailbox/oauth/${provider}/callback`,
  };
}

async function parseProviderJson<T>(response: globalThis.Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    throw new Error('Mailbox provider returned an invalid response');
  }
}

async function exchangeAuthorizationCode(
  provider: MailboxProvider,
  code: string
): Promise<OAuthTokenResponse> {
  const config = getProviderConfig(provider);
  const endpoint = provider === 'google'
    ? 'https://oauth2.googleapis.com/token'
    : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!response.ok) throw new Error('Mailbox authorization code exchange failed');
  return parseProviderJson<OAuthTokenResponse>(response);
}

async function getAccountEmail(provider: MailboxProvider, accessToken: string): Promise<string> {
  const endpoint = provider === 'google'
    ? 'https://openidconnect.googleapis.com/v1/userinfo'
    : 'https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName';
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Could not read the connected mailbox identity');
  const profile = await parseProviderJson<{ email?: string; mail?: string; userPrincipalName?: string }>(response);
  const accountEmail = (provider === 'google'
    ? profile.email
    : profile.mail || profile.userPrincipalName)?.trim().toLowerCase();
  if (!accountEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
    throw new Error('Connected mailbox did not provide a valid email address');
  }
  return accountEmail;
}

async function refreshAccessToken(
  provider: MailboxProvider,
  refreshToken: string
): Promise<OAuthTokenResponse> {
  const config = getProviderConfig(provider);
  const endpoint = provider === 'google'
    ? 'https://oauth2.googleapis.com/token'
    : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const scope = provider === 'google'
    ? 'openid email https://www.googleapis.com/auth/gmail.send'
    : 'openid profile email offline_access User.Read Mail.Send';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope,
    }),
  });
  if (!response.ok) throw new Error('Mailbox access token refresh failed');
  return parseProviderJson<OAuthTokenResponse>(response);
}

async function sendInquiryCopy(
  provider: MailboxProvider,
  accountEmail: string,
  accessToken: string,
  inquiry: {
    senderName: string;
    guestEmail: string;
    message: string;
    createdAt: Date | null;
  }
): Promise<void> {
  const { subject, body } = inquiryEmailContent(inquiry);
  let response: globalThis.Response;
  if (provider === 'google') {
    response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: buildGmailRawMessage(accountEmail, inquiry) }),
    });
  } else {
    response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'Text', content: body },
          toRecipients: [{ emailAddress: { address: accountEmail } }],
          replyTo: [{ emailAddress: { address: inquiry.guestEmail, name: inquiry.senderName } }],
        },
        saveToSentItems: true,
      }),
    });
  }
  if (!response.ok) throw new Error(`${provider} could not send the inquiry copy`);
}

function renderOAuthPopup(res: ExpressResponse, status: 'connected' | 'error'): void {
  const appUrl = process.env.APP_URL?.trim();
  const targetOrigin = appUrl ? new URL(appUrl).origin : '';
  const message = status === 'connected'
    ? 'Mailbox connected. You can close this window.'
    : 'Mailbox connection failed. Return to the admin panel and try again.';
  const originLiteral = JSON.stringify(targetOrigin);
  res.status(status === 'connected' ? 200 : 400).type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Mailbox connection</title></head>
<body><p>${message}</p><script>
if (window.opener && ${originLiteral}) {
  window.opener.postMessage({ type: 'watra-mailbox-oauth', status: '${status}' }, ${originLiteral});
  window.close();
}
</script></body></html>`);
}

export async function handleMailboxStatus(_req: Request, res: ExpressResponse): Promise<void> {
  try {
    const integrations = await dbGetMailboxIntegrations();
    const providers = {} as Record<MailboxProvider, { configured: boolean; connected: boolean; accountEmail?: string }>;
    for (const provider of ['google', 'microsoft'] as const) {
      let configured = false;
      try {
        getProviderConfig(provider);
        validateMailboxTokenEncryptionKey();
        configured = true;
      } catch {
        configured = false;
      }
      const integration = integrations.find(item => item.provider === provider);
      providers[provider] = {
        configured,
        connected: Boolean(integration),
        ...(integration ? { accountEmail: integration.accountEmail } : {}),
      };
    }
    res.json({ providers });
  } catch (error) {
    console.error('Could not load mailbox integration status:', error);
    res.status(503).json({ error: 'Could not load mailbox connection status.' });
  }
}

export async function handleMailboxConnect(req: Request, res: ExpressResponse): Promise<void> {
  const provider = getProvider(req.params.provider);
  if (!provider) {
    res.status(404).json({ error: 'Unsupported mailbox provider.' });
    return;
  }

  try {
    const config = getProviderConfig(provider);
    validateMailboxTokenEncryptionKey();
    const state = randomBytes(32).toString('base64url');
    await dbCreateMailboxOauthState({
      stateHash: createHash('sha256').update(state).digest('hex'),
      provider,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    const authorizationUrl = new URL(
      provider === 'google'
        ? 'https://accounts.google.com/o/oauth2/v2/auth'
        : 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    );
    authorizationUrl.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: provider === 'google'
        ? 'openid email https://www.googleapis.com/auth/gmail.send'
        : 'openid profile email offline_access User.Read Mail.Send',
      state,
      ...(provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : { prompt: 'select_account consent' }),
    }).toString();
    res.json({ authorizationUrl: authorizationUrl.toString() });
  } catch (error) {
    console.error(`Could not start ${provider} mailbox connection:`, error);
    res.status(503).json({
      error: 'Mailbox connection is not configured. Check the provider OAuth settings and encryption key.',
    });
  }
}

export async function handleMailboxOAuthCallback(req: Request, res: ExpressResponse): Promise<void> {
  const provider = getProvider(req.params.provider);
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!provider || !state) {
    renderOAuthPopup(res, 'error');
    return;
  }

  try {
    const consumed = await dbConsumeMailboxOauthState(
      createHash('sha256').update(state).digest('hex'),
      provider
    );
    if (!consumed || !code || req.query.error) {
      renderOAuthPopup(res, 'error');
      return;
    }

    const tokenResponse = await exchangeAuthorizationCode(provider, code);
    if (!tokenResponse.access_token) throw new Error('Mailbox provider did not return an access token');
    const accountEmail = await getAccountEmail(provider, tokenResponse.access_token);
    let refreshToken = tokenResponse.refresh_token;
    if (!refreshToken) {
      const existing = await dbGetMailboxIntegration(provider);
      if (!existing || existing.accountEmail !== accountEmail) {
        throw new Error('Mailbox provider did not return a refresh token');
      }
      refreshToken = decryptMailboxRefreshToken(existing.encryptedRefreshToken);
    }
    await dbSaveMailboxIntegration({
      provider,
      accountEmail,
      encryptedRefreshToken: encryptMailboxRefreshToken(refreshToken),
    });
    renderOAuthPopup(res, 'connected');
  } catch (error) {
    console.error(`Mailbox OAuth callback failed for ${provider}:`, error);
    renderOAuthPopup(res, 'error');
  }
}

export async function handleMailboxDisconnect(req: Request, res: ExpressResponse): Promise<void> {
  const provider = getProvider(req.params.provider);
  if (!provider) {
    res.status(404).json({ error: 'Unsupported mailbox provider.' });
    return;
  }
  try {
    await dbDeleteMailboxIntegration(provider);
    res.json({ success: true });
  } catch (error) {
    console.error(`Could not disconnect ${provider} mailbox:`, error);
    res.status(503).json({ error: 'Could not disconnect mailbox.' });
  }
}

export async function handleExportContactInquiry(req: Request, res: ExpressResponse): Promise<void> {
  const provider = getProvider(req.params.provider);
  if (!provider) {
    res.status(404).json({ error: 'Unsupported mailbox provider.' });
    return;
  }

  try {
    const [integration, inquiry] = await Promise.all([
      dbGetMailboxIntegration(provider),
      dbGetContactInquiry(req.params.id),
    ]);
    if (!inquiry) {
      res.status(404).json({ error: 'Contact inquiry not found.' });
      return;
    }
    if (!integration) {
      res.status(409).json({ error: 'Connect this mailbox before exporting inquiries.' });
      return;
    }

    const storedRefreshToken = decryptMailboxRefreshToken(integration.encryptedRefreshToken);
    const tokenResponse = await refreshAccessToken(provider, storedRefreshToken);
    if (!tokenResponse.access_token) throw new Error('Mailbox provider did not return an access token');
    if (tokenResponse.refresh_token) {
      await dbSaveMailboxIntegration({
        provider,
        accountEmail: integration.accountEmail,
        encryptedRefreshToken: encryptMailboxRefreshToken(tokenResponse.refresh_token),
      });
    }
    await sendInquiryCopy(provider, integration.accountEmail, tokenResponse.access_token, {
      senderName: inquiry.senderName,
      guestEmail: inquiry.guestEmail,
      message: inquiry.message,
      createdAt: inquiry.createdAt,
    });
    res.json({ success: true, accountEmail: integration.accountEmail });
  } catch (error) {
    console.error(`Could not export contact inquiry to ${provider}:`, error);
    res.status(502).json({
      error: 'Could not send this inquiry to the connected mailbox. Reconnect the mailbox if its authorization expired.',
    });
  }
}
