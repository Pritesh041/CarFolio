import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "../lib/format";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { FieldGroup, Input, Textarea } from "../components/ui/Field";
import { StatTile } from "../components/ui/StatTile";
import { PinIcon, LinkIcon, CalendarIcon } from "../components/layout/icons";
import type { AnalyticsSummary, ProfileResponse } from "../types";

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function displayHost(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

interface ProfileForm {
  name: string;
  bio: string;
  location: string;
  website: string;
}

function toForm(profile: ProfileResponse): ProfileForm {
  return {
    name: profile.name,
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
  };
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [form, setForm] = useState<ProfileForm>({ name: "", bio: "", location: "", website: "" });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get<ProfileResponse>(`/users/${user.username}`), api.get<AnalyticsSummary>("/users/me/stats")]).then(
      ([profileRes, summaryRes]) => {
        setProfile(profileRes.data);
        setForm(toForm(profileRes.data));
        setSummary(summaryRes.data);
      },
    );
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.patch<ProfileResponse>("/users/me", {
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        website: form.website.trim() ? withProtocol(form.website.trim()) : "",
      });
      setProfile(data);
      setForm(toForm(data));
      updateUser({ name: data.name });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEdit() {
    if (profile) setForm(toForm(profile));
    setIsEditing(false);
  }

  async function handleAvatarUpload(file: File) {
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post<ProfileResponse>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  if (!profile) {
    return <div className="h-64 animate-pulse rounded-card bg-cream" />;
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="group relative h-20 w-20 shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ink font-display text-2xl font-bold text-paper">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 text-[11px] font-medium uppercase tracking-wide text-paper opacity-0 transition-opacity group-hover:opacity-100"
            >
              {isUploadingAvatar ? "…" : "Change"}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                e.target.value = "";
              }}
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Die-Cast Collector</p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl">{profile.name}</h1>
            <p className="mt-1 text-sm text-graphite-text">@{profile.username}</p>
          </div>
        </div>
        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-graphite-text">
        <span>
          <span className="font-semibold text-ink">{profile.followersCount}</span> followers ·{" "}
          <span className="font-semibold text-ink">{profile.followingCount}</span> following
        </span>
        {profile.location && (
          <span className="inline-flex items-center gap-1.5">
            <PinIcon width={15} height={15} />
            {profile.location}
          </span>
        )}
        {profile.website && (
          <a
            href={withProtocol(profile.website)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-accent hover:underline"
          >
            <LinkIcon width={15} height={15} />
            {displayHost(profile.website)}
          </a>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon width={15} height={15} />
          Joined {joinedLabel(profile.joinedAt)}
        </span>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Cars" value={String(summary.totalModels)} />
          <StatTile label="Collection Value" value={formatCurrency(summary.collectionValue)} />
          <StatTile
            label="Growth"
            value={`${summary.growthPercent > 0 ? "+" : ""}${summary.growthPercent.toFixed(1)}%`}
          />
        </div>
      )}

      {profile.favoriteBrands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {profile.favoriteBrands.map((brand) => (
            <Badge key={brand} tone="accent">
              {brand}
            </Badge>
          ))}
        </div>
      )}

      <Card className="p-6 sm:p-8">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <FieldGroup label="Display name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                maxLength={120}
                required
              />
            </FieldGroup>
            <FieldGroup label="Bio">
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell other collectors about yourself"
                rows={4}
                maxLength={280}
              />
            </FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Location">
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country"
                  maxLength={120}
                />
              </FieldGroup>
              <FieldGroup label="Website">
                <Input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="yourdomain.com"
                  maxLength={255}
                />
              </FieldGroup>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEdit} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        ) : profile.bio ? (
          <p className="text-base leading-relaxed text-graphite-text">{profile.bio}</p>
        ) : (
          <p className="text-sm text-graphite-text">
            You haven't added a bio yet. Click "Edit Profile" to tell other collectors about yourself.
          </p>
        )}
      </Card>
    </div>
  );
}
