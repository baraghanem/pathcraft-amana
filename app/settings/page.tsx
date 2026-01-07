import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Nav Placeholder */}
                <Card className="lg:w-64 h-fit p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start bg-gray-100 dark:bg-gray-800 font-bold">Profile Info</Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400">Account</Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400">Notifications</Button>
                </Card>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Profile Info Card */}
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Profile Info</h2>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full bg-blue-500"></div>
                            <Button variant="outline">Change Avatar</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="Sarah" />
                            <Input label="Last Name" defaultValue="Connor" />
                            <Input label="Email" defaultValue="sarah@example.com" className="md:col-span-2" />
                            <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                                <div>
                                    <h3 className="font-medium">Public Profile</h3>
                                    <p className="text-sm text-gray-500">Allow others to see your learning paths.</p>
                                </div>
                                {/* Mock Toggle Switch */}
                                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button>Save Changes</Button>
                        </div>
                    </Card>

                    {/* Course Management (Admin Optional part of wireframe) */}
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Course Management</h2>
                            <Button variant="outline" className="text-sm">+ Add User</Button>
                        </div>

                        {/* Simple Table Placeholder */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                        <td className="px-4 py-3 font-medium">Frank Underwood</td>
                                        <td className="px-4 py-3">Admin</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" className="text-xs p-1 h-auto">Edit</Button>
                                        </td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                        <td className="px-4 py-3 font-medium">Claire Hale</td>
                                        <td className="px-4 py-3">Editor</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" className="text-xs p-1 h-auto">Edit</Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}