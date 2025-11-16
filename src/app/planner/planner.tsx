"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { Plus, Trash2, Edit2, Copy, Printer, Download } from 'lucide-react';

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

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_MEALS);
      if (raw) setMeals(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load meals", e);
    }
    try {
      const rawTemplates = localStorage.getItem(LS_TEMPLATES);
      if (rawTemplates) setTemplates(JSON.parse(rawTemplates));
    } catch (e) {
      console.error("Failed to load templates", e);
    }
  }, []);

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
    <div className="min-h-screen bg-amber-500">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Meal Planner
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Plan your meals, save recipes, and generate a weekly grocery list automatically.
              </p>
            </div>
            <button 
              onClick={exportCSV} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap font-medium"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Selected Date</div>
                  <div className="text-lg font-semibold text-foreground">{prettyDate(isoSelected)}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="block">Week: {format(parseISO(isoDate(weekStart)), "MMM dd")} – {format(parseISO(isoDate(weekEnd)), "MMM dd")}</span>
                  </div>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d: Date | undefined) => {
                    if (!d) return;
                    setSelectedDate(d);
                  }}
                  className="[&_button]:rounded-md [&_button]:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                Add / Edit Meal
              </h2>
              <p className="text-sm text-muted-foreground mb-4">For {prettyDate(isoSelected)}</p>

              <form onSubmit={(e) => addOrUpdateMeal(e)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Meal name (e.g., Chicken Bowl)"
                      className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                  <div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as MealType)}
                      className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
                    >
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snack</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      value={servings}
                      min={1}
                      onChange={(e) => setServings(Math.max(1, Number(e.target.value || 1)))}
                      placeholder="Servings"
                      className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="number"
                    value={calories.toString()}
                    onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Calories (optional)"
                    className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Ingredients (one per line)</label>
                  <textarea
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    rows={3}
                    placeholder={"e.g.\nChicken breast\nBrown rice\nBroccoli"}
                    className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Notes / Recipe Steps</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional notes or cooking instructions"
                    className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Plus size={18} />
                    {editingId ? "Update Meal" : "Add Meal"}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-4 py-2 border border-input text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium"
                  >
                    Clear
                  </button>
                  <button 
                    type="button" 
                    onClick={saveTemplateFromForm} 
                    className="px-4 py-2 border border-input text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium"
                  >
                    Save Template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.readText().then(text => {
                        if (!text) return;
                        setIngredientsText((t) => (t ? `${t}\n${text}` : text));
                      }).catch(()=>{})
                    }}
                    className="px-4 py-2 border border-input text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium"
                  >
                    Paste
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Today's Meals</h3>

              {mealsForDay.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No meals planned for this day yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {mealsForDay.map((m) => (
                    <li key={m.id} className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.type === "Breakfast" ? "bg-orange-100 text-orange-700" :
                            m.type === "Lunch" ? "bg-blue-100 text-blue-700" :
                            m.type === "Dinner" ? "bg-purple-100 text-purple-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {m.type}
                          </span>
                          <span className="text-base font-semibold text-foreground">{m.name}</span>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{m.servings} serving{m.servings !== 1 ? "s" : ""}{m.calories ? ` · ${m.calories} kcal` : ""}</div>
                          {m.ingredients.length > 0 && (
                            <div className="truncate">
                              {m.ingredients.slice(0, 4).join(", ")}{m.ingredients.length > 4 ? ` +${m.ingredients.length - 4} more` : ""}
                            </div>
                          )}
                        </div>
                        {m.notes && <div className="text-sm mt-2 text-foreground italic">{m.notes}</div>}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => editMeal(m)} 
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteMeal(m.id)} 
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Saved Templates</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No templates saved yet. Create a meal and save it as a template!</p>
                  ) : (
                    <ul className="space-y-2">
                      {templates.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{t.nameOfMeal}</div>
                            <div className="text-xs text-muted-foreground truncate">{t.type} · {t.servings} serving{t.servings !== 1 ? "s" : ""}{t.calories ? ` · ${t.calories} kcal` : ""}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button 
                              onClick={() => applyTemplate(t)} 
                              className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-medium transition-colors"
                            >
                              Use
                            </button>
                            <button 
                              onClick={() => setTemplates(prev => prev.filter(p => p.id !== t.id))} 
                              className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Weekly Grocery List</h4>
                {groceryList.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No grocery items for this week yet.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <ul className="space-y-2">
                      {groceryList.map((g) => (
                        <li key={g.ingredient} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm text-foreground capitalize">{g.ingredient}</span>
                          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            ×{g.qty}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      const text = groceryList.map(g => `☐ ${g.ingredient} x${g.qty}`).join("\n");
                      navigator.clipboard?.writeText(text);
                    }} 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-input text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium"
                  >
                    <Copy size={16} />
                    Copy List
                  </button>

                  <button 
                    onClick={() => {
                      const html = `
                        <html><head><title>Grocery List</title>
                        <style>body{font-family:system-ui;padding:24px;max-width:600px}h2{color:#333;margin-bottom:16px}ul{list-style:none;padding:0}li{padding:8px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between}</style></head><body>
                        <h2>🛒 Grocery List</h2>
                        <p>Week: ${format(parseISO(isoDate(weekStart)), "MMM dd")} – ${format(parseISO(isoDate(weekEnd)), "MMM dd")}</p>
                        <ul>${groceryList.map(g => `<li><span>${g.ingredient}</span><span>× ${g.qty}</span></li>`).join("")}</ul>
                        </body></html>
                      `;
                      const w = window.open("", "_blank");
                      if (w) {
                        w.document.write(html);
                        w.document.close();
                      }
                    }} 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-input text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
