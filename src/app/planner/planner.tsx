"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";

type PlannerEvent = {
  id: string;
  title: string;
  notes?: string;
  date: string; // ISO date (yyyy-mm-dd) or ISO string
  completed?: boolean;
};

const LS_KEY = "directory-planner-events:v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function DirectoryPlanner() {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: PlannerEvent[] = JSON.parse(raw).map((e: unknown) => ({
          ...(e as PlannerEvent),
        }));
        setEvents(parsed);
      }
    } catch (e) {
      console.error("Failed to load planner events", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error("Failed to save planner events", e);
    }
  }, [events]);

  const eventsForSelectedDay = useMemo(() => {
    return events.filter((ev) =>
      isSameDay(parseISO(ev.date), selectedDate)
    );
  }, [events, selectedDate]);

  function resetForm() {
    setTitle("");
    setNotes("");
    setEditingId(null);
  }

  function handleAddOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const iso = format(selectedDate, "yyyy-MM-dd");

    if (editingId) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingId ? { ...ev, title: title.trim(), notes, date: iso } : ev
        )
      );
    } else {
      const newEvent: PlannerEvent = {
        id: uid(),
        title: title.trim(),
        notes,
        date: iso,
        completed: false,
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    resetForm();
  }

  function handleEdit(ev: PlannerEvent) {
    setEditingId(ev.id);
    setTitle(ev.title);
    setNotes(ev.notes ?? "");
    setSelectedDate(parseISO(ev.date));
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleComplete(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Directory Planner</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar column */}
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d: Date | undefined) => {
              if (!d) return;
              setSelectedDate(d);
            }}
            className="w-full"
          />
        </div>

        {/* Events + form column */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 rounded-md border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium">
                  {format(selectedDate, "PPP")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {eventsForSelectedDay.length} event(s)
                </p>
              </div>
            </div>

            <form onSubmit={(e) => handleAddOrUpdate(e)} className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                  className="flex-1 input border"
                />
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-ghost"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full textarea"
                rows={3}
              />
            </form>
          </div>

          <div className="p-4 rounded-md border">
            <h4 className="font-medium mb-2">Events</h4>

            {eventsForSelectedDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events for this day.</p>
            ) : (
              <ul className="space-y-2">
                {eventsForSelectedDay.map((ev) => (
                  <li key={ev.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!ev.completed}
                          onChange={() => toggleComplete(ev.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className={`font-medium ${ev.completed ? "line-through text-muted-foreground" : ""}`}>
                            {ev.title}
                          </div>
                          {ev.notes ? (
                            <div className="text-sm text-muted-foreground">{ev.notes}</div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(ev)} className="btn btn-sm btn-ghost">Edit</button>
                      <button onClick={() => handleDelete(ev.id)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Optional: show all events calendar highlights */}
          <div className="p-4 rounded-md border">
            <h4 className="font-medium mb-2">All events (few latest)</h4>
            <ul className="text-sm space-y-1">
              {events.slice(0, 10).map((ev) => (
                <li key={ev.id}>
                  <strong>{format(parseISO(ev.date), "PPP")}</strong> — {ev.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
