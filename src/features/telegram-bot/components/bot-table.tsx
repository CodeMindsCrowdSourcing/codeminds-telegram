'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  PlayCircle,
  PowerOff,
  Trash2,
  Settings,
  Users
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { TelegramBot } from '@/types/telegram-bot';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

interface BotTableProps {
  data: TelegramBot[];
  onStartBot?: (botId: string) => Promise<void>;
  onStopBot?: (botId: string) => Promise<void>;
  onDeleteBot?: (botId: string) => Promise<void>;
  onUpdateBot?: (botId: string, data: Partial<TelegramBot>) => Promise<void>;
}

interface ActionCellProps {
  bot: TelegramBot;
  onStartBot?: (botId: string) => Promise<void>;
  onStopBot?: (botId: string) => Promise<void>;
  onDeleteBot?: (botId: string) => Promise<void>;
  onUpdateBot?: (botId: string, data: Partial<TelegramBot>) => Promise<void>;
}

function ActionCell({
  bot,
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: ActionCellProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [editData, setEditData] = useState({
    buttonText: bot.buttonText,
    infoText: bot.infoText,
    authorId: bot.authorId,
    linkImage: bot.linkImage,
    messagePrivateMessage: bot.messagePrivateMessage,
    messageOnClick: bot.messageOnClick,
    token: bot.token,
    mediaType: 'image' as 'image' | 'video'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const [isGroupsDialogOpen, setIsGroupsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isAddMessageOpen, setIsAddMessageOpen] = useState(false);
  const [addMessageGroupId, setAddMessageGroupId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageDelay, setMessageDelay] = useState(60);
  const [messageEnabled, setMessageEnabled] = useState(true);
  const [messageImage, setMessageImage] = useState<string>('');
  const [messageVideo, setMessageVideo] = useState<string>('');
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editMessages, setEditMessages] = useState<{ [groupId: string]: { [msgId: string]: any } }>({});
  const [messageButtonText, setMessageButtonText] = useState('');
  const [messageButtonUrl, setMessageButtonUrl] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, groupId?: string, msgId?: string}>({open: false});

  useEffect(() => {
    setEditData({
      buttonText: bot.buttonText,
      infoText: bot.infoText,
      authorId: bot.authorId,
      linkImage: bot.linkImage,
      messagePrivateMessage: bot.messagePrivateMessage,
      messageOnClick: bot.messageOnClick,
      token: bot.token,
      mediaType: bot.linkImage?.endsWith('.mp4') ? 'video' : 'image'
    });
    setPreviewUrl(bot.linkImage || null);
  }, [isEditDialogOpen, bot]);

  const fetchGroups = async () => {
    setIsGroupsLoading(true);
    try {
      const res = await fetch(`/api/telegram-bot/${bot.id}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (e) {
      toast.error('Failed to load groups');
    } finally {
      setIsGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (isGroupsDialogOpen) fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGroupsDialogOpen]);

  const handleAction = async (
    action: () => Promise<void>,
  ) => {
    try {
      setIsLoading(true);
      await action();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!onUpdateBot || !onStopBot || !onStartBot) return;
    try {
      setIsSaving(true);
      const wasRunning = bot.isRunning;

      if (wasRunning) {
        await onStopBot(bot.id);
      }

      await onUpdateBot(bot.id, editData);

      if (wasRunning) {
        await onStartBot(bot.id);
      }
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update bot parameters');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No URL returned from upload');
      }

      setEditData(prev => ({ ...prev, linkImage: data.url }));
      setPreviewUrl(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAddingMessage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (file.type.startsWith('video/')) {
          setMessageVideo(data.url);
          setMessageImage('');
        } else if (file.type.startsWith('image/')) {
          setMessageImage(data.url);
          setMessageVideo('');
        }
      } else {
        toast.error('Failed to upload media');
      }
    } catch (e) {
      toast.error('Failed to upload media');
    } finally {
      setIsAddingMessage(false);
    }
  };

  const handleAddMessage = (groupId: string) => {
    setAddMessageGroupId(groupId);
    setMessageText('');
    setMessageDelay(60);
    setMessageEnabled(true);
    setMessageImage('');
    setMessageVideo('');
    setMessageButtonText('');
    setMessageButtonUrl('');
    setIsAddMessageOpen(true);
  };

  const handleAddMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMessageGroupId) return;
    setIsAddingMessage(true);
    try {
      const body: any = {
        text: messageText,
        delay: messageDelay,
        enabled: messageEnabled,
        buttonText: messageButtonText,
        buttonUrl: messageButtonUrl
      };
      if (messageImage) body.image = messageImage;
      if (messageVideo) body.video = messageVideo;
      const res = await fetch(`/api/telegram-bot/group/${addMessageGroupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to add message');
      toast.success('Message added');
      setIsAddMessageOpen(false);
      setAddMessageGroupId(null);
      setMessageText('');
      setMessageDelay(60);
      setMessageEnabled(true);
      setMessageImage('');
      setMessageVideo('');
      setMessageButtonText('');
      setMessageButtonUrl('');
      fetchGroups();
    } catch (e) {
      toast.error('Failed to add message');
    } finally {
      setIsAddingMessage(false);
    }
  };

  function handleFieldChange(groupId: string, msgId: string, field: string, value: any) {
    setEditMessages(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [msgId]: {
          ...((prev[groupId] && prev[groupId][msgId]) || {}),
          [field]: value
        }
      }
    }));
  }

  async function handleSaveAllMessages(groupId: string, _messages: any[]) {
    const edits = editMessages[groupId] || {};
    const patchRequests = Object.entries(edits)
      .filter(([, changes]) => Object.keys(changes).length > 0)
      .map(([msgId, changes]) =>
        fetch(`/api/telegram-bot/group/${groupId}/messages/${msgId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes)
        })
      );
    if (patchRequests.length > 0) {
      await Promise.all(patchRequests);
      fetchGroups();
      toast.success('Messages updated');
      setEditMessages(prev => ({ ...prev, [groupId]: {} }));
    } else {
      toast.info('No changes to save');
    }
  }

  async function handleUploadMedia(groupId: string, msgId: string, file: File) {
    setEditMessages(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [msgId]: {
          ...((prev[groupId] && prev[groupId][msgId]) || {}),
          isUploading: true
        }
      }
    }));
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      await fetch(`/api/telegram-bot/group/${groupId}/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file.type.startsWith('video/') ? { video: data.url, image: undefined } : { image: data.url, video: undefined })
      });
      fetchGroups();
      toast.success(file.type.startsWith('video/') ? 'Video uploaded' : 'Image uploaded');
    } else {
      toast.error('Failed to upload media');
    }
    setEditMessages(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [msgId]: {
          ...((prev[groupId] && prev[groupId][msgId]) || {}),
          isUploading: false
        }
      }
    }));
  }

  async function handleDeleteMessage(groupId: string, msgId: string) {
    const res = await fetch(`/api/telegram-bot/group/${groupId}/messages/${msgId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Message deleted');
      fetchGroups();
    } else {
      toast.error('Failed to delete message');
    }
  }

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bot Parameters</DialogTitle>
            <DialogDescription>
              Update the bots message and button settings
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='token'>Bot Token</Label>
              <Input
                id='token'
                value={editData.token}
                onChange={(e) =>
                  setEditData({ ...editData, token: e.target.value })
                }
                placeholder='Enter bot token'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='buttonText'>Button Text</Label>
              <Input
                id='buttonText'
                value={editData.buttonText}
                onChange={(e) =>
                  setEditData({ ...editData, buttonText: e.target.value })
                }
                placeholder='Enter button text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='infoText'>Info Text</Label>
              <Input
                id='infoText'
                value={editData.infoText}
                onChange={(e) =>
                  setEditData({ ...editData, infoText: e.target.value })
                }
                placeholder='Enter info text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='authorId'>Author ID</Label>
              <Input
                id='authorId'
                value={editData.authorId}
                onChange={(e) =>
                  setEditData({ ...editData, authorId: e.target.value })
                }
                placeholder='Enter author ID'
              />
            </div>
            <div className='space-y-2'>
              <Label>Media Type</Label>
              <RadioGroup
                value={editData.mediaType}
                onValueChange={(value: 'image' | 'video') =>
                  setEditData({ ...editData, mediaType: value })
                }
                className="flex space-x-4"
                disabled={isUploading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image">Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video">Video</Label>
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='media'>Upload Media</Label>
              <Input
                id='media'
                type='file'
                accept={editData.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="flex items-center justify-center py-4">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <span className="ml-2">Uploading...</span>
              </div>
            )}

            {previewUrl && (
              <div className='space-y-2'>
                <Label>Preview</Label>
                <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                  {editData.mediaType === 'image' ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={320}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='messagePrivateMessage'>
                Private Message Text
              </Label>
              <Input
                id='messagePrivateMessage'
                value={editData.messagePrivateMessage}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    messagePrivateMessage: e.target.value
                  })
                }
                placeholder='Enter private message text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='messageOnClick'>Click Message</Label>
              <Input
                id='messageOnClick'
                value={editData.messageOnClick}
                onChange={(e) =>
                  setEditData({ ...editData, messageOnClick: e.target.value })
                }
                placeholder='Enter click message'
              />
            </div>

            <Button
              onClick={handleUpdate}
              className='w-full'
              disabled={isSaving || isUploading}
            >
              {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupsDialogOpen} onOpenChange={setIsGroupsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Groups for this bot</DialogTitle>
          </DialogHeader>
          {isGroupsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-6">
              {groups.length === 0 ? (
                <div className="text-muted-foreground">No groups found.</div>
              ) : (
                groups.map((group: any) => (
                  <div key={group._id} className="bg-muted rounded-lg border mb-4 p-2">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="font-semibold">{group.groupName}</div>
                      <div className="text-xs text-muted-foreground">{group.groupId}</div>
                      <Button size="sm" variant="outline" onClick={() => handleAddMessage(group._id)}>
                        Add message
                      </Button>
                    </div>
                    {group.messages && group.messages.length > 0 && (
                      <div className="overflow-x-auto max-h-[65vh]">
                        <table className="w-full text-xs border">
                          <thead className="sticky top-0 bg-muted z-10">
                            <tr>
                              <th className="p-1 border text-left">Text</th>
                              <th className="p-1 border text-left">Delay</th>
                              <th className="p-1 border text-left">Status</th>
                              <th className="p-1 border text-left">Image</th>
                              <th className="p-1 border text-left">Button</th>
                              <th className="p-1 border text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.messages.map((msg: any, idx: number) => {
                              const msgId = msg._id || String(idx);
                              const edit = editMessages[group._id]?.[msgId] || {};
                              return (
                                <tr key={msg._id || idx} className="align-middle">
                                  <td className="p-1 border align-middle">
                                    <input
                                      className="font-mono text-xs w-full bg-transparent"
                                      value={edit.text !== undefined ? edit.text : msg.text}
                                      onChange={e => handleFieldChange(group._id, msgId, 'text', e.target.value)}
                                    />
                                  </td>
                                  <td className="p-1 border align-middle">
                                    <input
                                      type="number"
                                      className="text-xs w-16 bg-transparent"
                                      value={edit.delay !== undefined ? edit.delay : msg.delay}
                                      min={1}
                                      onChange={e => handleFieldChange(group._id, msgId, 'delay', Number(e.target.value))}
                                    />
                                  </td>
                                  <td className="p-1 border align-middle">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={edit.enabled !== undefined ? edit.enabled : msg.enabled}
                                        onChange={e => handleFieldChange(group._id, msgId, 'enabled', e.target.checked)}
                                        className="align-middle"
                                      />
                                      <span className="text-xs text-muted-foreground">{(edit.enabled !== undefined ? edit.enabled : msg.enabled) ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                  </td>
                                  <td className="p-1 border align-middle">
                                    <div className="flex items-center gap-2">
                                      {(msg.image || msg.video) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setPreviewMedia({
                                              url: msg.video ? msg.video : msg.image,
                                              type: msg.video ? 'video' : 'image'
                                            });
                                            setIsPreviewOpen(true);
                                          }}
                                        >
                                          Show
                                        </Button>
                                      )}
                                      <label className="inline-block cursor-pointer text-primary underline">
                                        Upload media
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          style={{ display: 'none' }}
                                          onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadMedia(group._id, msgId, file);
                                          }}
                                        />
                                      </label>
                                      {edit.isUploading && (
                                        <span className="ml-2 text-xs text-muted-foreground">Uploading...</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-1 border">
                                    <div className="flex flex-col gap-1">
                                      <input
                                        className="font-mono text-xs w-full bg-transparent placeholder:text-muted-foreground"
                                        value={edit.buttonText !== undefined ? edit.buttonText : msg.buttonText || ''}
                                        onChange={e => handleFieldChange(group._id, msgId, 'buttonText', e.target.value)}
                                        placeholder="Button text"
                                      />
                                      <input
                                        className="font-mono text-xs w-full bg-transparent mt-1 placeholder:text-muted-foreground"
                                        value={edit.buttonUrl !== undefined ? edit.buttonUrl : msg.buttonUrl || ''}
                                        onChange={e => handleFieldChange(group._id, msgId, 'buttonUrl', e.target.value)}
                                        placeholder="Button URL"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-1 border">
                                    <Button size="icon" variant="ghost" onClick={() => setDeleteDialog({open: true, groupId: group._id, msgId})} title="Delete message">
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="default" onClick={() => handleSaveAllMessages(group._id, group.messages)}
                            disabled={Object.values(editMessages[group._id] || {}).some(e => e.isUploading)}>
                            Save All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMessageOpen} onOpenChange={setIsAddMessageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add message to group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMessageSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Text</label>
              <Input value={messageText} onChange={e => setMessageText(e.target.value)} required disabled={isAddingMessage} />
            </div>
            <div>
              <label className="block mb-1">Delay (seconds)</label>
              <Input type="number" value={messageDelay} onChange={e => setMessageDelay(Number(e.target.value))} min={1} required disabled={isAddingMessage} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={messageEnabled} onChange={e => setMessageEnabled(e.target.checked)} disabled={isAddingMessage} />
              <span>Enabled</span>
            </div>
            <div>
              <label className="block mb-1">Media (image or video, optional)</label>
              <Input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleMediaChange} disabled={isAddingMessage} />
              {messageImage && <Image src={messageImage} alt="preview" width={100} height={100} className="mt-2 max-h-32 object-cover" />}
              {messageVideo && <video src={messageVideo} controls className="mt-2 max-h-32" />}
            </div>
            <div>
              <label className="block mb-1">Button Text (optional)</label>
              <Input value={messageButtonText} onChange={e => setMessageButtonText(e.target.value)} disabled={isAddingMessage} />
            </div>
            <div>
              <label className="block mb-1">Button URL (optional)</label>
              <Input value={messageButtonUrl} onChange={e => setMessageButtonUrl(e.target.value)} disabled={isAddingMessage} />
            </div>
            <Button type="submit" className="w-full" disabled={isAddingMessage}>
              {isAddingMessage ? 'Adding...' : 'Add message'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {previewMedia?.type === 'video' ? (
              <video
                src={previewMedia.url}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={previewMedia?.url || ''}
                alt="Preview"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(prev => ({...prev, open}))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({open: false})}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (deleteDialog.groupId && deleteDialog.msgId) {
                await handleDeleteMessage(deleteDialog.groupId, deleteDialog.msgId);
              }
              setDeleteDialog({open: false});
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(bot.token);
              toast.success('Token copied to clipboard');
            }}
          >
            Copy token
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Settings className='mr-2 h-4 w-4' />
            Edit Parameters
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsGroupsDialogOpen(true)}
          >
            <Users className='mr-2 h-4 w-4' />
            Show Groups
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/telegram-bot/${bot.id}`)}
          >
            <Users className='mr-2 h-4 w-4' />
            View Users
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              handleAction(async () => {
                if (onStartBot) {
                  await onStartBot(bot.id);
                }
              })
            }
            disabled={bot.isRunning || isLoading}
          >
            <PlayCircle className='mr-2 h-4 w-4' />
            Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleAction(async () => {
                if (onStopBot) {
                  await onStopBot(bot.id);
                }
              })
            }
            disabled={!bot.isRunning || isLoading}
          >
            <PowerOff className='mr-2 h-4 w-4' />
            Stop
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleAction(async () => {
                if (onDeleteBot) {
                  await onDeleteBot(bot.id);
                }
              })
            }
            disabled={isLoading}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export const columns = ({
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: Pick<
  BotTableProps,
  'onStartBot' | 'onStopBot' | 'onDeleteBot' | 'onUpdateBot'
>): ColumnDef<TelegramBot>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return <span className='font-medium'>{name}</span>;
    }
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => {
      const token = row.getValue('token') as string;
      return <span className='font-mono'>{token.slice(0, 10)}...</span>;
    }
  },
  {
    accessorKey: 'isRunning',
    header: 'Status',
    cell: ({ row }) => {
      const isRunning = row.getValue('isRunning') as boolean;
      return (
        <div className='flex items-center gap-2'>
          {isRunning ? (
            <>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span>Running</span>
            </>
          ) : (
            <>
              <div className='h-2 w-2 rounded-full bg-red-500' />
              <span>Stopped</span>
            </>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        bot={row.original}
        onStartBot={onStartBot}
        onStopBot={onStopBot}
        onDeleteBot={onDeleteBot}
        onUpdateBot={onUpdateBot}
      />
    )
  }
];

export function BotTable({
  data,
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: BotTableProps) {
  const tableColumns = columns({ onStartBot, onStopBot, onDeleteBot, onUpdateBot });
  const table = useReactTable<TelegramBot>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return <DataTable<TelegramBot> table={table} />;
}
