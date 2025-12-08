import React, { useState, useEffect } from "react";
import { ViewState, Worker, Room, RoomType, WorkerRole } from "./types";
import { SparklesIcon, SpaIcon, PuzzleIcon, UsersIcon, DoorIcon, MapPinIcon, ChevronLeftIcon, SettingsIcon, CheckCircleIcon, DragIndicatorIcon, EditIcon, TrashIcon, PlusIcon, MoreDotsIcon, CheckIcon, HomeIcon, GfaLogo, BookIcon, MicrophoneIcon } from "./components/Icons";
import { autoAssignWorkers } from "./services/geminiService";

// --- Sub Components ---

// The main background component that replicates the "Blue Sky & Rays" look from the screenshots
const MainBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Sky Blue Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6cb8f6] via-[#aed8f7] to-[#e4eff6]"></div>
      
      {/* Sun/Light Rays Top Right - Stronger Effect */}
      <div className="absolute top-[-30%] right-[-20%] w-[100%] h-[100%] bg-gradient-radial from-white/70 via-white/10 to-transparent blur-3xl mix-blend-overlay"></div>
      
      {/* Defined Rays */}
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] opacity-40 bg-[conic-gradient(at_top_right,_rgba(255,255,255,0.8)_0deg,_transparent_10deg,_rgba(255,255,255,0.4)_20deg,_transparent_40deg,_rgba(255,255,255,0.6)_60deg,_transparent_80deg)] blur-2xl"></div>

      {/* Subtle Sparkles/Dust */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '70px 70px' }}></div>
      
      {/* Bottom Waves - The "Ethereal" Curves */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] z-0 pointer-events-none">
         <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-white/20" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,160L60,170.7C120,181,240,203,360,202.7C480,203,600,181,720,176C840,171,960,181,1080,186.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
         </svg>
         <svg viewBox="0 0 1440 320" className="absolute bottom-[-20px] w-full h-full text-white/40" preserveAspectRatio="none">
             <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
         <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-gradient-to-t from-orange-50/40 to-white/10" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 250, 240, 0)" />
                  <stop offset="100%" stopColor="rgba(255, 248, 235, 0.6)" />
                </linearGradient>
              </defs>
              <path fill="url(#wave-grad)" d="M0,256L60,245.3C120,235,240,213,360,213.3C480,213,600,235,720,245.3C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192L1440,320L0,320Z"></path>
         </svg>
      </div>
  </div>
);

const Header = ({ title, onBack, showSettings, action }: { title: string; onBack?: () => void; showSettings?: boolean; action?: React.ReactNode }) => (
  <header className="fixed top-0 left-0 right-0 z-30 bg-white/50 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-white/20">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-text-main hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}
      <div className="flex items-center gap-2">
         {/* Small Logo in Header */}
         {!onBack && <GfaLogo className="w-6 h-6 text-gfa-blue" />}
         <h1 className="text-xl font-bold text-text-main tracking-tight">{title}</h1>
      </div>
    </div>
    <div className="flex items-center gap-2">
        {action}
        {showSettings && (
        <button className="p-2 text-text-light hover:text-text-main transition-colors">
            <SettingsIcon className="w-6 h-6" />
        </button>
        )}
    </div>
  </header>
);

