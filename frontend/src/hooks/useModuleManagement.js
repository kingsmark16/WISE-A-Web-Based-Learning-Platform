import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import {
  useCreateMdodule,
  useDeleteModule,
  useGetModules,
  useReorderModules,
  useUpdateModule,
} from "./useModule";

export const useModuleManagement = () => {
  const { id: courseId } = useParams();

  // Module state
  const [editOpen, setEditOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // API hooks
  const { mutate: createMutate, isLoading: isCreating, error: createError } = useCreateMdodule();
  const { data, isLoading, error: fetchError } = useGetModules(courseId);
  const { mutate: updateMutate, isLoading: isUpdating, error: updateError } = useUpdateModule();
  const { mutate: deleteMutate, isLoading: isDeleting } = useDeleteModule(courseId);
  const reorderMutation = useReorderModules(courseId);

  // Handlers
  const handleCreateModule = ({ title, description }) => {
    if (!courseId) {
      console.error("Missing courseId in URL params");
      return;
    }
    createMutate({ title, description, courseId }, {
      onSuccess: () => {
        toast.success('Module created successfully!');
      },
      onError: () => {
        toast.error('Failed to create module. Please try again.');
      }
    });
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setEditOpen(true);
  };

  const handleUpdateModule = ({ id, title, description }) => {
    updateMutate({ id, title, description }, {
      onSuccess: () => {
        toast.success('Module updated successfully!');
        setEditOpen(false);
        setEditingModule(null);
      },
      onError: () => {
        toast.error('Failed to update module. Please try again.');
      }
    });
  };

  // NEW: Function to show delete dialog
  const handleShowDeleteDialog = (module) => {
    setModuleToDelete(module);
    setDeleteModuleOpen(true);
  };

  // NEW: Function to actually delete the module
  const handleDeleteModule = (moduleId) => {
    deleteMutate(moduleId, {
      onSuccess: () => {
        toast.success('Module deleted successfully!');
        setDeleteModuleOpen(false);
        setModuleToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete module. Please try again.');
        // Keep dialog open on error so user can retry
      }
    });
  };

  const handleReorderModules = (orderedModules) => {
    reorderMutation.mutate(orderedModules);
  };

  return {
    // Data
    modules: data?.modules ?? [],
    courseId,
    isLoading,
    fetchError,

    // Create
    createModule: handleCreateModule,
    isCreating,
    createError,

    // Edit
    editOpen,
    setEditOpen,
    editingModule,
    handleEditModule,
    updateModule: handleUpdateModule,
    isUpdating,
    updateError,

    // Delete
    deleteModule: handleDeleteModule, // This actually deletes
    showDeleteDialog: handleShowDeleteDialog, // This shows the dialog
    setDeleteModuleOpen,
    deleteModuleOpen,
    moduleToDelete,
    isDeleting,

    // Reorder
    reorderModules: handleReorderModules,
    reorderMutation,
  };
};