import GridContainer from "@/components/layout/GridContainer";
import ApiKeyInput from "@/components/settings/ApiKeyInput";
import ModelNameInput from "@/components/settings/ModelNameInput";
import StorageTable from "@/components/settings/StorageTable";

export default function SettingsPage() {
    return (
        <GridContainer>
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500">Manage external API keys and local data.</p>
                </div>

                {/* API Keys Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-slate-700">API Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
                        <ApiKeyInput
                            storageKey="gemini_api_key"
                            label="Gemini API Key"
                            placeholder="Paste your Google Gemini Key here..."
                        />
                        <ModelNameInput
                            storageKey="gemini_model_name"
                            label="Gemini Model Name"
                            placeholder="gemini-2.5-flash-live"
                        />
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-slate-700">Data Management</h2>
                    <StorageTable />
                </div>

            </div>
        </GridContainer>
    );
}