import React, { useState, useEffect, useCallback } from "react";
import { ViewState, Worker, Room, PasseAttendance, Assistido, FichaAssistencia, AttendancePhase, PasseType } from "./types";
import { BottomNav } from "./components/shared/BottomNav";
import { Toast, ToastMessage } from "./components/shared/Toast";
import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { RoomAssemblyView } from "./views/RoomAssemblyView";
import { WorkersListView } from "./views/WorkersListView";
import { WorkerFormView } from "./views/WorkerFormView";
import { RoomsListView } from "./views/RoomsListView";
import { RoomFormView } from "./views/RoomFormView";
import { LocationListView } from "./views/LocationListView";
import { SettingsView } from "./views/SettingsView";
import { AssistidosListView } from './views/AssistidosListView';
import { AssistidoFormView } from './views/AssistidoFormView';
import { AssistanceView } from './views/AssistanceView';
import { PasseRegistrationView } from "./views/PasseRegistrationView";
import { PasseDistributionView } from "./views/PasseDistributionView";
import { RoomType } from "./types";
import {
  loadWorkers,
  loadRooms,
  saveWorkers,
  saveRooms,
  saveWorker,
  deleteWorker,
  saveRoom,
  deleteRoom,
  loadAssistidos,
  saveAssistido,
  deleteAssistido,
  loadAttendances,
  saveAttendances,
  saveAttendance,
  deleteAttendance,
  saveFichaAssistencia,
  loadFichasAssistencia,
} from "./utils/storage";
import { LayoutProvider } from "./context/LayoutContext";

