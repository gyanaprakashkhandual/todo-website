import KanbanPage from '../../components/kanban/Main';

import { useTodo } from '../../context/Todo.context';

export default function Dashboard() {
  const { selectedTodo, setSelectedTodo } = useTodo();

  const handleEdit = (todo: Todo) => {
    // Wire to your edit modal/form here
    // e.g. setEditingTodo(todo); setShowEditModal(true);
    console.log("Edit:", todo);
  };

  const handleDelete = (id: number) => {
    // Wire to your delete action here
    // e.g. dispatch(deleteTodo(id));
    console.log("Delete:", id);
    setSelectedTodo(null);
  };

  return (
    <div className="relative">
      <KanbanPage />

      {/* Backdrop — closes sidebar on click outside */}
      {selectedTodo && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] z-[99]"
          onClick={() => setSelectedTodo(null)}
        />
      )}

    </div>
  );
}