import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function UserDashboard() {
    const { user } = useAuth();
    const [target, setTarget] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchTarget();
        fetchMySubmission();
    }, [user]);

    const fetchTarget = async () => {
        const date = new Date();
        const { data } = await supabase
            .from('monthly_targets')
            .select('target_value')
            .eq('month', date.getMonth() + 1)
            .eq('year', date.getFullYear())
            .single();

        if (data) setTarget(data.target_value);
    };

    const fetchMySubmission = async () => {
        if (!user) return;
        const date = new Date();

        // First get the target ID
        const { data: targetData } = await supabase
            .from('monthly_targets')
            .select('id')
            .eq('month', date.getMonth() + 1)
            .eq('year', date.getFullYear())
            .single();

        if (targetData) {
            const { data } = await supabase
                .from('submissions')
                .select('status')
                .eq('user_id', user.id)
                .eq('target_id', targetData.id)
                .maybeSingle();

            if (data) setStatus(data.status);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('submissions')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('submissions')
                .getPublicUrl(fileName);

            // Get target ID
            const date = new Date();
            const { data: targetData } = await supabase
                .from('monthly_targets')
                .select('id')
                .eq('month', date.getMonth() + 1)
                .eq('year', date.getFullYear())
                .single();

            if (!targetData) throw new Error('No target set for this month');

            // Use upsert to handle re-submissions (e.g., after rejection)
            const { error: dbError } = await supabase
                .from('submissions')
                .upsert({
                    user_id: user.id,
                    target_id: targetData.id,
                    image_url: publicUrl,
                    status: 'pending' // Reset status to pending
                }, {
                    onConflict: 'user_id,target_id'
                });

            if (dbError) throw dbError;

            setStatus('pending');
        } catch (error: any) {
            alert('Error uploading: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const canUpload = !status || status === 'rejected';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                    Ingreso mensual
                </h1>
                {/* <p className="text-gray-400">Push your limits, track your progress.</p> */}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <h2 className="text-xl text-gray-400 mb-4 relative z-10">Ingreso mensual</h2>
                    <div className="text-5xl font-bold text-white mb-2 relative z-10">
                        {target || 'Not Set'}
                    </div>
                    <div className="text-sm text-indigo-400 font-medium relative z-10">
                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <h2 className="text-xl font-semibold mb-6 text-white">Your Submission</h2>

                    {status && (
                        <div className={`p-4 rounded-xl text-center border mb-4 ${status === 'approved' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            }`}>
                            <div className="font-bold">Status: {status.toUpperCase()}</div>
                            {status === 'rejected' && <p className="text-xs mt-1">Please try again.</p>}
                        </div>
                    )}

                    {canUpload ? (
                        <div className="h-full flex flex-col justify-center">
                            <div className="space-y-4">
                                <label className="block w-full cursor-pointer group">
                                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-all">
                                        <div className="text-gray-400 group-hover:text-indigo-400 mb-2">
                                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-400 group-hover:text-indigo-300">
                                            {uploading ? 'Uploading...' : (status === 'rejected' ? 'Upload New Proof' : 'Click to upload proof')}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}
