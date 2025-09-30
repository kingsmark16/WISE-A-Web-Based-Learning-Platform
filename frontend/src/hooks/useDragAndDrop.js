import { useState, useEffect, useRef } from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export const useDragAndDrop = (modules, onReorder) => {
  const [localModules, setLocalModules] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const prevModulesJsonRef = useRef(null);

  // Only update localModules when the incoming modules array actually differs
  useEffect(() => {
    // don't overwrite local ordering while user is dragging
    if (activeId) return;

    try {
      const incoming = JSON.stringify(modules ?? []);
      if (prevModulesJsonRef.current !== incoming) {
        prevModulesJsonRef.current = incoming;
        setLocalModules(modules ?? []);
      }
    } catch {
      // fallback: set once when safe (not dragging)
      setLocalModules(modules ?? []);
    }
  }, [modules, activeId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = localModules.findIndex(m => m.id === active.id);
    const newIndex = localModules.findIndex(m => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(localModules, oldIndex, newIndex);

    // update client ordering immediately
    setLocalModules(next);

    // prepare positions (1-based positions)
    const payload = next.map((m, idx) => ({ id: m.id, position: idx + 1 }));

    // call reorder mutation
    onReorder(payload);
  };

  return {
    localModules,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
};