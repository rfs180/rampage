import { Github } from "lucide-react";

export default function UserProfile() {
  const user = {
    name: "Jeffrey Ready",
    username: "architect",
    title: "Founder of Ready Systems",
    avatarUrl: "https://avatars.githubusercontent.com/u/0000000?v=4", // replace with your image
    bio: "automation architecture. I build AI tools",
    location: "Edmonton, Canada",
    links: {
      website: "https://readysystems.site",
    },
  };

  return (
    <div className="bg-discord-dark rounded-lg p-4 border border-discord-border text-discord-primary w-full max-w-md mx-auto mt-6">
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-16 h-16 rounded-full border border-discord-border"
        />
        <div>
          <h2 className="text-lg font-bold">{user.name}</h2>
          <p className="text-discord-muted text-sm">{user.username}</p>
        </div>
      </div>

      <p className="mt-4 text-sm">{user.bio}</p>

      <div className="mt-4 text-sm text-discord-muted">
        <p>{user.title}</p>
        <p>{user.location}</p>
      </div>

      <div className="mt-4 flex gap-4">
        {user.links.github && (
          <a
            href={user.links.github}
            target="_blank"
            className="text-discord-muted hover:text-discord-primary"
          >
            <Github className="w-5 h-5" />
          </a>
        )}
        {user.links.website && (
          <a
            href={user.links.website}
            target="_blank"
            className="text-sm hover:text-discord-primary underline"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
