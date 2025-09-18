import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, Upload, Send, Trash2 } from 'lucide-react';

export function useToastNotifications() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-success text-success-foreground border-success',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: 'bg-warning text-warning-foreground border-warning',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: 'bg-primary text-primary-foreground border-primary',
    });
  };

  // Specific notification methods for common actions
  const notifyMessageSent = () => {
    showSuccess('Message sent', 'Your message has been delivered successfully');
  };

  const notifyMessageError = () => {
    showError('Failed to send message', 'Please check your connection and try again');
  };

  const notifyFileUploaded = (filename: string) => {
    showSuccess('File uploaded', `${filename} has been successfully uploaded`);
  };

  const notifyFileUploadError = (filename: string) => {
    showError('Upload failed', `Failed to upload ${filename}. Please try again`);
  };

  const notifyDocumentProcessed = (filename: string) => {
    showSuccess('Document processed', `${filename} has been added to your knowledge base`);
  };

  const notifyDocumentDeleted = (filename: string) => {
    showSuccess('Document deleted', `${filename} has been removed from your knowledge base`);
  };

  const notifySettingsSaved = () => {
    showSuccess('Settings saved', 'Your preferences have been updated');
  };

  const notifyUserInvited = (email: string) => {
    showSuccess('Invitation sent', `An invitation has been sent to ${email}`);
  };

  const notifyConnectionError = () => {
    showError('Connection error', 'Unable to connect to the server. Please check your internet connection');
  };

  const notifySessionExpired = () => {
    showWarning('Session expired', 'Please sign in again to continue');
  };

  const notifyFeatureComingSoon = () => {
    showInfo('Coming soon', 'This feature is currently under development');
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifyMessageSent,
    notifyMessageError,
    notifyFileUploaded,
    notifyFileUploadError,
    notifyDocumentProcessed,
    notifyDocumentDeleted,
    notifySettingsSaved,
    notifyUserInvited,
    notifyConnectionError,
    notifySessionExpired,
    notifyFeatureComingSoon,
  };
}