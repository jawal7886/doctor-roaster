/**
 * File: pages/SettingsPage.tsx
 * Purpose: Application settings page with profile, preferences, and system settings.
 */

import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Building2, Camera, Mail, Phone, MapPin, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { roleService, type Role } from '@/services/roleService';
import { specialtyService, type Specialty } from '@/services/specialtyService';
import { hospitalSettingService, type HospitalSetting } from '@/services/hospitalSettingService';
import { useHospitalSettings } from '@/contexts/HospitalSettingsContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SettingsPage = () => {
  const { toast } = useToast();
  const { refreshSettings } = useHospitalSettings();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [inAppNotif, setInAppNotif] = useState(true);

  // Hospital settings state
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(48);
  const [hospitalLogo, setHospitalLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ display_name: '', description: '', is_active: true });
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Specialties state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '', is_active: true });
  const [deleteSpecialtyDialogOpen, setDeleteSpecialtyDialogOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);

  useEffect(() => {
    loadRoles();
    loadSpecialties();
    loadHospitalSettings();
  }, []);

  const loadHospitalSettings = async () => {
    try {
      const data = await hospitalSettingService.get();
      setHospitalName(data.hospital_name);
      setHospitalAddress(data.address || '');
      setHospitalPhone(data.contact_number || '');
      setMaxWeeklyHours(data.max_weekly_hours);
      setHospitalLogo(data.hospital_logo || '');
      setLogoPreview(data.hospital_logo || '');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load hospital settings', variant: 'destructive' });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size must be less than 2MB', variant: 'destructive' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setHospitalLogo(base64);
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHospitalSettings = async () => {
    try {
      await hospitalSettingService.update({
        hospital_name: hospitalName,
        address: hospitalAddress,
        contact_number: hospitalPhone,
        max_weekly_hours: maxWeeklyHours,
        hospital_logo: hospitalLogo,
      });
      
      await refreshSettings(); // Refresh global settings
      
      toast({ 
        title: 'Success', 
        description: 'Hospital settings updated successfully' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update hospital settings', 
        variant: 'destructive' 
      });
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load roles', variant: 'destructive' });
    }
  };

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load specialties', variant: 'destructive' });
    }
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, roleForm);
        toast({ title: 'Success', description: 'Role updated successfully' });
      } else {
        await roleService.create(roleForm);
        toast({ title: 'Success', description: 'Role created successfully' });
      }
      setRoleDialogOpen(false);
      setEditingRole(null);
      setRoleForm({ display_name: '', description: '', is_active: true });
      loadRoles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save role', variant: 'destructive' });
    }
  };

  const handleDeleteRole = async (id: number) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;
    
    setRoleToDelete(role);
    setDeleteRoleDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await roleService.delete(roleToDelete.id);
      toast({ 
        title: 'Success', 
        description: `${roleToDelete.display_name} has been deleted successfully` 
      });
      setDeleteRoleDialogOpen(false);
      setRoleToDelete(null);
      loadRoles();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      toast({ 
        title: 'Cannot Delete Role', 
        description: errorMessage,
        variant: 'destructive' 
      });
      setDeleteRoleDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleSaveSpecialty = async () => {
    try {
      if (editingSpecialty) {
        await specialtyService.update(editingSpecialty.id, specialtyForm);
        toast({ title: 'Success', description: 'Specialty updated successfully' });
      } else {
        await specialtyService.create(specialtyForm);
        toast({ title: 'Success', description: 'Specialty created successfully' });
      }
      setSpecialtyDialogOpen(false);
      setEditingSpecialty(null);
      setSpecialtyForm({ name: '', description: '', is_active: true });
      loadSpecialties();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save specialty', variant: 'destructive' });
    }
  };

  const handleDeleteSpecialty = async (id: number) => {
    const specialty = specialties.find(s => s.id === id);
    if (!specialty) return;
    
    setSpecialtyToDelete(specialty);
    setDeleteSpecialtyDialogOpen(true);
  };

  const confirmDeleteSpecialty = async () => {
    if (!specialtyToDelete) return;
    
    try {
      await specialtyService.delete(specialtyToDelete.id);
      toast({ 
        title: 'Success', 
        description: `${specialtyToDelete.name} has been deleted successfully` 
      });
      setDeleteSpecialtyDialogOpen(false);
      setSpecialtyToDelete(null);
      loadSpecialties();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete specialty';
      toast({ 
        title: 'Cannot Delete Specialty', 
        description: errorMessage,
        variant: 'destructive' 
      });
      setDeleteSpecialtyDialogOpen(false);
      setSpecialtyToDelete(null);
    }
  };

  const openRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ display_name: role.display_name, description: role.description || '', is_active: role.is_active });
    } else {
      setEditingRole(null);
      setRoleForm({ display_name: '', description: '', is_active: true });
    }
    setRoleDialogOpen(true);
  };

  const openSpecialtyDialog = (specialty?: Specialty) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setSpecialtyForm({ name: specialty.name, description: specialty.description || '', is_active: specialty.is_active });
    } else {
      setEditingSpecialty(null);
      setSpecialtyForm({ name: '', description: '', is_active: true });
    }
    setSpecialtyDialogOpen(true);
  };

  const handleSaveNotifications = () => {
    toast({ 
      title: 'Settings Saved', 
      description: 'Your notification preferences have been updated successfully.' 
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Settings" 
        description="Manage your account and application preferences" 
      />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> 
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="hospital" className="gap-2">
            <Building2 className="h-4 w-4" /> 
            <span className="hidden sm:inline">Hospital</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" /> 
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="specialties" className="gap-2">
            <Shield className="h-4 w-4" /> 
            <span className="hidden sm:inline">Specialties</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications tab */}
        <TabsContent value="notifications">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            <div>
              <h3 className="text-base font-semibold text-card-foreground">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose how you want to receive notifications</p>
            </div>
            <div className="space-y-3">
              {[
                { 
                  label: 'Email Notifications', 
                  desc: 'Receive shift updates and approvals via email', 
                  checked: emailNotif, 
                  onChange: setEmailNotif 
                },
                { 
                  label: 'SMS Notifications', 
                  desc: 'Get text alerts for emergency and on-call duties', 
                  checked: smsNotif, 
                  onChange: setSmsNotif 
                },
                { 
                  label: 'In-App Notifications', 
                  desc: 'Show notifications within the application', 
                  checked: inAppNotif, 
                  onChange: setInAppNotif 
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch checked={item.checked} onCheckedChange={item.onChange} />
                </div>
              ))}
            </div>
            <Button className="gap-2" onClick={handleSaveNotifications}>
              <Save className="h-4 w-4" /> Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* Hospital tab */}
        <TabsContent value="hospital" className="space-y-6">
          {/* Hospital Logo */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Hospital Logo</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {logoPreview ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg border border-border">
                    <img 
                      src={logoPreview} 
                      alt="Hospital Logo" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <Building2 className="h-12 w-12 text-white" />
                  </div>
                )}
                <label htmlFor="logo-upload" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors cursor-pointer">
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-1">Upload hospital logo</p>
                <p className="text-xs text-muted-foreground mb-3">PNG, JPG or SVG. Max size 2MB</p>
                <label htmlFor="logo-upload">
                  <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('logo-upload')?.click()}>
                    Choose File
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            <h3 className="text-base font-semibold text-card-foreground">Hospital Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hospital-name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Hospital Name
                </Label>
                <Input 
                  id="hospital-name" 
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                <Textarea 
                  id="address" 
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  rows={2} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contact Number
                </Label>
                <Input 
                  id="contact" 
                  value={hospitalPhone}
                  onChange={(e) => setHospitalPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-hours">Max Weekly Hours (Default)</Label>
                <Input 
                  id="max-hours" 
                  type="number" 
                  value={maxWeeklyHours}
                  onChange={(e) => setMaxWeeklyHours(parseInt(e.target.value) || 48)}
                />
              </div>
            </div>
            <Button className="gap-2" onClick={handleSaveHospitalSettings}>
              <Save className="h-4 w-4" /> Update Hospital Info
            </Button>
          </div>
        </TabsContent>

        {/* Roles tab */}
        <TabsContent value="roles">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-card-foreground">Manage Roles</h3>
                <p className="text-sm text-muted-foreground mt-1">Create and manage user roles</p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  💡 Tip: Instead of deleting, you can deactivate roles that are in use
                </p>
              </div>
              <Button onClick={() => openRoleDialog()} className="gap-2">
                <Plus className="h-4 w-4" /> Add Role
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.display_name}</TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        role.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openRoleDialog(role)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role.id)}
                          title="Delete role (only if not assigned to users)"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Specialties tab */}
        <TabsContent value="specialties">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-card-foreground">Manage Specialties</h3>
                <p className="text-sm text-muted-foreground mt-1">Create and manage medical specialties for doctors</p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  💡 Tip: Instead of deleting, you can deactivate specialties that are in use
                </p>
              </div>
              <Button onClick={() => openSpecialtyDialog()} className="gap-2">
                <Plus className="h-4 w-4" /> Add Specialty
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell>{specialty.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        specialty.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {specialty.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openSpecialtyDialog(specialty)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteSpecialty(specialty.id)}
                          title="Delete specialty (only if not assigned to doctors)"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update the role information' : 'Create a new role for staff members'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Display Name</Label>
              <Input
                id="role-name"
                value={roleForm.display_name}
                onChange={(e) => setRoleForm({ ...roleForm, display_name: e.target.value })}
                placeholder="e.g., Physician Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Brief description of the role"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="role-active">Active</Label>
              <Switch
                id="role-active"
                checked={roleForm.is_active}
                onCheckedChange={(checked) => setRoleForm({ ...roleForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Specialty Dialog */}
      <Dialog open={specialtyDialogOpen} onOpenChange={setSpecialtyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}</DialogTitle>
            <DialogDescription>
              {editingSpecialty ? 'Update the specialty information' : 'Create a new medical specialty'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty-name">Name</Label>
              <Input
                id="specialty-name"
                value={specialtyForm.name}
                onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })}
                placeholder="e.g., Gastroenterology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty-description">Description</Label>
              <Textarea
                id="specialty-description"
                value={specialtyForm.description}
                onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })}
                placeholder="Brief description of the specialty"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="specialty-active">Active</Label>
              <Switch
                id="specialty-active"
                checked={specialtyForm.is_active}
                onCheckedChange={(checked) => setSpecialtyForm({ ...specialtyForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecialtyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSpecialty}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <Dialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Role</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-card-foreground mb-2">
                Are you sure you want to delete "{roleToDelete?.display_name}"?
              </p>
              <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This role cannot be deleted if it's currently assigned to any users. 
                  Consider deactivating it instead to preserve existing assignments.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteRoleDialogOpen(false);
                setRoleToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRole}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Specialty Confirmation Dialog */}
      <Dialog open={deleteSpecialtyDialogOpen} onOpenChange={setDeleteSpecialtyDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Specialty</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-card-foreground mb-2">
                Are you sure you want to delete "{specialtyToDelete?.name}"?
              </p>
              <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This specialty cannot be deleted if it's currently assigned to any doctors. 
                  Consider deactivating it instead to preserve existing assignments.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteSpecialtyDialogOpen(false);
                setSpecialtyToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteSpecialty}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Specialty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
