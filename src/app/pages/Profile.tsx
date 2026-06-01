import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Moon,
  Globe,
  CreditCard,
  Settings,
  LogOut,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  const handleLanguageChange = async (lang: string) => {
    setChangingLanguage(true);
    try {
      await changeLanguage(lang);
      toast.success(`Language changed to ${languages.find(l => l.code === lang)?.nativeName}!`);
    } catch (error) {
      toast.error('Failed to change language');
    } finally {
      setChangingLanguage(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await signOut();

    if (error) {
      toast.error('Failed to logout');
      setLoggingOut(false);
    } else {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">{t('profileSettings')}</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-gray-600">{userEmail}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {loggingOut ? 'Logging out...' : t('logout')}
          </Button>
        </div>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">{t('personalInfo')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">{t('personalInfo')}</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('firstName')}</Label>
                  <Input id="firstName" defaultValue="Alex" />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('lastName')}</Label>
                  <Input id="lastName" defaultValue="Morgan" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue="alex.morgan@example.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">{t('location')}</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="location"
                    defaultValue="New York, USA"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSave}>{t('saveChanges')}</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Password</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">2FA Enabled</p>
                      <p className="text-sm text-gray-600">
                        Extra security for your account
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Biometric Authentication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Face ID</p>
                      <p className="text-sm text-gray-600">Use Face ID to login</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Fingerprint</p>
                      <p className="text-sm text-gray-600">Use fingerprint to login</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Fraud Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified about suspicious activity
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Budget Alerts</p>
                    <p className="text-sm text-gray-600">
                      Notify when approaching budget limits
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Transaction Updates</p>
                    <p className="text-sm text-gray-600">
                      Get notified for every transaction
                    </p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">AI Insights</p>
                    <p className="text-sm text-gray-600">
                      Receive personalized spending insights
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email Reports</p>
                    <p className="text-sm text-gray-600">Weekly spending summary via email</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">App Preferences</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Appearance</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Moon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-600">Use dark theme</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">{t('regionalSettings')}</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currency">{t('currency')}</Label>
                    <Input id="currency" defaultValue="USD - US Dollar" />
                  </div>
                  <div>
                    <Label htmlFor="language">{t('languagePreference')}</Label>
                    <Select
                      value={currentLanguage}
                      onValueChange={handleLanguageChange}
                      disabled={changingLanguage}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                              <span className="text-sm text-muted-foreground">({lang.name})</span>
                              {currentLanguage === lang.code && (
                                <Check className="w-4 h-4 ml-auto text-green-600" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {changingLanguage ? 'Changing language...' : 'This will change the language for the entire app'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="timezone">{t('timezone')}</Label>
                    <Input id="timezone" defaultValue="Eastern Time (ET)" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Data & Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Share Analytics</p>
                      <p className="text-sm text-gray-600">
                        Help improve AI predictions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Auto Categorization</p>
                      <p className="text-sm text-gray-600">
                        Let AI categorize transactions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave}>{t('savePreferences')}</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h3 className="font-bold text-lg mb-4 text-red-600">{t('dangerZone')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium">{t('exportData')}</p>
              <p className="text-sm text-gray-600">Download all your transaction data</p>
            </div>
            <Button variant="outline">{t('exportData')}</Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium">{t('deleteAccount')}</p>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">{t('delete')}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
