import React, { useState, useEffect } from "react";
import { ViewState, Worker, Room, RoomType, WorkerRole } from "./types";
import { SparklesIcon, SpaIcon, PuzzleIcon, UsersIcon, DoorIcon, MapPinIcon, ChevronLeftIcon, SettingsIcon, CheckCircleIcon, DragIndicatorIcon, EditIcon, TrashIcon, PlusIcon } from "./components/Icons";
import { autoAssignWorkers } from "./services/geminiService";

// --- Sub Components ---

const Header = ({ title, onBack, showSettings }: { title: string; onBack?: () => void; showSettings?: boolean }) => (
  <header className="fixed top-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-sm px-4 h-16 flex items-center justify-between border-b border-white/50">
    <div className="flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-text-main hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-xl font-display font-semibold text-text-main">{title}</h1>
    </div>
    {showSettings && (
      <button className="p-2 text-text-light hover:text-text-main transition-colors">
        <SettingsIcon className="w-6 h-6" />
      </button>
    )}
  </header>
);

const BottomNav = ({ active, onChange }: { active: ViewState; onChange: (v: ViewState) => void }) => {
  const items = [
    { id: 'ROOM_ASSEMBLY', label: 'Montagem', icon: PuzzleIcon },
    { id: 'WORKERS', label: 'Trabalhadores', icon: UsersIcon },
    { id: 'ROOMS', label: 'Salas', icon: DoorIcon },
    { id: 'LOCATIONS', label: 'Locais', icon: MapPinIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 pb-safe pt-2 px-2 shadow-lg rounded-t-2xl">
      <div className="flex justify-around items-end">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 p-2 w-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10 -translate-y-1' : ''}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-80'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
       <div className="w-full flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <SpaIcon className="text-primary w-10 h-10" />
        </div>
        <h1 className="text-text-main text-3xl font-bold">GFA</h1>
      </div>
      <h2 className="text-text-main/90 text-2xl font-bold mb-8">Bem-vindo(a) de volta</h2>
      
      <div className="w-full max-w-sm space-y-4">
        <div>
           <label className="block text-text-main/80 font-medium mb-2">Email ou usuário</label>
           <input type="text" placeholder="Digite seu email ou usuário" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/70" />
        </div>
        <div>
           <label className="block text-text-main/80 font-medium mb-2">Senha</label>
           <input type="password" placeholder="Digite sua senha" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/70" />
        </div>
        
        <div className="text-right">
          <a href="#" className="text-primary text-sm font-medium hover:underline">Esqueceu a senha?</a>
        </div>

        <button onClick={onLogin} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-primary/30">
          Entrar
        </button>
      </div>

       <div className="mt-8 text-center">
          <p className="text-sm text-text-light">Não tem uma conta?</p>
          <a href="#" className="text-primary font-bold hover:underline">Criar conta</a>
       </div>
    </div>
  );
};

const DashboardView = ({ onNavigate }: { onNavigate: (v: ViewState) => void }) => {
  const menuItems = [
    { id: 'ROOM_ASSEMBLY', label: 'Montagem das Salas', icon: PuzzleIcon, desc: 'Organizar trabalhadores e salas' },
    { id: 'WORKERS', label: 'Cadastro de Trabalhadores', icon: UsersIcon, desc: 'Gerenciar médiuns e apoio' },
    { id: 'ROOMS', label: 'Cadastro de Salas de Passe', icon: DoorIcon, desc: 'Configurar salas físicas' },
    { id: 'LOCATIONS', label: 'Cadastro de Locais de Trabalho', icon: MapPinIcon, desc: 'Recepção e outros locais' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-24">
      <Header title="Navegação" showSettings />
      <div className="w-full h-40 bg-gradient-to-r from-blue-400 to-primary rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden shadow-xl shadow-blue-200">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-5 -mb-5"></div>
         <div className="text-center text-white z-10">
            <SpaIcon className="w-12 h-12 mx-auto mb-2 opacity-90" />
            <h2 className="text-2xl font-bold tracking-tight">Portal GFA</h2>
            <p className="text-white/80 text-sm">Gestão Fraterna</p>
         </div>
      </div>

      <div className="grid gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewState)}
            className="group relative flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <item.icon className="w-6 h-6" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-text-main text-lg">{item.label}</h3>
              <p className="text-xs text-text-light">{item.desc}</p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

// -- Reusable Card for Worker in Assembly --
const WorkerCard: React.FC<{ worker: Worker; roleLabel?: string }> = ({ worker, roleLabel }) => {
  const roleColor = {
    [WorkerRole.Coordenador]: "bg-blue-100 text-blue-700",
    [WorkerRole.Medium]: "bg-purple-100 text-purple-700",
    [WorkerRole.Dialogo]: "bg-green-100 text-green-700",
    [WorkerRole.Psicografa]: "bg-indigo-100 text-indigo-700",
    [WorkerRole.Sustentacao]: "bg-slate-100 text-slate-700",
  }[worker.roles[0]] || "bg-gray-100 text-gray-700";

  return (
    <div className="flex items-center p-3 bg-gradient-to-br from-[#fdfbf7] to-[#f4f1ea] rounded-xl border border-[#e8e4db] shadow-sm mb-2 relative group">
      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
        <img src={`https://picsum.photos/seed/${worker.id}/100/100`} alt={worker.name} className="w-full h-full object-cover" />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="font-semibold text-text-main text-sm truncate">{worker.name}</p>
        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-0.5 ${roleColor}`}>
          {roleLabel || worker.roles[0]}
        </span>
      </div>
      <button className="text-slate-300 hover:text-slate-500">
        <DragIndicatorIcon className="w-5 h-5 rotate-90" />
      </button>
    </div>
  );
};

const RoomAssemblyView = ({ workers, rooms, setWorkers, onBack }: { workers: Worker[], rooms: Room[], setWorkers: any, onBack: () => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const assignments = await autoAssignWorkers(workers, rooms);
      
      const newWorkers = workers.map(w => {
        const assignment = assignments.find(a => a.workerId === w.id);
        return assignment ? { ...w, assignedRoomId: assignment.roomId } : { ...w, assignedRoomId: null };
      });
      
      setWorkers(newWorkers);
    } catch (e) {
      alert("Falha ao gerar automaticamente. Verifique a API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const passeRooms = rooms.filter(r => r.type === RoomType.Passe);
  const otherRooms = rooms.filter(r => r.type === RoomType.Outros);
  const unassignedWorkers = workers.filter(w => !w.assignedRoomId);

  return (
    <div className="min-h-screen pt-20 px-4 pb-24 bg-[#fcf9f2]">
      <Header title="Montagem das Salas" showSettings />
      
      <div className="sticky top-16 z-10 py-4 bg-[#fcf9f2]/95 backdrop-blur-sm -mx-4 px-4 border-b border-stone-200 shadow-sm">
        <button 
          onClick={handleAutoGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-sky-400 to-primary text-white font-bold py-3 rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
        >
          {isGenerating ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
          {isGenerating ? "Gerando..." : "Gerar Automaticamente"}
        </button>
      </div>

      <div className="mt-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
            Salas de Passe
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passeRooms.map(room => {
               const occupants = workers.filter(w => w.assignedRoomId === room.id);
               const isFull = occupants.length >= room.capacity;
               
               return (
                <div key={room.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-text-main">{room.name}</h4>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isFull ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {occupants.length}/{room.capacity}
                      {isFull && <CheckCircleIcon className="w-3 h-3 inline ml-1"/>}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {occupants.length === 0 && (
                       <div className="h-24 border-2 border-dashed border-stone-100 rounded-xl flex items-center justify-center text-stone-300 text-sm">
                         Arraste aqui
                       </div>
                    )}
                    {occupants.map(w => (
                      <WorkerCard key={w.id} worker={w} roleLabel={w.isCoordinator ? 'Coordenador' : undefined} />
                    ))}
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
            Outros Locais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherRooms.map(room => {
               const occupants = workers.filter(w => w.assignedRoomId === room.id);
               return (
                <div key={room.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-text-main">{room.name}</h4>
                    <span className="text-stone-400 font-bold text-sm">{occupants.length}</span>
                  </div>
                   <div className="space-y-2">
                    {occupants.length === 0 && <p className="text-xs text-stone-300 italic">Vazio</p>}
                    {occupants.map(w => (
                      <WorkerCard key={w.id} worker={w} />
                    ))}
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        {unassignedWorkers.length > 0 && (
           <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200">
             <h3 className="text-stone-500 font-bold mb-3 text-sm uppercase tracking-wide">Não Alocados ({unassignedWorkers.length})</h3>
             <div className="space-y-2">
                {unassignedWorkers.map(w => (
                  <WorkerCard key={w.id} worker={w} />
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

const WorkerFormView = ({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) => {
  return (
    <div className="min-h-screen pt-20 px-4 pb-24 bg-background">
      <Header title="Cadastro de Trabalhadores" onBack={onCancel} />
      
      <div className="space-y-6 mt-4">
        <div>
          <label className="block text-sm font-bold text-text-main mb-2">Nome</label>
          <input className="w-full h-14 px-4 bg-sky-50 border-none rounded-2xl text-text-main placeholder:text-text-light/60 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Nome completo" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-text-main mb-2">Contato</label>
          <input className="w-full h-14 px-4 bg-sky-50 border-none rounded-2xl text-text-main placeholder:text-text-light/60 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Telefone ou email" />
        </div>

        <div>
          <label className="block text-lg font-bold text-text-main mb-4">Habilidades</label>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
             {[
               { id: 1, label: 'Médium', checked: true },
               { id: 2, label: 'Diálogo', checked: true },
               { id: 3, label: 'Psicografa', checked: true },
               { id: 4, label: 'Sustentação', checked: true },
             ].map((skill, idx) => (
               <div key={skill.id} className={`flex items-center justify-between p-4 ${idx !== 3 ? 'border-b border-slate-50' : ''}`}>
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                     <CheckCircleIcon className="w-4 h-4" />
                   </div>
                   <span className="font-medium text-text-main">{skill.label}</span>
                 </div>
                 {/* Toggle Switch Simulation */}
                 <div className={`w-12 h-7 rounded-full p-1 transition-colors ${skill.checked ? 'bg-blue-300' : 'bg-slate-200'}`}>
                   <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${skill.checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 mt-8">
           <span className="text-text-main font-medium">Coordenador de Sala</span>
           <div className="w-12 h-7 rounded-full p-1 bg-slate-200">
               <div className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-0"></div>
           </div>
        </div>

        <div className="flex gap-4 pt-4">
           <button onClick={onCancel} className="flex-1 h-12 rounded-xl border border-slate-300 text-slate-500 font-bold hover:bg-slate-50">Cancelar</button>
           <button onClick={onSave} className="flex-1 h-12 rounded-xl bg-primary text-text-main font-bold shadow-lg shadow-primary/20 hover:opacity-90">Salvar</button>
        </div>
      </div>
    </div>
  );
};

const RoomListView = () => {
    return (
        <div className="min-h-screen pt-20 px-4 pb-24 bg-gradient-to-b from-blue-50 to-green-50/30">
            <Header title="Salas de Passe" showSettings />
            
            <div className="mt-4">
                <div className="bg-white p-1 rounded-2xl border border-blue-100 shadow-sm flex items-center">
                    <input className="flex-1 h-12 px-4 outline-none bg-transparent placeholder:text-blue-300 text-blue-900" placeholder="Nome da Sala" />
                </div>
                <button className="w-full mt-3 h-12 bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-500 transition-colors">
                    Adicionar Sala
                </button>
            </div>

            <h3 className="mt-8 mb-4 text-xl font-display font-serif text-slate-700">Salas Cadastradas</h3>
            
            <div className="space-y-3">
                {['Sala 1', 'Sala 2', 'Sala 3'].map((room, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 overflow-hidden relative">
                                {/* Abstract room illustration placeholder */}
                                <div className="absolute inset-0 bg-[url('https://picsum.photos/100/100?random=10')] opacity-80 bg-cover"></div>
                            </div>
                            <span className="font-semibold text-lg text-slate-700">{room}</span>
                        </div>
                        <div className="flex gap-2">
                             <button className="p-2 text-slate-400 hover:text-blue-500"><EditIcon className="w-5 h-5"/></button>
                             <button className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Background decoration */}
            <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none opacity-10 text-green-700">
               <SpaIcon className="w-full h-full" />
            </div>
        </div>
    )
}

const LocationListView = () => {
  const locations = [
    { name: "Recepção", desc: "Convenina e um spiritual, local de trabalho.", icon: "💙" },
    { name: "Sala de Espera", desc: "Paiiii de espera, com outra sala de espera.", icon: "🪑" },
    { name: "Auditório", desc: "Cortar comem gradas de auditórios e teócia.", icon: "📖" },
    { name: "Sala de Entrevistas", desc: "Convrufttar coma nachemar gom em sala.", icon: "🤝" },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-24 bg-[#f8fae8]">
      <Header title="Locais de Trabalho" onBack={() => {}} />
      <div className="mt-6 space-y-3">
        {locations.map((loc, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-50 flex items-start gap-4">
             <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl shadow-inner">
               {loc.icon}
             </div>
             <div className="flex-1">
               <h4 className="font-bold text-lg text-slate-800">{loc.name}</h4>
               <p className="text-sm text-slate-500 leading-tight mt-1">{loc.desc}</p>
             </div>
             <button className="text-slate-300 hover:text-slate-500">
                <DragIndicatorIcon className="w-6 h-6 rotate-90" />
             </button>
          </div>
        ))}
      </div>
      
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-yellow-600 border border-yellow-100 hover:scale-110 transition-transform">
        <PlusIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

// --- Initial Data ---
const initialWorkers: Worker[] = [
  { id: '1', name: 'Ana Silva', roles: [WorkerRole.Coordenador], isCoordinator: true, assignedRoomId: 'room1' },
  { id: '2', name: 'Carlos Souza', roles: [WorkerRole.Medium], isCoordinator: false, assignedRoomId: 'room1' },
  { id: '3', name: 'Beatriz Lima', roles: [WorkerRole.Dialogo], isCoordinator: false, assignedRoomId: 'room1' },
  { id: '4', name: 'Davi Rocha', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'room1' },
  { id: '5', name: 'Elisa Costa', roles: [WorkerRole.Coordenador], isCoordinator: true, assignedRoomId: 'room2' },
  { id: '6', name: 'Felipe Almeida', roles: [WorkerRole.Medium], isCoordinator: false, assignedRoomId: 'room2' },
  { id: '7', name: 'Gabriela Dias', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'room2' },
  { id: '8', name: 'Heitor Pereira', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'loc1' },
  { id: '9', name: 'Isabela Gomes', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'loc1' },
  { id: '10', name: 'Júlia Martins', roles: [WorkerRole.Dialogo], isCoordinator: false, assignedRoomId: 'loc2' },
  { id: '11', name: 'Lucas Fernandes', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: null },
];

const initialRooms: Room[] = [
  { id: 'room1', name: 'Sala de Passe 1', capacity: 8, type: RoomType.Passe },
  { id: 'room2', name: 'Sala de Passe 2', capacity: 8, type: RoomType.Passe },
  { id: 'loc1', name: 'Recepção', capacity: 5, type: RoomType.Outros },
  { id: 'loc2', name: 'Palestra', capacity: 50, type: RoomType.Outros },
];

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [rooms] = useState<Room[]>(initialRooms);
  const [previousView, setPreviousView] = useState<ViewState | null>(null);

  const handleNavigate = (newView: ViewState) => {
    if (view !== 'LOGIN') {
        setPreviousView(view);
    }
    setView(newView);
  };

  const handleBack = () => {
      if (previousView) {
          setView(previousView);
          setPreviousView(null);
      } else {
          setView('DASHBOARD');
      }
  }

  // Effect to handle back button behavior for specific sub-views
  const isSubView = ['WORKERS', 'ROOMS', 'LOCATIONS'].includes(view);

  return (
    <div className="font-sans text-text-main selection:bg-primary/20">
      {view === 'LOGIN' && <LoginView onLogin={() => setView('DASHBOARD')} />}
      
      {view === 'DASHBOARD' && <DashboardView onNavigate={handleNavigate} />}
      
      {view === 'ROOM_ASSEMBLY' && (
        <RoomAssemblyView 
            workers={workers} 
            rooms={rooms} 
            setWorkers={setWorkers}
            onBack={handleBack}
        />
      )}

      {view === 'WORKERS' && <WorkerFormView onSave={handleBack} onCancel={handleBack} />}
      
      {view === 'ROOMS' && <RoomListView />}
      
      {view === 'LOCATIONS' && <LocationListView />}

      {/* Show Bottom Nav only on main internal screens */}
      {view !== 'LOGIN' && !['WORKERS', 'LOCATIONS'].includes(view) && (
        <BottomNav active={view} onChange={handleNavigate} />
      )}
      
      {/* Specific Bottom Nav logic: if we are in 'WORKERS' or 'LOCATIONS' which look like forms/subpages in screenshots, 
          we might hide the bottom nav or show a simplified one. For this demo, let's keep it consistent for navigation ease 
          except for the WorkerForm which fills the screen. */}
      {['ROOMS', 'LOCATIONS'].includes(view) && (
           <BottomNav active={view} onChange={handleNavigate} />
      )}
    </div>
  );
}