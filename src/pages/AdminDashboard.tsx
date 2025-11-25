import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface Submission {
    id: number;
    user_id: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    profiles: { username: string } | null;
}

export default function AdminDashboard() {
    const { role } = useAuth();
    const [targetValue, setTargetValue] = useState('');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (role === 'admin') {
            fetchSubmissions();
            fetchCurrentTarget();
        }
    }, [role]);

    const fetchCurrentTarget = async () => {
        const date = new Date();
        const { data } = await supabase
            .from('monthly_targets')
            .select('target_value')
            .eq('month', date.getMonth() + 1)
            .eq('year', date.getFullYear())
            .single();

        if (data) {
            setTargetValue(data.target_value);
        }
    };

    const fetchSubmissions = async () => {
        // 1. Fetch submissions first
        const { data: submissionsData, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'pending');

        if (subError) {
            console.error('Error fetching submissions:', subError);
            setLoading(false);
            return;
        }

        if (submissionsData && submissionsData.length > 0) {
            // 2. Get unique user IDs
            const userIds = Array.from(new Set(submissionsData.map(s => s.user_id)));

            // 3. Fetch profiles for these users
            const { data: profilesData, error: profError } = await supabase
                .from('profiles')
                .select('id, username')
                .in('id', userIds);

            if (profError) {
                console.error('Error fetching profiles:', profError);
            }

            // 4. Merge data
            const mergedData = submissionsData.map(sub => ({
                ...sub,
                profiles: profilesData?.find(p => p.id === sub.user_id) || { username: 'Unknown' }
            }));

            console.log('Merged submissions:', mergedData);
            setSubmissions(mergedData as any);
        } else {
            setSubmissions([]);
        }
        setLoading(false);
    };

    const handleSetTarget = async () => {
        const date = new Date();
        const { error } = await supabase
            .from('monthly_targets')
            .upsert({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                target_value: targetValue
            }, { onConflict: 'month,year' });

        if (!error) {
            alert('Target set successfully!');
        } else {
            alert('Error setting target');
        }
    };

    const handleReview = async (id: number, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('submissions')
            .update({ status })
            .eq('id', id);

        if (!error) {
            setSubmissions(submissions.filter(s => s.id !== id));
        }
    };

    if (role !== 'admin') return <div className="text-white p-8">Access Denied</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl mx-auto"
        >

            {/* 
            
            This is done through the database itself. 
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <Link
                    to="/admin/users"
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                >
                    Gestionar Usuarios
                </Link>
            </div> */}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 text-indigo-400">Poner ingreso mensual</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Valor objetivo</label>
                                <input
                                    type="text"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    className="input-field w-full rounded-lg p-3"
                                    placeholder="ej: 100€"
                                />
                            </div>
                            <button
                                onClick={handleSetTarget}
                                className="btn-primary w-full py-2 rounded-lg font-medium"
                            >
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                            Pendientes
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">
                                {submissions.length}
                            </span>
                        </h2>

                        {loading ? (
                            <div className="text-gray-400 text-center py-8">Loading...</div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.length === 0 && (
                                    <div className="text-gray-500 text-center py-12 border border-dashed border-gray-700 rounded-xl">
                                        No hay pendientes
                                    </div>
                                )}
                                {submissions.map(sub => (
                                    <motion.div
                                        layout
                                        key={sub.id}
                                        className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4"
                                    >
                                        <div className="flex-1 w-full sm:w-auto">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {sub.profiles?.username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <p className="font-medium text-white">{sub.profiles?.username || 'Unknown User'}</p>
                                            </div>
                                            <div className="mt-2">
                                                <img
                                                    src={sub.image_url}
                                                    alt="Submission proof"
                                                    className="w-full max-w-xs rounded-lg border border-slate-700 hover:opacity-90 transition-opacity cursor-pointer"
                                                    onClick={() => window.open(sub.image_url, '_blank')}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleReview(sub.id, 'approved')}
                                                className="flex-1 sm:flex-none bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                onClick={() => handleReview(sub.id, 'rejected')}
                                                className="flex-1 sm:flex-none bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
