import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, ExternalLink, Inbox, Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react';
import { adminFetch } from '../../lib/adminApi';

interface ContactInquiry {
  id: string;
  guestEmail: string;
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MailboxProviderStatus {
  configured: boolean;
  connected: boolean;
  accountEmail?: string;
}

type MailboxProvider = 'google' | 'microsoft';
type MailboxStatuses = Record<MailboxProvider, MailboxProviderStatus>;

const providerLabels: Record<MailboxProvider, string> = {
  google: 'Gmail',
  microsoft: 'Outlook',
};

function getErrorMessage(data: { error?: string }, fallback: string): string {
  return typeof data.error === 'string' ? data.error : fallback;
}

export const AdminInquiriesManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [mailboxes, setMailboxes] = useState<MailboxStatuses>({
    google: { configured: false, connected: false },
    microsoft: { configured: false, connected: false },
  });
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [inquiriesResponse, mailboxResponse] = await Promise.all([
        adminFetch('/api/admin/inquiries'),
        adminFetch('/api/admin/mailbox/status'),
      ]);
      if (!inquiriesResponse.ok) throw new Error('Could not load contact inquiries.');
      if (!mailboxResponse.ok) throw new Error('Could not load mailbox connection status.');
      const [inquiryData, mailboxData] = await Promise.all([
        inquiriesResponse.json() as Promise<ContactInquiry[]>,
        mailboxResponse.json() as Promise<{ providers: MailboxStatuses }>,
      ]);
      setInquiries(inquiryData);
      setMailboxes(mailboxData.providers);
    } catch (loadError) {
      console.error('Could not load contact inbox:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load contact inbox.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    const handleMailboxOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'watra-mailbox-oauth') return;
      if (event.data.status === 'connected') {
        setNotice('Mailbox connected. You can now send inquiry copies to it.');
      } else {
        setError('Mailbox connection failed. Check OAuth settings and try again.');
      }
      void loadInbox();
    };
    window.addEventListener('message', handleMailboxOAuthMessage);
    return () => window.removeEventListener('message', handleMailboxOAuthMessage);
  }, [loadInbox]);

  const updateReadStatus = async (inquiry: ContactInquiry) => {
    setPendingId(inquiry.id);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/inquiries/${encodeURIComponent(inquiry.id)}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !inquiry.isRead }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Could not update inquiry.'));
      setInquiries(current => current.map(item => item.id === inquiry.id ? data.inquiry : item));
    } catch (actionError) {
      console.error('Could not update inquiry read status:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not update inquiry.');
    } finally {
      setPendingId(null);
    }
  };

  const deleteInquiry = async (inquiry: ContactInquiry) => {
    if (!window.confirm(`Permanently delete the inquiry from ${inquiry.senderName} (${inquiry.guestEmail})? This cannot be undone.`)) {
      return;
    }
    setPendingId(inquiry.id);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/inquiries/${encodeURIComponent(inquiry.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Could not delete inquiry.'));
      setInquiries(current => current.filter(item => item.id !== inquiry.id));
      setNotice('Inquiry permanently deleted.');
    } catch (actionError) {
      console.error('Could not delete inquiry:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not delete inquiry.');
    } finally {
      setPendingId(null);
    }
  };

  const connectMailbox = async (provider: MailboxProvider) => {
    const popup = window.open('about:blank', 'watra-mailbox-connect', 'width=600,height=720');
    if (!popup) {
      setError('Allow pop-ups for this site to connect your mailbox.');
      return;
    }
    setError(null);
    try {
      const response = await adminFetch(`/api/admin/mailbox/${provider}/connect`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || typeof data.authorizationUrl !== 'string') {
        throw new Error(getErrorMessage(data, `Could not connect ${providerLabels[provider]}.`));
      }
      popup.location.href = data.authorizationUrl;
    } catch (connectError) {
      popup.close();
      console.error(`Could not connect ${providerLabels[provider]}:`, connectError);
      setError(connectError instanceof Error ? connectError.message : 'Could not connect mailbox.');
    }
  };

  const disconnectMailbox = async (provider: MailboxProvider) => {
    if (!window.confirm(`Disconnect ${providerLabels[provider]}? The app will remove its saved authorization.`)) return;
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/mailbox/${provider}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Could not disconnect mailbox.'));
      await loadInbox();
      setNotice(`${providerLabels[provider]} disconnected.`);
    } catch (disconnectError) {
      console.error(`Could not disconnect ${providerLabels[provider]}:`, disconnectError);
      setError(disconnectError instanceof Error ? disconnectError.message : 'Could not disconnect mailbox.');
    }
  };

  const exportInquiry = async (inquiry: ContactInquiry, provider: MailboxProvider) => {
    setPendingId(inquiry.id);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(
        `/api/admin/inquiries/${encodeURIComponent(inquiry.id)}/export/${provider}`,
        { method: 'POST' },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, `Could not export to ${providerLabels[provider]}.`));
      setNotice(`A copy was sent to ${data.accountEmail}. Reply to the original sender using the Reply-To address.`);
    } catch (exportError) {
      console.error(`Could not export inquiry to ${providerLabels[provider]}:`, exportError);
      setError(exportError instanceof Error ? exportError.message : 'Could not export inquiry.');
    } finally {
      setPendingId(null);
    }
  };

  const visibleInquiries = showUnreadOnly ? inquiries.filter(inquiry => !inquiry.isRead) : inquiries;
  const unreadCount = inquiries.filter(inquiry => !inquiry.isRead).length;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
            <Inbox className="h-5 w-5 text-emerald-700" />
            Website inquiries
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {inquiries.length} total · {unreadCount} unread
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={event => setShowUnreadOnly(event.target.checked)}
            />
            Unread only
          </label>
          <button
            type="button"
            onClick={() => void loadInbox()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-semibold text-stone-900">Mailbox connections</h3>
        <p className="mt-1 text-sm text-stone-600">
          Export sends a copy to the connected mailbox with the guest set as Reply-To; it does not delete the inquiry here.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(['google', 'microsoft'] as const).map(provider => {
            const mailbox = mailboxes[provider];
            return (
              <div key={provider} className="flex min-w-64 flex-1 items-center justify-between gap-3 rounded-xl border border-stone-200 p-3">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{providerLabels[provider]}</p>
                  <p className="truncate text-xs text-stone-500">
                    {mailbox.connected
                      ? mailbox.accountEmail
                      : mailbox.configured
                        ? 'Not connected'
                        : 'OAuth setup required'}
                  </p>
                </div>
                {mailbox.connected ? (
                  <button
                    type="button"
                    onClick={() => void disconnectMailbox(provider)}
                    className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void connectMailbox(provider)}
                    disabled={!mailbox.configured}
                    className="shrink-0 rounded-lg bg-[#1E3A2B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#294d39] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-stone-500">Loading inquiries…</p>
      ) : visibleInquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">
          {showUnreadOnly ? 'No unread inquiries.' : 'No contact-form inquiries have been received.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleInquiries.map(inquiry => (
            <article
              key={inquiry.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${inquiry.isRead ? 'border-stone-200' : 'border-emerald-300 ring-1 ring-emerald-100'}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-stone-900">{inquiry.senderName}</h3>
                    {!inquiry.isRead && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Unread</span>}
                    <time className="text-xs text-stone-500" dateTime={inquiry.createdAt}>
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <a className="mt-1 inline-block text-sm text-emerald-800 underline" href={`mailto:${encodeURIComponent(inquiry.guestEmail)}`}>
                    {inquiry.guestEmail}
                  </a>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-800">{inquiry.message}</p>
                  <a
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1E3A2B] px-3 py-2 text-sm font-semibold text-white hover:bg-[#294d39]"
                    href={`mailto:${encodeURIComponent(inquiry.guestEmail)}?subject=${encodeURIComponent(`Re: Watra Korbielow - website inquiry`)}&body=${encodeURIComponent(`Hello ${inquiry.senderName},\n\nThank you for contacting Watra Korbielow.\n\n\n--- Your message ---\n${inquiry.message}\n`)}`}
                  >
                    <Mail className="h-4 w-4" />
                    Reply by email
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="mt-1 text-xs text-stone-500">Opens your email app; review and send the reply there.</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-64 lg:justify-end">
                  {(['google', 'microsoft'] as const).map(provider => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => void exportInquiry(inquiry, provider)}
                      disabled={!mailboxes[provider].connected || pendingId === inquiry.id}
                      title={mailboxes[provider].connected ? `Send a copy to ${mailboxes[provider].accountEmail}` : `Connect ${providerLabels[provider]} first`}
                      className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Send copy to {providerLabels[provider]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void updateReadStatus(inquiry)}
                    disabled={pendingId === inquiry.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                  >
                    {inquiry.isRead ? <MailOpen className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    Mark {inquiry.isRead ? 'unread' : 'read'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteInquiry(inquiry)}
                    disabled={pendingId === inquiry.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
