import React, { useState } from "react";
import { BookOpen, GripVertical, Edit3, Trash2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

// Components
import SortableModule from "../modules/SortableModule";
import { AddModuleDialog, EditModuleDialog, DeleteModuleDialog } from "../modules/ModuleDialogs";

// Hooks
import { useModuleManagement } from "../../hooks/useModuleManagement";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

const ModuleContent = ({ isAdminView = false }) => {
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
    <div className="space-y-4 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-lg">Modules</h4>
        </div>

        {!isAdminView && (
          <AddModuleDialog
            open={addModuleOpen}
            onOpenChange={setAddModuleOpen}
            onSubmit={createModule}
            isLoading={isCreating}
            error={createError || fetchError}
            disabled={isCreating}
          />
        )}
      </div>

      {/* Edit Module Dialog */}
      {!isAdminView && (
        <EditModuleDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={updateModule}
          isLoading={isUpdating}
          error={updateError}
          module={editingModule}
        />
      )}

      {/* Delete Module Dialog */}
      {!isAdminView && (
        <DeleteModuleDialog
          open={deleteModuleOpen}
          onOpenChange={setDeleteModuleOpen}
          onConfirm={deleteModule}
          isLoading={isDeleting}
          module={moduleToDelete}
        />
      )}

      <div className="grid gap-4 w-full overflow-hidden">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading modules...</div>
        ) : fetchError ? (
          <div className="text-sm text-destructive">Failed to load modules</div>
        ) : localModules.length === 0 ? (
          <div className="text-sm text-muted-foreground">No modules yet. Add one to get started.</div>
        ) : (
          <DndContext
            sensors={isAdminView ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={isAdminView ? undefined : handleDragStart}
            onDragEnd={isAdminView ? undefined : handleDragEnd}
          >
            <SortableContext items={localModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <Accordion
                type="single"
                collapsible
                className="space-y-3 w-full overflow-hidden"
                value={openId}
                onValueChange={(val) => setOpenId(val || "")}
              >
                {localModules.map((m) => (
                  <SortableModule
                    key={m.id}
                    item={m}
                    listenersDisabled={isAdminView || reorderMutation.isLoading || isUpdating || isDeleting}
                    isOpen={openId === m.id}
                    onEdit={isAdminView ? undefined : handleEditModule}
                    onDelete={isAdminView ? undefined : showDeleteDialog}
                    isAdminView={isAdminView}
                  />
                ))}
              </Accordion>
            </SortableContext>

            <DragOverlay>
              {!isAdminView && activeId ? (() => {
                const activeModule = localModules.find(m => m.id === activeId);
                return activeModule ? (
                  <div className="relative rounded-lg border-2 bg-card shadow-lg border-input w-full overflow-hidden">
                    <div className="py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full overflow-hidden">
                      <div className="flex-shrink-0 mr-2 sm:mr-3 p-1 rounded">
                        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>

                      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 sm:pr-3 md:pr-40 overflow-hidden">
                        <div className="text-xs sm:text-sm md:text-base font-semibold leading-tight text-left overflow-hidden">
                          <span className="text-xs sm:text-xs md:text-sm flex-shrink-0 mr-1">Module {activeModule.position}:</span>
                          <span className="block overflow-hidden text-ellipsis" title={activeModule.title}>{activeModule.title}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 opacity-50">
                        <div className="h-8 w-8 p-0 flex items-center justify-center rounded-md">
                          <Edit3 className="h-4 w-4" />
                        </div>
                        <div className="h-8 w-8 p-0 flex items-center justify-center rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })() : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ModuleContent;