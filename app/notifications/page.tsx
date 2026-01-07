import { Card } from "@/app/components/ui/Card";

const notifications = [
    { id: 1, type: "milestone", title: "Milestone Achieved", description: "You completed 3 steps in 'Web Dev Path'", time: "10m ago", icon: "🏆", read: false },
    { id: 2, type: "reminder", title: "Reminder", description: "Don't forget to study today!", time: "2h ago", icon: "⏰", read: false },
    { id: 3, type: "system", title: "New Feature", description: "Dark mode is now available.", time: "1d ago", icon: "✨", read: true },
];

export default function NotificationsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-2xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <button className="text-sm text-blue-600 hover:underline">Mark all as read</button>
            </div>

            <div className="space-y-4">
                {notifications.map(note => (
                    <Card key={note.id} className={`flex gap-4 p-4 items-start ${note.read ? 'opacity-75' : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'}`}>
                        <div className="text-2xl bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">{note.icon}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-semibold ${note.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{note.title}</h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{note.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.description}</p>
                        </div>
                        {!note.read && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}