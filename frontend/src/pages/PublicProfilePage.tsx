import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { CollectionCard } from "../components/ui/CollectionCard";
import { PinIcon, LinkIcon, CalendarIcon } from "../components/layout/icons";
import type { ProfileResponse } from "../types";

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function displayHost(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowBusy, setIsFollowBusy] = useState(false);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    api
      .get<ProfileResponse>(`/users/${username}`)
      .then((res) => setProfile(res.data))
      .catch((err) => setError(extractErrorMessage(err, "This profile isn't available")))
      .finally(() => setIsLoading(false));
  }, [username]);

  async function handleFollowToggle() {
    if (!profile) return;
    setIsFollowBusy(true);
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${profile.username}/follow`);
        setProfile({ ...profile, isFollowing: false, followersCount: profile.followersCount - 1 });
      } else {
        await api.post(`/users/${profile.username}/follow`);
        setProfile({ ...profile, isFollowing: true, followersCount: profile.followersCount + 1 });
      }
    } finally {
      setIsFollowBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl py-24">
        <EmptyState eyebrow="Not found" title="Profile not available" description={error ?? "This collector doesn't exist."} />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-2">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-display text-2xl font-bold text-paper">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Die-Cast Collector</p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl">{profile.name}</h1>
            <p className="mt-1 text-sm text-graphite-text">@{profile.username}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-graphite-text">
              {profile.followersCount} followers · {profile.followingCount} following
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-graphite-text">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon width={13} height={13} />
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
                  <LinkIcon width={13} height={13} />
                  {displayHost(profile.website)}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon width={13} height={13} />
                Joined {joinedLabel(profile.joinedAt)}
              </span>
            </div>
          </div>
        </div>
        {user && user.username !== profile.username && (
          <Button
            variant={profile.isFollowing ? "secondary" : "primary"}
            onClick={handleFollowToggle}
            disabled={isFollowBusy}
          >
            {profile.isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {profile.bio && <p className="max-w-2xl text-base text-graphite-text">{profile.bio}</p>}

      {profile.favoriteBrands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {profile.favoriteBrands.map((brand) => (
            <Badge key={brand} tone="accent">
              {brand}
            </Badge>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">The Garage</h2>
        {profile.publicCollections.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              eyebrow="Nothing shared yet"
              title="No public showcases"
              description="This collector hasn't published any showcases."
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profile.publicCollections.map((collection) => (
              <CollectionCard
                key={collection.slug}
                href={`/showcase/${profile.username}/${collection.slug}`}
                imageUrl={collection.coverImageUrl}
                title={collection.name}
                size="lg"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
