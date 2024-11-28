'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { signOut } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const CalDAVSetup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [caldavUsername, setCaldavUsername] = useState('');
  const [caldavPassword, setCaldavPassword] = useState('');
  const [caldavUrl, setCaldavUrl] = useState(
    'https://www.fgquest.net/dav.php/'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    const checkCredentials = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dav/check');
        if (response.ok) {
          const data = await response.json();
          setHasCredentials(data.hasCredentials);
        }
      } catch (err) {
        console.error('Failed to fetch CalDAV credentials status.');
      } finally {
        setLoading(false); // Hide spinner after loading
      }
    };
    checkCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dav/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caldav_url: caldavUrl,
          caldav_username: caldavUsername,
          caldav_password: caldavPassword
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'CalDAV credentials saved successfully.'
        });
        setDialogMessage(
          'CalDAV setup completed. You will be logged out to reauthenticate.'
        );
        setShowDialog(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save CalDAV credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true); // Show spinner
    try {
      const response = await fetch('/api/dav/disconnect', { method: 'POST' });

      if (response.ok) {
        toast({
          title: 'Disconnected',
          description: 'CalDAV credentials removed successfully.'
        });
        setDialogMessage(
          'CalDAV disconnected. You will be logged out to reauthenticate.'
        );
        setShowDialog(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to disconnect CalDAV credentials.'
        });
      }
    } catch (err) {
      setError('An error occurred while disconnecting. Please try again.');
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto p-4">
      <div className="mb-6 max-w-lg px-4 text-center">
        <h1 className="text-2xl font-semibold">CalDAV Setup</h1>
        <p className="mt-4">
          {hasCredentials
            ? 'Your CalDAV account is currently connected. You can disconnect if you wish to stop syncing.'
            : 'To access the dashboard and sync your calendar, please set up your CalDAV account. This setup enables seamless management of your tasks and schedules.'}
        </p>
      </div>

      <Card className="w-full max-w-md space-y-4 overflow-y-auto p-6">
        <CardContent>
          {loading ? (
            <div className="flex h-16 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
          ) : hasCredentials ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect CalDAV
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="caldavUrl">CalDAV URL</Label>
                <Input
                  type="url"
                  id="caldavUrl"
                  value={caldavUrl}
                  onChange={(e) => setCaldavUrl(e.target.value)}
                  required
                  hidden
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="caldavUsername">Username</Label>
                <Input
                  type="text"
                  id="caldavUsername"
                  value={caldavUsername}
                  onChange={(e) => setCaldavUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="caldavPassword">Password</Label>
                <Input
                  type="password"
                  id="caldavPassword"
                  value={caldavPassword}
                  onChange={(e) => setCaldavPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save and Proceed'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Ending</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{dialogMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleLogout}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalDAVSetup;
