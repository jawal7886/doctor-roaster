/**
 * File: components/modals/EditProfileModal.tsx
 * Purpose: Modal for editing user profile information.
 */

import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/services/profileService';
import { useUser } from '@/contexts/UserContext';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal = ({ open, onOpenChange }: EditProfileModalProps) => {
  const { toast } = useToast();
  const { currentUser, updateCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (currentUser && open) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone || '');
      setProfileAvatar(currentUser.avatar || '');
      setAvatarPreview(currentUser.avatar || '');
    }
  }, [currentUser, open]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size must be less than 2MB', variant: 'destructive' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileAvatar(base64);
        setAvatarPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'No user logged in', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(currentUser, {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      
      updateCurrentUser(updatedUser);
      
      toast({ 
        title: 'Success', 
        description: 'Profile updated successfully' 
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update profile', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground">Profile Picture</h4>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-white shadow-lg border border-border">
                    <img 
                      src={avatarPreview} 
                      alt={profileName} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-lg">
                    {profileName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-1">Upload new photo</p>
                <p className="text-xs text-muted-foreground mb-3">JPG, PNG or GIF. Max size 2MB</p>
                <label htmlFor="avatar-upload-btn">
                  <Button variant="outline" size="sm" type="button" asChild>
                    <span>Choose File</span>
                  </Button>
                  <input
                    id="avatar-upload-btn"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground">Profile Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input 
                  id="fullname" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </Label>
                <Input 
                  id="phone" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
