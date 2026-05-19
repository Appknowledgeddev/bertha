"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { feedbackStatuses } from "@/lib/feedback";
import type { FeedbackRequest } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function findItem(items: FeedbackRequest[], id: string) {
  return items.find((item) => item.id === id) ?? null;
}

function findStatusForId(items: FeedbackRequest[], id: string) {
  if (feedbackStatuses.includes(id as (typeof feedbackStatuses)[number])) {
    return id;
  }

  return findItem(items, id)?.status ?? null;
}

function AdminLane({
  status,
  count,
  children,
}: {
  status: string;
  count: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`adminLane${isOver ? " adminLaneOver" : ""}`}
    >
      <header className="adminLaneHeader">
        <h2>{status}</h2>
        <span>{count}</span>
      </header>
      <div className="adminLaneStack">{children}</div>
    </section>
  );
}

function SortableAdminCard({
  item,
  onStatusChange,
  busy,
}: {
  item: FeedbackRequest;
  onStatusChange: (id: string, status: string) => Promise<void>;
  busy: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ?? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`feedbackCard adminCard${isDragging ? " adminCardDragging" : ""}`}
    >
      <div className="adminCardMain">
        <button
          className="dragHandle"
          type="button"
          aria-label={`Drag ${item.title}`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>

        <div className="feedbackCardHeader">
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          <span className="statusPill">{item.status}</span>
        </div>

        <div className="feedbackMeta">
          <span>{item.category}</span>
          <span>{item.author_name}</span>
          <span>{item.upvotes} upvotes</span>
          <span>{item.downvotes} downvotes</span>
        </div>
      </div>

      <label className="field adminSelectField">
        <span>Status</span>
        <select
          value={item.status}
          disabled={busy}
          onChange={(event) => void onStatusChange(item.id, event.target.value)}
        >
          {feedbackStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}

export function AdminDashboard({ items }: { items: FeedbackRequest[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [boardItems, setBoardItems] = useState(items);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    setBoardItems(items);
  }, [items]);

  const groupedItems = useMemo(
    () =>
      feedbackStatuses.map((status) => ({
        status,
        items: boardItems.filter((item) => item.status === status),
      })),
    [boardItems],
  );

  const handleStatusChange = async (id: string, status: string) => {
    const previousItems = boardItems;
    setBusyId(id);
    setBoardItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    const response = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    setBusyId(null);

    if (!response.ok) {
      setBoardItems(previousItems);
      return;
    }

    startTransition(() => router.refresh());
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId || activeId === overId) {
      return;
    }

    const nextStatus = findStatusForId(boardItems, overId);
    const activeItem = findItem(boardItems, activeId);

    if (!nextStatus || !activeItem || activeItem.status === nextStatus) {
      return;
    }

    await handleStatusChange(activeId, nextStatus);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <section className="contentColumn">
      <div className="adminTopbar">
        <button className="secondaryButton" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="pageIntro adminIntro">
        <div>
          <p className="eyebrow">Birtha admin</p>
          <h1>Roadmap control</h1>
          <p>Drag requests between columns or use the dropdown as a fallback.</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <div className="adminBoard">
          {groupedItems.map((group) => (
            <AdminLane
              key={group.status}
              status={group.status}
              count={group.items.length}
            >
              <SortableContext
                items={group.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {group.items.length ? (
                  group.items.map((item) => (
                    <SortableAdminCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id || isPending}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <p className="laneEmpty">Drop a request here.</p>
                )}
              </SortableContext>
            </AdminLane>
          ))}
        </div>
      </DndContext>
    </section>
  );
}