const BottomNav = ({ active, onChange }: { active: ViewState; onChange: (v: ViewState) => void }) => {
  const items = [
    { id: 'DASHBOARD', label: 'Início', icon: HomeIcon },
    { id: 'ROOM_ASSEMBLY', label: 'Montagem', icon: PuzzleIcon },
    { id: 'WORKERS', label: 'Equipe', icon: UsersIcon }, // Shortened label for better fit
    { id: 'ROOMS', label: 'Salas', icon: DoorIcon },
    { id: 'LOCATIONS', label: 'Locais', icon: MapPinIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-t border-white/60 pb-safe pt-2 px-2 shadow-2xl rounded-t-3xl">
      <div className="flex justify-around items-end">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 p-1 w-full transition-all duration-300 ${isActive ? 'text-primary-dark' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 -translate-y-2 shadow-sm' : ''}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100 font-bold text-slate-700 translate-y-[-4px]' : 'opacity-80'}`}>{item.label}</span>
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 overflow-hidden">
       <MainBackground />
       
       <div className="relative w-full flex flex-col items-center mb-10 z-10">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/40">
          <GfaLogo className="w-16 h-16 text-gfa-blue" />
        </div>
        <h1 className="text-text-main text-4xl font-bold tracking-tight">GFA</h1>
      </div>
      
      <h2 className="relative text-text-main text-[28px] font-bold mb-8 text-center leading-tight z-10">Bem-vindo(a) de volta</h2>
      
      <div className="relative w-full max-w-sm space-y-5 z-10">
        <div>
           <label className="block text-text-main/80 text-base font-medium mb-2 pl-1">Email ou usuário</label>
           <div className="relative">
                <input type="text" placeholder="Digite seu email ou usuário" className="w-full pl-5 pr-12 py-4 rounded-2xl border border-blue-100/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/50 text-base shadow-sm" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark/50">
                    <UsersIcon className="w-6 h-6" />
                </div>
           </div>
        </div>
        <div>
           <label className="block text-text-main/80 text-base font-medium mb-2 pl-1">Senha</label>
           <div className="relative">
                <input type="password" placeholder="Digite sua senha" className="w-full pl-5 pr-12 py-4 rounded-2xl border border-blue-100/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/50 text-base shadow-sm" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark/50">
                    <DoorIcon className="w-6 h-6" />
                </div>
           </div>
        </div>
        
        <div className="text-right pt-1">
          <a href="#" className="text-primary-dark text-sm font-semibold hover:underline">Esqueceu a senha?</a>
        </div>

        <button onClick={onLogin} className="w-full bg-primary-dark hover:bg-cyan-500 text-text-main font-bold text-lg py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cyan-200/50 mt-4">
          Entrar
        </button>
      </div>

       <div className="relative mt-12 text-center z-10">
          <p className="text-sm text-text-light">Não tem uma conta?</p>
          <a href="#" className="text-primary-dark font-bold text-base hover:underline mt-1 inline-block">Criar conta</a>
       </div>
    </div>
  );
};

const DashboardView = ({ onNavigate }: { onNavigate: (v: ViewState) => void }) => {
  const menuItems = [
    { id: 'ROOM_ASSEMBLY', label: 'Montagem das Salas', icon: PuzzleIcon },
    { id: 'WORKERS', label: 'Cadastro de Trabalhadores', icon: UsersIcon },
    { id: 'ROOMS', label: 'Cadastro de Salas de Passe', icon: DoorIcon },
    { id: 'LOCATIONS', label: 'Cadastro de Locais de Trabalho', icon: MapPinIcon },
  ];

  return (
    <div className="relative min-h-screen pt-4 px-0 overflow-hidden">
      <MainBackground />
      
      <div className="min-h-screen px-6 pt-10 relative z-10">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Navegação</h1>
            <SettingsIcon className="w-6 h-6 text-slate-600" />
        </div>
        
        <div className="flex flex-col items-center mb-10">
             <div className="bg-white p-4 rounded-full mb-2 shadow-lg backdrop-blur-md border border-white/60">
                <GfaLogo className="w-12 h-12 text-gfa-blue" />
             </div>
             {/* Use text shadow/glow for the title if desired, but bold text is usually enough */}
             <h2 className="text-3xl font-serif italic font-bold text-slate-800 drop-shadow-sm">GFA</h2>
        </div>

        <div className="grid gap-4">
            {menuItems.map((item, idx) => (
            <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`group relative flex items-center p-4 rounded-2xl shadow-lg border border-white/60 backdrop-blur-xl overflow-hidden transition-all active:scale-[0.98] text-left
                bg-gradient-to-r from-white/60 to-white/30 hover:from-white/70 hover:to-white/40`}
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner bg-gradient-to-br from-cyan-400 to-blue-500`}>
                    <item.icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1 relative z-10">
                    <h3 className="font-medium text-slate-700 text-lg">{item.label}</h3>
                </div>
            </button>
            ))}
        </div>
      </div>
      
      <BottomNav active="DASHBOARD" onChange={onNavigate} />
    </div>
  );
};

