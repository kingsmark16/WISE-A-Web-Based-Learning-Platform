import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

// Components
import SortableModule from "../modules/SortableModule";
import { AddModuleDialog, EditModuleDialog, DeleteModuleDialog } from "../modules/ModuleDialogs";
import ModuleStats from "../modules/ModuleStats";

// Hooks
import { useModuleManagement } from "../../hooks/useModuleManagement";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

const ModuleContent = () => {
  // keep Accordion controlled for its whole lifetime by initializing to empty string
  const [openId, setOpenId] = useState("");
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  // Use custom hooks for module management and drag-and-drop
  const {
    modules,
    isLoading,
    fetchError,
    createModule,
    isCreating,
    createError,
    editOpen,
    setEditOpen,
    editingModule,
    handleEditModule,
    updateModule,
    isUpdating,
    updateError,
    setDeleteModuleOpen,
    deleteModuleOpen,
    moduleToDelete,
    deleteModule,
    showDeleteDialog, // NEW: Use this to show dialog
    isDeleting,
    reorderModules,
    reorderMutation,
  } = useModuleManagement();

  const {
    localModules,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
  } = useDragAndDrop(modules, reorderModules);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-lg">Modules</h4>
        </div>

        <AddModuleDialog
          open={addModuleOpen}
          onOpenChange={setAddModuleOpen}
          onSubmit={createModule}
          isLoading={isCreating}
          error={createError || fetchError}
          disabled={!modules.length && !isLoading}
        />
      </div>

      {/* Module Statistics */}
      <ModuleStats modules={localModules} />

      {/* Edit Module Dialog */}
      <EditModuleDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={updateModule}
        isLoading={isUpdating}
        error={updateError}
        module={editingModule}
      />

      {/* Delete Module Dialog */}
      <DeleteModuleDialog
        open={deleteModuleOpen}
        onOpenChange={setDeleteModuleOpen}
        onConfirm={deleteModule}
        isLoading={isDeleting}
        module={moduleToDelete}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading modules...</div>
        ) : fetchError ? (
          <div className="text-sm text-destructive">Failed to load modules</div>
        ) : localModules.length === 0 ? (
          <div className="text-sm text-muted-foreground">No modules yet. Add one to get started.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <Accordion
                type="single"
                collapsible
                className="space-y-3"
                value={openId}
                onValueChange={(val) => setOpenId(val || "")}
              >
                {localModules.map((m) => (
                  <SortableModule
                    key={m.id}
                    item={m}
                    listenersDisabled={reorderMutation.isLoading || isUpdating || isDeleting}
                    isOpen={openId === m.id}
                    onEdit={handleEditModule}
                    onDelete={showDeleteDialog} // CHANGED: Use showDeleteDialog instead of deleteModule
                  />
                ))}
              </Accordion>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="rounded-md shadow-lg border border-input bg-card px-6 py-4">
                  <div className="text-base font-semibold">
                    {localModules.find(m => m.id === activeId)?.title}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ModuleContent;