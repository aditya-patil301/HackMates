import { timeAgo } from "../lib/api";

export default function PostCard({ post, user, onInterest }) {
  const mine = user && user.email === post.ownerEmail;
  const closed = post.status !== "open";

  return (
    <article className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${closed ? "opacity-70" : ""}`}>
      {post.imageUrl && <img src={post.imageUrl} alt={post.hackathon} loading="lazy" className="h-40 w-full object-cover" />}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight">{post.hackathon}</h3>
          <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${closed ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-700"}`}>
            {closed ? "Closed" : "Open"}
          </span>
        </div>
        {post.description && <p className="text-sm text-slate-600 line-clamp-3">{post.description}</p>}
        <div className="flex flex-wrap gap-1.5">
          {post.skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{s}</span>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Looking for <b>{post.teamSize}</b> teammate{post.teamSize > 1 ? "s" : ""}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            by {post.ownerName} · {timeAgo(post.createdAt)}
            <br />
            {post.interestCount || 0} interested
          </div>
          {mine ? (
            <span className="text-xs text-slate-500">Your post</span>
          ) : (
            <button
              disabled={closed}
              onClick={() => onInterest(post)}
              className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {closed ? "Closed" : "I'm Interested"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}