export default function App() {
  const [view, setView] = useState<ViewState>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewState;
    return viewParam || 'LOGIN';
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [attendances, setAttendances] = useState<PasseAttendance[]>([]);
  const [fichasAssistencia, setFichasAssistencia] = useState<FichaAssistencia[]>([]);
  const [previousView, setPreviousView] = useState<ViewState | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [editingAssistido, setEditingAssistido] = useState<Assistido | null>(null);
  const [showAssistidoForm, setShowAssistidoForm] = useState(false);
  const [showAssistanceView, setShowAssistanceView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Carregamento inicial assíncrono do Supabase
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [loadedWorkers, loadedRooms, loadedAssistidos, loadedAttendances, loadedFichas] = await Promise.all([
          loadWorkers(),
          loadRooms(),
          loadAssistidos(),
          loadAttendances(),
          loadFichasAssistencia()
        ]);
        setWorkers(loadedWorkers);
        setRooms(loadedRooms);
        setAssistidos(loadedAssistidos);
        setAttendances(loadedAttendances);
        setFichasAssistencia(loadedFichas);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais do Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Auto-save to Supabase whenever data changes (skip initial empty state)
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setInitialLoadDone(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (initialLoadDone) {
      saveWorkers(workers);
    }
  }, [workers, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone) {
      saveRooms(rooms);
    }
  }, [rooms, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone) {
      saveAttendances(attendances);
    }
  }, [attendances, initialLoadDone]);

  const handleNavigate = (newView: ViewState) => {
    if (view !== 'LOGIN') {
      setPreviousView(view);
    }
    setView(newView);
    setShowWorkerForm(false);
    setEditingWorker(null);
    setShowRoomForm(false);
    setEditingRoom(null);
    setShowAssistidoForm(false);
    setEditingAssistido(null);
    setShowAssistanceView(false);
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
    setShowAssistidoForm(false);
    setEditingAssistido(null);
  }

  // Native/back button support (Android / browser back)
  const handlePopState = useCallback((event: PopStateEvent) => {
    event.preventDefault();

    // If forms are open, close them first
    if (showWorkerForm || showRoomForm || showAssistidoForm) {
      handleCancelWorkerForm();
      handleCancelRoomForm();
      if (showAssistidoForm) handleCancelAssistidoForm();
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
  }, [previousView, showWorkerForm, showRoomForm, showAssistidoForm, view]);

  // Global ESC key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If focusing an input/textarea, do not intercept if we want to allow native behavior, 
        // but typically escaping out of it is fine.
        if (view === 'LOGIN') return;

        if (showWorkerForm || showRoomForm || showAssistidoForm) {
          handleCancelWorkerForm();
          handleCancelRoomForm();
          if (showAssistidoForm) handleCancelAssistidoForm();
          return;
        }

        if (previousView || view !== 'DASHBOARD') {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, previousView, showWorkerForm, showRoomForm, showAssistidoForm]);

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

  const handleSaveWorker = async (worker: Worker) => {
    try {
      if (editingWorker) {
        setWorkers(prev => prev.map(w => w.id === worker.id ? worker : w));
      } else {
        setWorkers(prev => [...prev, worker]);
      }
      await saveWorker(worker);
      showToast(editingWorker ? 'Trabalhador atualizado!' : 'Trabalhador cadastrado!');
    } catch {
      showToast('Erro ao salvar trabalhador.', 'error');
    }
    setShowWorkerForm(false);
    setEditingWorker(null);
  };

  const handleDeleteWorker = async (workerId: string) => {
    setWorkers(prev => prev.filter(w => w.id !== workerId));
    try {
      await deleteWorker(workerId);
      showToast('Trabalhador removido.');
    } catch {
      showToast('Erro ao remover trabalhador.', 'error');
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

  const handleSaveRoom = async (room: Room) => {
    try {
      if (editingRoom) {
        setRooms(prev => prev.map(r => r.id === room.id ? room : r));
      } else {
        setRooms(prev => [...prev, room]);
      }
      await saveRoom(room);
      showToast(editingRoom ? 'Sala atualizada com sucesso!' : 'Sala cadastrada com sucesso!');
    } catch {
      showToast('Erro ao salvar sala. Tente novamente.', 'error');
    }
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = async (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    try {
      await deleteRoom(roomId);
      showToast('Sala removida.');
    } catch {
      showToast('Erro ao remover sala.', 'error');
    }
  };

  const handleCancelRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  // Assistido handlers
  const handleAddAssistido = () => {
    setEditingAssistido(null);
    setShowAssistidoForm(true);
  };

  const handleEditAssistido = (assistido: Assistido) => {
    setEditingAssistido(assistido);
    setShowAssistidoForm(true);
  };

  const handleSaveAssistidoForm = async (assistido: Assistido) => {
    const isNew = !editingAssistido;
    if (editingAssistido) {
      setAssistidos(prev => prev.map(a => a.id === assistido.id ? assistido : a));
    } else {
      setAssistidos(prev => [...prev, assistido]);
    }
    await saveAssistido(assistido);
    if (isNew) {
      // Mantém o form aberto em modo edição para dar acesso à Ficha de Assistência
      setEditingAssistido(assistido);
    } else {
      setShowAssistidoForm(false);
      setEditingAssistido(null);
    }
  };

  const handleCancelAssistidoForm = () => {
    setShowAssistidoForm(false);
    setEditingAssistido(null);
  };

  const handleQuickAddAssistido = async (assistido: Assistido) => {
    setAssistidos(prev => [...prev, assistido]);
    await saveAssistido(assistido);
  };

  const handleSaveFicha = async (ficha: FichaAssistencia) => {
    // Save to DB
    await saveFichaAssistencia(ficha);
    // Update local state by replacing existing or appending
    setFichasAssistencia(prev => {
      const idx = prev.findIndex(f => f.id === ficha.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = ficha;
        return next;
      }
      return [ficha, ...prev];
    });

    // Vincula id_ficha_assistencia nos atendimentos do assistido ainda sem ficha
    const updatedAttendances = attendances.map(att => {
      if (att.assistidoId === ficha.assistidoId && !att.fichaAssistenciaId) {
        return { ...att, fichaAssistenciaId: ficha.id };
      }
      return att;
    });

    const changedRows = updatedAttendances.filter(
      (att, idx) => att.fichaAssistenciaId !== attendances[idx]?.fichaAssistenciaId
    );

    if (changedRows.length > 0) {
      setAttendances(updatedAttendances);
      await saveAttendances(updatedAttendances);
    }

    // Simulate back action
    setShowAssistanceView(false);
    showToast("Ficha de Assistência salva com sucesso!");
  };

  // Settings handler
  const handleDataImported = (newWorkers: Worker[], newRooms: Room[]) => {
    setWorkers(newWorkers);
  };

  // Loading screen
  if (isLoading) {
    return (
      <LayoutProvider>
        <div className="font-sans text-text-main selection:bg-primary/20 bg-gray-100 h-screen flex justify-center overflow-hidden">
          <div className="w-full max-w-md bg-[#fdfbf7] h-full relative shadow-2xl overflow-hidden flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium text-sm">Carregando dados...</p>
            </div>
          </div>
        </div>
      </LayoutProvider>
    );
  }

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
                onBack={handleBack}
                onHome={() => handleNavigate('DASHBOARD')}
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
                onBack={handleBack}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'WORKERS' && showWorkerForm && (
              <WorkerFormView
                worker={editingWorker}
                onSave={handleSaveWorker}
                onCancel={handleCancelWorkerForm}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'ROOMS' && !showRoomForm && (
              <RoomsListView
                rooms={rooms}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onAdd={handleAddRoom}
                onBack={handleBack}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {((view === 'ROOMS') || (view === 'LOCATIONS')) && showRoomForm && (
              <RoomFormView
                room={editingRoom}
                onSave={handleSaveRoom}
                onCancel={handleCancelRoomForm}
                defaultType={view === 'LOCATIONS' ? RoomType.Entrevista : undefined}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'LOCATIONS' && !showRoomForm && (
              <LocationListView
                onBack={handleBack}
                onHome={() => handleNavigate('DASHBOARD')}
                rooms={rooms}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onAdd={handleAddRoom}
              />
            )}

            {view === 'SETTINGS' && (
              <SettingsView onDataImported={handleDataImported} onBack={handleBack} onHome={() => handleNavigate('DASHBOARD')} />
            )}

            {view === 'ASSISTANCE' && !showAssistidoForm && (
              <AssistidosListView
                assistidos={assistidos}
                onAdd={handleAddAssistido}
                onEdit={handleEditAssistido}
                onBack={handleBack}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'ASSISTANCE' && showAssistidoForm && !showAssistanceView && (
              <AssistidoFormView
                assistido={editingAssistido}
                history={editingAssistido ? attendances.filter(a => a.assistidoName === editingAssistido.nome) : []}
                onSave={handleSaveAssistidoForm}
                onCancel={handleCancelAssistidoForm}
                onEditAssistance={() => setShowAssistanceView(true)}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'ASSISTANCE' && showAssistanceView && editingAssistido && (
              <AssistanceView
                workers={workers}
                assistido={editingAssistido}
                existingFicha={fichasAssistencia.find(f => f.assistidoId === editingAssistido.id && f.statusFicha === 'Ativa')}
                onSaveFicha={handleSaveFicha}
                onBack={() => setShowAssistanceView(false)}
                onHome={() => handleNavigate('DASHBOARD')}
              />
            )}

            {view === 'PASSE_REGISTRATION' && (
              <PasseRegistrationView
                attendances={attendances}
                assistidos={assistidos}
                fichas={fichasAssistencia}
                onAddAttendance={async (att) => {
                  setAttendances(prev => [...prev, att]);
                  await saveAttendance(att);
                  if (att.fichaAssistenciaId && att.attendancePhase === AttendancePhase.EmAtendimento && att.passeType !== PasseType.Nenhum) {
                    const ficha = fichasAssistencia.find(f => f.id === att.fichaAssistenciaId);
                    if (ficha) {
                      const updated: FichaAssistencia = {
                        ...ficha,
                        realizadoA2: (ficha.realizadoA2 || 0) + (att.passeType === PasseType.A2 ? 1 : 0),
                        realizadoA1: (ficha.realizadoA1 || 0) + (att.passeType === PasseType.A1 ? 1 : 0),
                      };
                      setFichasAssistencia(prev => prev.map(f => f.id === updated.id ? updated : f));
                      await saveFichaAssistencia(updated);
                    }
                  }
                }}
                onUpdateAttendance={async (updated) => {
                  setAttendances(prev => prev.map(a => a.id === updated.id ? updated : a));
                  await saveAttendance(updated);
                }}
                onDeleteAttendance={async (id) => {
                  const att = attendances.find(a => a.id === id);
                  setAttendances(prev => prev.filter(a => a.id !== id));
                  await deleteAttendance(id);
                  if (att?.fichaAssistenciaId && att.attendancePhase === AttendancePhase.EmAtendimento && att.passeType !== PasseType.Nenhum) {
                    const ficha = fichasAssistencia.find(f => f.id === att.fichaAssistenciaId);
                    if (ficha) {
                      const updated: FichaAssistencia = {
                        ...ficha,
                        realizadoA2: Math.max(0, (ficha.realizadoA2 || 0) - (att.passeType === PasseType.A2 ? 1 : 0)),
                        realizadoA1: Math.max(0, (ficha.realizadoA1 || 0) - (att.passeType === PasseType.A1 ? 1 : 0)),
                      };
                      setFichasAssistencia(prev => prev.map(f => f.id === updated.id ? updated : f));
                      await saveFichaAssistencia(updated);
                    }
                  }
                }}
                onAddAssistido={handleQuickAddAssistido}
                rooms={rooms}
                workers={workers}
                onBack={handleBack}
                onNavigate={handleNavigate}
              />
            )}

            {view === 'PASSE_DISTRIBUTION' && (
              <PasseDistributionView
                attendances={attendances}
                rooms={rooms}
                workers={workers}
                onUpdateAttendance={(updated) => setAttendances(prev => prev.map(a => a.id === updated.id ? updated : a))}
                onBack={handleBack}
                onNavigate={handleNavigate}
              />
            )}
          </div>

          {/* Show Bottom Nav only on main internal screens */}
          {view !== 'LOGIN' && !showWorkerForm && !showRoomForm && !showAssistidoForm && (
            <BottomNav active={view} onChange={handleNavigate} />
          )}
          <Toast toasts={toasts} onRemove={removeToast} />
        </div>
      </div>
    </LayoutProvider>
  );
}

