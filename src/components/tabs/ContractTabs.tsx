interface Tab {
    id: 'readme' | 'state' | 'read' | 'write';
    label: string;
    count: number | null;
}

interface ContractTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tab: Tab['id']) => void;
}

export default function ContractTabs({ tabs, activeTab, onTabChange }: ContractTabsProps) {
    return (
        <div className="flex gap-1 p-1 bg-surface-2/30">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-all rounded-lg ${activeTab === tab.id
                        ? 'bg-surface text-primary shadow-sm border border-surface-2'
                        : 'text-fg-muted hover:text-fg hover:bg-surface-2/50'
                        }`}
                >
                    <span className="flex items-center justify-center gap-1.5">
                        {tab.label}
                        {tab.count !== null && (
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-surface-2 text-fg-muted'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}
