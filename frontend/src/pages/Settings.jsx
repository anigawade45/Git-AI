import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Key,
  Sliders,
  CreditCard,
  ArrowLeft,
  Check,
  Save,
  Shield,
  Sparkles,
  Bot,
} from 'lucide-react';
import { Github } from '@/components/common/Icons';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useMeta } from '@/hooks/useMeta';
import { authService } from '@/services/authService';

export default function Settings() {
  useMeta({
    title: 'Account Settings | GitHub Knowledge Assistant',
    description: 'Manage profile information, OpenAI API keys, and preferences.',
    robots: 'noindex, nofollow',
  });

  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'ai' | 'github' | 'preferences' | 'billing'
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
  const [bio, setBio] = useState('Full-stack developer building AI developer tools.');
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [savedSuccess, setSavedSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile({ name, apiKey, githubUsername });
      setSavedSuccess('Settings saved successfully! Repositories synced.');
      setTimeout(() => setSavedSuccess(''), 3500);
    } catch (err) {
      setSavedSuccess('Failed to update settings. Please try again.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'ai', label: 'AI & API Keys', icon: Key },
    { id: 'github', label: 'GitHub Connection', icon: Github },
    { id: 'preferences', label: 'Appearance', icon: Sliders },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      <DashboardNavbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Back Link */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-1 pb-2 border-b border-border/60">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Account & Assistant Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal profile, OpenAI API keys, GitHub OAuth integrations, and preferences.
          </p>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <Check className="w-4 h-4" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* Tabs & Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* Sidebar Nav Tabs */}
          <div className="md:col-span-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9">

            {/* PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
                <CardHeader className="p-6 pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold text-foreground">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/40 h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Email Address</label>
                    <Input
                      value={email}
                      disabled
                      className="bg-muted/40 h-10 text-xs opacity-70 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">GitHub Username</label>
                    <Input
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. anigawade05 or your-github-handle"
                      className="bg-muted/40 h-10 text-xs font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Enter your public GitHub username to automatically sync your public repositories to your dashboard.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-3 border-t border-border/60 justify-end">
                  <Button onClick={handleSave} className="gap-2 text-xs font-bold cursor-pointer">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* AI & API KEYS */}
            {activeTab === 'ai' && (
              <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
                <CardHeader className="p-6 pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span>AI Model & API Key Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">OpenAI API Key</label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="bg-muted/40 font-mono text-xs h-10"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Your API key is encrypted locally and never transmitted to third parties.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Preferred AI Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border/80 bg-card text-foreground font-mono text-xs"
                    >
                      <option value="gpt-4o">gpt-4o (Recommended - Fast & Capable)</option>
                      <option value="gpt-4-turbo">gpt-4-turbo (High Precision)</option>
                      <option value="claude-3-5-sonnet">claude-3-5-sonnet (Code Reasoning)</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-3 border-t border-border/60 justify-end">
                  <Button onClick={handleSave} className="gap-2 text-xs font-bold cursor-pointer">
                    <Save className="w-4 h-4" />
                    <span>Save Key</span>
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* GITHUB INTEGRATION */}
            {activeTab === 'github' && (
              <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
                <CardHeader className="p-6 pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <span>GitHub Account Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">GitHub Username / Handle</label>
                    <Input
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. anigawade05"
                      className="bg-muted/40 h-10 text-xs font-mono"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold font-mono">
                        GH
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Connected Account</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          github.com/{githubUsername || 'your-username'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="gap-1 font-mono text-[10px]">
                      <Check className="w-3 h-3" /> Active Connection
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-3 border-t border-border/60 justify-end">
                  <Button onClick={handleSave} className="gap-2 text-xs font-bold cursor-pointer">
                    <Save className="w-4 h-4" />
                    <span>Sync Account</span>
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* PREFERENCES */}
            {activeTab === 'preferences' && (
              <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
                <CardHeader className="p-6 pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-bold text-foreground">Appearance & Theme</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60">
                    <div>
                      <p className="font-semibold text-foreground">Active Theme</p>
                      <p className="text-xs text-muted-foreground">Toggle between Light mode and Dark mode.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleTheme} className="capitalize cursor-pointer">
                      {theme} Theme
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Current Subscription</h3>
                    <p className="text-xs text-muted-foreground">Pro Developer Plan ($19/mo)</p>
                  </div>
                  <Badge variant="default" className="text-xs font-bold">
                    Active Plan
                  </Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Repositories Indexed</span>
                    <span className="font-mono">12 / 20</span>
                  </div>
                  <Progress value={60} className="h-2 w-full" />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>AI Assistant Queries</span>
                    <span className="font-mono">246 / 1000</span>
                  </div>
                  <Progress value={24.6} className="h-2 w-full" />
                </div>
              </Card>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