// -- Reusable Card for Worker in Assembly --
const WorkerCard: React.FC<{ worker: Worker; roleLabel?: string }> = ({ worker, roleLabel }) => {
  const roleStyles = {
    [WorkerRole.Coordenador]: "bg-blue-200 text-blue-800",
    [WorkerRole.Medium]: "bg-purple-200 text-purple-800",
    [WorkerRole.Dialogo]: "bg-green-200 text-green-800",
    [WorkerRole.Psicografa]: "bg-indigo-200 text-indigo-800",
    [WorkerRole.Sustentacao]: "bg-[#e0dcd5] text-[#5c554a]",
  }[worker.roles[0]] || "bg-gray-100 text-gray-700";

  // Using DiceBear v7 for stability.
  const avatarUrl = worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="flex items-center p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e8e4db] shadow-sm mb-2 relative group">
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
        <img 
          src={avatarUrl} 
          alt={worker.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="font-semibold text-text-main text-sm truncate">{worker.name}</p>
        <div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${roleStyles}`}>
          {roleLabel || worker.roles[0]}
        </div>
      </div>
      <button className="text-[#d0cdc5] hover:text-[#999]">
        <DragIndicatorIcon className="w-5 h-5" />
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
    <div className="min-h-screen pt-20 px-4 pb-28 bg-[#fdfbf7]">
      <Header 
        title="Montagem das Salas" 
        action={<button className="px-3 py-1 bg-blue-400 text-white text-sm font-bold rounded-lg shadow-sm">Salvar</button>}
      />
      
      <div className="mt-4 mb-6">
        <button 
          onClick={handleAutoGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-cyan-300 to-cyan-200 text-slate-800 font-bold py-3.5 rounded-full shadow-lg shadow-cyan-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 border border-white/50"
        >
          {isGenerating ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></span>
          ) : (
            <SparklesIcon className="w-5 h-5 text-slate-700" />
          )}
          {isGenerating ? "Gerando..." : "Gerar Automaticamente"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-500 px-1">Salas de Passe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passeRooms.map(room => {
               const occupants = workers.filter(w => w.assignedRoomId === room.id);
               const isFull = occupants.length >= room.capacity;
               
               return (
                <div key={room.id} className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${isFull ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {occupants.length}/{room.capacity}
                      {isFull ? <CheckCircleIcon className="w-3 h-3"/> : "!"}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[60px]">
                    {occupants.length === 0 && (
                       <div className="h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
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

        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-500 px-1">Outros Locais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherRooms.map(room => {
               const occupants = workers.filter(w => w.assignedRoomId === room.id);
               return (
                <div key={room.id} className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                    <span className="text-slate-400 font-bold text-sm">{occupants.length}</span>
                  </div>
                   <div className="space-y-2">
                    {occupants.length === 0 && <p className="text-xs text-stone-300 italic px-1">Vazio</p>}
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
           <div className="bg-white rounded-2xl p-4 border border-card-border/60 shadow-soft">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-text-main font-bold text-base">Não Alocados</h3>
                <span className="text-slate-400 text-sm font-bold">{unassignedWorkers.length}</span>
             </div>
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
    <div className="min-h-screen pt-20 px-4 pb-28 bg-gradient-to-br from-white to-blue-50/50">
      <Header title="Cadastro de Trabalhadores" onBack={onCancel} />
      
      <div className="space-y-6 mt-6">
        <div>
          <label className="block text-base font-semibold text-text-main mb-2 ml-1">Nome</label>
          <input className="w-full h-16 px-5 bg-blue-50/80 border-none rounded-2xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30 outline-none text-lg" placeholder="Nome completo" />
        </div>
        
        <div>
          <label className="block text-base font-semibold text-text-main mb-2 ml-1">Contato</label>
          <input className="w-full h-16 px-5 bg-blue-50/80 border-none rounded-2xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30 outline-none text-lg" placeholder="Telefone ou email" />
        </div>

        <div>
          <label className="block text-lg font-bold text-text-main mb-4 ml-1">Habilidades</label>
          <div className="space-y-1">
             {[
               { id: 1, label: 'Médium', checked: true },
               { id: 2, label: 'Diálogo', checked: true },
               { id: 3, label: 'Psicografa', checked: true },
               { id: 4, label: 'Sustentação', checked: true },
             ].map((skill, idx) => (
               <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-white">
                     <CheckIcon className="w-3.5 h-3.5 stroke-[4]" />
                   </div>
                   <span className="font-medium text-text-main text-lg">{skill.label}</span>
                 </div>
                 {/* Styled Toggle Switch */}
                 <div className={`w-14 h-8 rounded-full p-1 transition-colors ${skill.checked ? 'bg-blue-300' : 'bg-slate-200'}`}>
                   <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${skill.checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 mt-4">
           <span className="text-text-main font-medium text-lg">Coordenador de Sala</span>
           <div className="w-14 h-8 rounded-full p-1 bg-slate-200">
               <div className="w-6 h-6 rounded-full bg-white shadow-md translate-x-0"></div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 fixed bottom-8 left-4 right-4 bg-white/0">
           <button onClick={onCancel} className="h-14 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 text-lg">Cancelar</button>
           <button onClick={onSave} className="h-14 rounded-2xl bg-blue-300 text-white font-bold shadow-lg shadow-blue-200 hover:opacity-90 text-lg">Salvar</button>
        </div>
      </div>
    </div>
  );
};

const RoomListView = () => {
    return (
        <div className="min-h-screen pt-24 px-4 pb-28 bg-gradient-to-b from-purple-50 via-white to-green-50">
            <header className="fixed top-0 left-0 right-0 h-20 flex items-end justify-center pb-2 bg-white/80 backdrop-blur-md z-20">
                 <h1 className="font-serif text-3xl text-slate-800">Salas de Passe</h1>
            </header>
            
            <div className="mt-6 mb-8">
                <div className="bg-white p-1 rounded-2xl border border-blue-100 shadow-sm flex items-center mb-4">
                    <input className="flex-1 h-14 px-4 outline-none bg-transparent placeholder:text-slate-400 text-slate-700 text-lg" placeholder="Nome da Sala" />
                </div>
                <button className="w-full h-14 bg-[#7faec1] text-white font-bold rounded-full shadow-lg hover:bg-[#6a9bb0] transition-colors text-lg">
                    Adicionar Sala
                </button>
            </div>

            <h3 className="mb-4 text-2xl font-serif text-slate-800">Salas Cadastradas</h3>
            
            <div className="space-y-4">
                {['Sala 1', 'Sala 2', 'Sala 3'].map((room, i) => (
                    <div key={i} className="bg-white p-3 rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between group h-24">
                        <div className="flex items-center gap-4">
                            {/* Replaced DiceBear Shapes with a robust SVG Icon in a container */}
                            <div className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-inner bg-blue-50 flex items-center justify-center">
                                <DoorIcon className="w-8 h-8 text-blue-300" />
                            </div>
                            <span className="font-medium text-xl text-slate-700">{room}</span>
                        </div>
                        <div className="flex gap-1 pr-2">
                             <button className="p-2 text-slate-400 hover:text-blue-500"><EditIcon className="w-6 h-6"/></button>
                             <button className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-6 h-6"/></button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Background decoration */}
            <div className="fixed bottom-0 right-0 w-80 h-80 pointer-events-none opacity-[0.03] text-gfa-blue rotate-12 translate-x-1/3 translate-y-1/3">
               <GfaLogo className="w-full h-full text-gfa-blue" />
            </div>
        </div>
    )
}

const LocationListView = ({ onBack }: { onBack: () => void }) => {
  const locations = [
    { name: "Recepção", desc: "Atendimento dos assistidos.", icon: <UsersIcon className="w-8 h-8 text-orange-400" />, type: "Recepção", color: "bg-orange-50 border-orange-100" },
    { name: "Sala de Aula", desc: "Acolhimento dos irmãos iniciantes.", icon: <BookIcon className="w-8 h-8 text-blue-400" />, type: "Aula", color: "bg-blue-50 border-blue-100" },
    { name: "Auditório", desc: "Palestra sobre o Evangelho Segundo o Espiritismo.", icon: <MicrophoneIcon className="w-8 h-8 text-purple-400" />, type: "Auditório", color: "bg-purple-50 border-purple-100" },
    { name: "Sala de Entrevista", desc: "Sala de entrevista para direcionamento.", icon: <UsersIcon className="w-8 h-8 text-green-400" />, type: "Entrevista", color: "bg-green-50 border-green-100" },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-28 bg-[#f2f7f9]">
      <Header title="Locais de Trabalho" onBack={onBack} />
      
      <div className="mt-6 space-y-4">
        {locations.map((loc, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-soft border border-white flex items-center gap-4 relative overflow-hidden">
             {/* Replaced DiceBear Icons with robust local SVGs */}
             <div className={`w-14 h-14 rounded-2xl ${loc.color} overflow-hidden flex items-center justify-center text-3xl shadow-sm border`}>
               {loc.icon}
             </div>
             <div className="flex-1 min-w-0 z-10">
               <h4 className="font-bold text-xl text-slate-800">{loc.name}</h4>
               <p className="text-sm text-slate-500 leading-tight mt-1 truncate">{loc.desc}</p>
             </div>
             <div className="flex flex-col gap-2 z-10">
                <button className="text-slate-300 hover:text-slate-500 p-1">
                    <MoreDotsIcon className="w-6 h-6 text-slate-300" />
                </button>
             </div>
             {/* Decorative pattern on card */}
             <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
      
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#d4a45a] border border-[#f0e6d2] hover:scale-105 transition-transform z-40">
        <PlusIcon className="w-8 h-8 stroke-[3]" />
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
      
      {view === 'LOCATIONS' && <LocationListView onBack={handleBack} />}

      {/* Show Bottom Nav only on main internal screens */}
      {view !== 'LOGIN' && (
        <BottomNav active={view} onChange={handleNavigate} />
      )}
    </div>
  );
}