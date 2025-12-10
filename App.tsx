import React, { useState, useEffect, useCallback } from "react";
import { ViewState, Worker, Room } from "./types";
import { BottomNav } from "./components/shared/BottomNav";
import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { RoomAssemblyView } from "./views/RoomAssemblyView";
import { WorkersListView } from "./views/WorkersListView";
import { WorkerFormView } from "./views/WorkerFormView";
import { RoomsListView } from "./views/RoomsListView";
import { RoomFormView } from "./views/RoomFormView";
import { LocationListView } from "./views/LocationListView";
import { SettingsView } from "./views/SettingsView";
import { RoomType } from "./types";
import { loadWorkers, loadRooms, saveWorkers, saveRooms } from "./utils/storage";
import { LayoutProvider } from "./context/LayoutContext";

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [workers, setWorkers] = useState<Worker[]>(loadWorkers());
  const [rooms, setRooms] = useState<Room[]>(loadRooms());
  const [previousView, setPreviousView] = useState<ViewState | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    saveWorkers(workers);
  }, [workers]);

  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  const handleNavigate = (newView: ViewState) => {
    if (view !== 'LOGIN') {
      setPreviousView(view);
    }
    setView(newView);
    setShowWorkerForm(false);
    setEditingWorker(null);
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  const handleBack = () => {
    if (previousView) {
      setView(previousView);
      setPreviousView(null);
    } else {
      setView('DASHBOARD');
    }
    setShowWorkerForm(false);
    setEditingWorker(null);
    setShowRoomForm(false);
    setEditingRoom(null);
  }

  // Native/back button support (Android / browser back)
  const handlePopState = useCallback((event: PopStateEvent) => {
    event.preventDefault();

    // If forms are open, close them first
    if (showWorkerForm || showRoomForm) {
      handleCancelWorkerForm();
      handleCancelRoomForm();
      return;
    }

    if (view === 'LOGIN') return; // do nothing on login

    if (previousView) {
      setView(previousView);
      setPreviousView(null);
      return;
    }

    // Fallback to dashboard
    setView('DASHBOARD');
  }, [previousView, showWorkerForm, showRoomForm, view]);

  useEffect(() => {
    // push a new history entry when navigating to an internal view (not login)
    if (view !== 'LOGIN') {
      window.history.pushState({ view }, "");
    }
  }, [view]);

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  // Worker handlers
  const handleAddWorker = () => {
    setEditingWorker(null);
    setShowWorkerForm(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setShowWorkerForm(true);
  };

  const handleSaveWorker = (worker: Worker) => {
    if (editingWorker) {
      setWorkers(prev => prev.map(w => w.id === worker.id ? worker : w));
    } else {
      setWorkers(prev => [...prev, worker]);
    }
    setShowWorkerForm(false);
    setEditingWorker(null);
  };

  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Tem certeza que deseja excluir este trabalhador?')) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    }
  };

  const handleCancelWorkerForm = () => {
    setShowWorkerForm(false);
    setEditingWorker(null);
  };

  // Room handlers
  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowRoomForm(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleSaveRoom = (room: Room) => {
    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    } else {
      setRooms(prev => [...prev, room]);
    }
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  const handleCancelRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  // Settings handler
  const handleDataImported = (newWorkers: Worker[], newRooms: Room[]) => {
    setWorkers(newWorkers);
    setRooms(newRooms);
  };

  return (
    <LayoutProvider>
      <div className="font-sans text-text-main selection:bg-primary/20 bg-gray-100 h-screen flex justify-center overflow-hidden">
        <div className="w-full max-w-md bg-[#fdfbf7] h-full relative shadow-2xl overflow-hidden flex flex-col">
          <div className="flex-1 w-full h-full overflow-hidden relative">
            {view === 'LOGIN' && <LoginView onLogin={() => setView('DASHBOARD')} />}

            {view === 'DASHBOARD' && <DashboardView onNavigate={handleNavigate} />}

            {view === 'ROOM_ASSEMBLY' && (
              <RoomAssemblyView
                workers={workers}
                rooms={rooms}
                setWorkers={setWorkers}
                setRooms={setRooms}
                onBack={handleBack}
              />
            )}

            {view === 'WORKERS' && !showWorkerForm && (
              <WorkersListView
                workers={workers}
                onEdit={handleEditWorker}
                onDelete={handleDeleteWorker}
                onAdd={handleAddWorker}
                onTogglePresence={(workerId, present) => {
                  setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, present, assignedRoomId: present ? w.assignedRoomId ?? null : null } : w));
                }}
              />
            )}

            {view === 'WORKERS' && showWorkerForm && (
              <WorkerFormView
                worker={editingWorker}
                onSave={handleSaveWorker}
                onCancel={handleCancelWorkerForm}
              />
            )}

            {view === 'ROOMS' && !showRoomForm && (
              <RoomsListView
                rooms={rooms}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onAdd={handleAddRoom}
              />
            )}

            {((view === 'ROOMS') || (view === 'LOCATIONS')) && showRoomForm && (
              <RoomFormView
                room={editingRoom}
                onSave={handleSaveRoom}
                onCancel={handleCancelRoomForm}
                defaultType={view === 'LOCATIONS' ? RoomType.Outros : undefined}
              />
            )}

            {view === 'LOCATIONS' && !showRoomForm && (
              <LocationListView
                onBack={handleBack}
                rooms={rooms}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onAdd={handleAddRoom}
              />
            )}

            {view === 'SETTINGS' && (
              <SettingsView onDataImported={handleDataImported} />
            )}
          </div>

          {/* Show Bottom Nav only on main internal screens */}
          {view !== 'LOGIN' && !showWorkerForm && !showRoomForm && (
            <BottomNav active={view} onChange={handleNavigate} />
          )}
        </div>
      </div>
    </LayoutProvider>
  );
}
