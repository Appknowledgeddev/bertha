"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const categories = ["Feature Requests", "Bugs", "Product Ideas"];

export function SubmitIdeaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        authorName: authorName || "Anonymous",
        category,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not save your feedback just yet.");
      return;
    }

    setTitle("");
    setDescription("");
    setAuthorName("");
    setCategory(categories[0]);
    setIsOpen(false);

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <button className="primaryButton submitLaunchButton" onClick={() => setIsOpen(true)}>
        Submit Idea
      </button>

      {isOpen ? (
        <div
          className="modalOverlay"
          onClick={() => {
            if (!isPending) {
              setIsOpen(false);
            }
          }}
        >
          <div className="modalShell" onClick={(event) => event.stopPropagation()}>
            <form className="submitCard submitModalCard" onSubmit={handleSubmit}>
              <div className="modalHeaderRow">
                <div className="submitCardHeader">
                  <h2>Submit Idea</h2>
                  <p>Capture the next request without any admin setup friction.</p>
                </div>

                <button
                  className="modalCloseButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close submit idea form"
                >
                  ×
                </button>
              </div>

              <label className="field">
                <span>Your name (optional)</span>
                <input
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder="Anonymous"
                />
              </label>

              <label className="field">
                <span>Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Title</span>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Send organiser reminder nudges automatically"
                />
              </label>

              <label className="field">
                <span>Description</span>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain what should happen and why it matters."
                />
              </label>

              {error ? <p className="formError">{error}</p> : null}

              <button className="primaryButton" type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Submit Idea"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
