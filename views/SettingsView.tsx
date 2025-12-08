import React, { useRef } from "react";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { TrashIcon, CheckIcon } from "../components/Icons";
import { exportData, importData, clearAllData, getLastModified, getStorageSize, saveWorkers, saveRooms } from "../utils/storage";

interface SettingsViewProps {
    onDataImported: (workers: any[], rooms: any[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataImported }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastModified = getLastModified();
    const storageSize = getStorageSize();

    const handleExport = () => {
        try {
            const jsonData = exportData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `centro-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert('✅ Dados exportados com sucesso!');
        } catch (error) {
            alert('❌ Erro ao exportar dados');
            console.error(error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result as string;
                const data = importData(jsonString);

                if (data) {
                    saveWorkers(data.workers);
                    saveRooms(data.rooms);
                    onDataImported(data.workers, data.rooms);

                    alert('✅ Dados importados com sucesso!\n\nRecarregue a página para ver as mudanças.');
                } else {
                    alert('❌ Arquivo JSON inválido');
                }
            } catch (error) {
                alert('❌ Erro ao importar dados');
                console.error(error);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleClearData = () => {
        const confirm1 = confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados permanentemente!\n\nDeseja continuar?');
        if (!confirm1) return;

        const confirm2 = confirm('🚨 Última confirmação!\n\nTem certeza absoluta?\n\nRecomendamos exportar um backup antes.');
        if (!confirm2) return;

        clearAllData();
        alert('✅ Dados limpos com sucesso!\n\nRecarregue a página.');
        window.location.reload();
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return 'Nunca';
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <PageContainer>
            <Header title="Configurações" />

            <div className="mt-6 space-y-4">
                {/* Info Card */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                    <h3 className="font-bold text-lg text-slate-800 mb-2">📊 Informações</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p><strong>Última modificação:</strong> {formatDate(lastModified)}</p>
                        <p><strong>Tamanho dos dados:</strong> {storageSize}</p>
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExport}
                    className="w-full bg-white border-2 border-green-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-green-50 transition-colors"
                >
                    <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 text-3xl">
                        ⬇️
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-lg text-slate-800">Exportar Dados</h3>
                        <p className="text-sm text-slate-500">Fazer backup em arquivo JSON</p>
                    </div>
                </button>

                {/* Import Button */}
                <button
                    onClick={handleImportClick}
                    className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-blue-50 transition-colors"
                >
                    <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 text-3xl">
                        ⬆️
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-lg text-slate-800">Importar Dados</h3>
                        <p className="text-sm text-slate-500">Restaurar de um backup JSON</p>
                    </div>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Clear Data Button */}
                <button
                    onClick={handleClearData}
                    className="w-full bg-white border-2 border-red-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-red-50 transition-colors"
                >
                    <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                        <TrashIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-lg text-slate-800">Limpar Todos os Dados</h3>
                        <p className="text-sm text-slate-500">⚠️ Ação irreversível! Exporte antes</p>
                    </div>
                </button>

                {/* Help Text */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                    <p className="text-sm text-amber-800">
                        <strong>💡 Dica:</strong> Exporte seus dados semanalmente e guarde o arquivo JSON em local seguro
                        (Google Drive, email, etc). Os dados só existem neste dispositivo.
                    </p>
                </div>
            </div>
        </PageContainer>
    );
};
