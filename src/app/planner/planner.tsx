"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, addDays } from "date-fns";


type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

type Meal = {
  id: string;
  date: string; 
  name: string;
  type: MealType;
  servings: number;
  calories?: number;
  ingredients: string[]; 
  notes?: string;
  templateOf?: string | null;
};

type Template = {
  id: string;
  name: string;
  nameOfMeal: string;
  type: MealType;
  servings: number;
  calories?: number;
  ingredients: string[];
  notes?: string;
};


const LS_MEALS = "meal-planner:meals:v1";
const LS_TEMPLATES = "meal-planner:templates:v1";

/** Helpers */
const uid = () => Math.random().toString(36).slice(2, 9);
const isoDate = (d: Date) => format(d, "yyyy-MM-dd");
const prettyDate = (iso: string) => format(parseISO(iso), "PPP");

export default function MealPlanner() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState<MealType>("Lunch");
  const [servings, setServings] = useState<number>(1);
  const [calories, setCalories] = useState<number | "">("");
  const [ingredientsText, setIngredientsText] = useState(""); 
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);



  // persist meals & templates
  useEffect(() => {
    try {
      localStorage.setItem(LS_MEALS, JSON.stringify(meals));
    } catch (e) {}
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_TEMPLATES, JSON.stringify(templates));
    } catch (e) {}
  }, [templates]);

  const isoSelected = isoDate(selectedDate);

  const mealsForDay = useMemo(
    () => meals.filter((m) => m.date === isoSelected).sort((a, b) => a.type.localeCompare(b.type)),
    [meals, isoSelected]
  );

  function resetForm() {
    setName("");
    setType("Lunch");
    setServings(1);
    setCalories("");
    setIngredientsText("");
    setNotes("");
    setEditingId(null);
  }

  function addOrUpdateMeal(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    const ings = ingredientsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const mealObj: Omit<Meal, "id"> = {
      date: isoSelected,
      name: name.trim(),
      type,
      servings,
      calories: typeof calories === "number" ? calories : undefined,
      ingredients: ings,
      notes: notes.trim() || undefined,
      templateOf: editingId ? undefined : null,
    };

    if (editingId) {
      setMeals((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...mealObj } : m)));
    } else {
      setMeals((prev) => [{ id: uid(), ...mealObj }, ...prev]);
    }
    resetForm();
  }

  function editMeal(meal: Meal) {
    setEditingId(meal.id);
    setName(meal.name);
    setType(meal.type);
    setServings(meal.servings);
    setCalories(meal.calories ?? "");
    setIngredientsText(meal.ingredients.join("\n"));
    setNotes(meal.notes ?? "");
    setSelectedDate(parseISO(meal.date));
  }

  function deleteMeal(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function saveTemplateFromForm() {
    if (!name.trim()) return;
    const newTpl: Template = {
      id: uid(),
      name: `${name.trim()} template`,
      nameOfMeal: name.trim(),
      type,
      servings,
      calories: typeof calories === "number" ? calories : undefined,
      ingredients: ingredientsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
    };
    setTemplates((p) => [newTpl, ...p]);
  }

  function applyTemplate(tpl: Template) {
    setName(tpl.nameOfMeal);
    setType(tpl.type);
    setServings(tpl.servings);
    setCalories(tpl.calories ?? "");
    setIngredientsText(tpl.ingredients.join("\n"));
    setNotes(tpl.notes ?? "");
  }

  /** Grocery: collect ingredients */
  function aggregateGroceryList(rangeStart: Date, rangeEnd: Date) {
    const startIso = isoDate(rangeStart);
    const endIso = isoDate(rangeEnd);
    const inRange = meals.filter((m) => m.date >= startIso && m.date <= endIso);
    const items: Record<string, number> = {}; 
    inRange.forEach((m) => {
      m.ingredients.forEach((ing) => {
        const key = ing.toLowerCase();
        items[key] = (items[key] || 0) + 1 * (m.servings || 1);
      });
    });
    // convert to array
    return Object.entries(items).map(([ingredient, qty]) => ({ ingredient, qty }));
  }

  function groceryForSelectedWeek() {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Mon
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return aggregateGroceryList(start, end);
  }

  /** CSV export of meals */
  function exportCSV() {
    const header = ["date", "name", "type", "servings", "calories", "ingredients", "notes"];
    const rows = meals.map((m) => [
      m.date,
      m.name,
      m.type,
      String(m.servings),
      m.calories ? String(m.calories) : "",
      m.ingredients.join("; "),
      m.notes ?? "",
    ]);
    const csv =
      [header, ...rows]
        .map((r) =>
          r
            .map((cell) => {
              // basic escaping
              if (cell == null) return "";
              const s = String(cell).replace(/"/g, '""');
              return `"${s}"`;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meal-planner-${format(new Date(), "yyyyMMdd")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Quick UI helpers */
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const groceryList = groceryForSelectedWeek();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Meal Planner</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d: Date | undefined) => {
              if (!d) return;
              setSelectedDate(d);
            }}
          />
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div>Selected: <strong>{prettyDate(isoSelected)}</strong></div>
            <div>Week: {prettyDate(isoDate(weekStart))} — {prettyDate(isoDate(weekEnd))}</div>
            <div>{groceryList.length} grocery item(s) suggested for the week.</div>
          </div>
        </div>

        {/* Form + today's meals */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 rounded-md border">
            <h3 className="font-medium mb-2">Add / Edit Meal — {prettyDate(isoSelected)}</h3>
            <form onSubmit={(e) => addOrUpdateMeal(e)} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Meal name (e.g., Chicken Bowl)"
                  className="flex-1 input border"
                />
                <select value={type} onChange={(e) => setType(e.target.value as MealType)} className="input">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
                <input
                  type="number"
                  value={servings}
                  min={1}
                  onChange={(e) => setServings(Math.max(1, Number(e.target.value || 1)))}
                  className="w-28 input"
                  title="Servings"
                />
                <input
                  type="number"
                  value={calories.toString()}
                  onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="cal"
                  className="w-28 input"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Ingredients (one per line)</label>
                <textarea
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  rows={4}
                  placeholder={"e.g.\nChicken breast\nBrown rice\nBroccoli\nLemon juice"}
                  className="w-full textarea"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Notes / recipe steps (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full textarea" />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">{editingId ? "Update Meal" : "Add Meal"}</button>
                <button type="button" onClick={resetForm} className="btn btn-ghost">Clear</button>
                <button type="button" onClick={saveTemplateFromForm} className="btn btn-outline">Save as Template</button>
                <button type="button" onClick={() => {
                  navigator.clipboard?.readText().then(text => {
                    if (!text) return;
                    setIngredientsText((t) => (t ? `${t}\n${text}` : text));
                  }).catch(()=>{})
                }} className="btn btn-ghost">Paste ingredients</button>
              </div>
            </form>
          </div>

          <div className="p-4 rounded-md border">
            <h4 className="font-medium mb-2">Meals on {prettyDate(isoSelected)}</h4>
            {mealsForDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meals planned for this day.</p>
            ) : (
              <ul className="space-y-3">
                {mealsForDay.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="rounded-md px-2 py-1 bg-muted text-sm">{m.type}</span>
                        <strong className="text-lg">{m.name}</strong>
                        <span className="text-sm text-muted-foreground">· {m.servings} serving(s){m.calories?` · ${m.calories} kcal`:''}</span>
                      </div>
                      {m.ingredients.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Ingredients: {m.ingredients.slice(0, 6).join(", ")}{m.ingredients.length>6?` +${m.ingredients.length-6} more`:''}
                        </div>
                      )}
                      {m.notes && <div className="text-sm mt-1">{m.notes}</div>}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1">
                        <button onClick={() => editMeal(m)} className="btn btn-sm btn-ghost">Edit</button>
                        <button onClick={() => deleteMeal(m.id)} className="btn btn-sm btn-danger">Delete</button>
                      </div>
                      <div className="text-xs text-muted-foreground">{m.templateOf ? "From template" : ""}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-2">Templates</h4>
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No templates saved yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {templates.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-sm text-muted-foreground">{t.nameOfMeal} · {t.type} · {t.servings} serving(s){t.calories?` · ${t.calories} kcal`:''}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => applyTemplate(t)} className="btn btn-sm btn-ghost">Use</button>
                          <button onClick={() => setTemplates(prev => prev.filter(p => p.id !== t.id))} className="btn btn-sm btn-danger">Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-2">Grocery List — Week</h4>
              {groceryList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No grocery items for this week.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {groceryList.map((g) => (
                    <li key={g.ingredient} className="flex justify-between">
                      <span>{g.ingredient}</span>
                      <span className="text-muted-foreground">×{g.qty}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex gap-2">
                <button onClick={() => {
                  const text = groceryList.map(g => `${g.ingredient} x${g.qty}`).join("\n");
                  navigator.clipboard?.writeText(text);
                }} className="btn btn-ghost btn-sm">Copy list</button>

                <button onClick={() => {
                  const html = `
                    <html><head><title>Grocery List</title>
                    <style>body{font-family:Arial;padding:20px}</style></head><body>
                    <h3>Grocery List — week ${prettyDate(isoDate(weekStart))} — ${prettyDate(isoDate(weekEnd))}</h3>
                    <ul>${groceryList.map(g => `<li>${g.ingredient} × ${g.qty}</li>`).join("")}</ul>
                    </body></html>
                  `;
                  const w = window.open("", "_blank");
                  if (w) {
                    w.document.write(html);
                    w.document.close();
                  }
                }} className="btn btn-outline btn-sm">Open printable</button>

                <button onClick={exportCSV} className="btn btn-primary btn-sm">Export CSV</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
