import { useState, useEffect, useCallback } from 'react';
import { curriculumAPI, masterSubjectAPI } from '../services/api';
import toast from 'react-hot-toast';

const SEMESTER_LABELS = {
    1: '1st Year - Semester 1',
    2: '1st Year - Semester 2',
    3: '2nd Year - Semester 3',
    4: '2nd Year - Semester 4',
    5: '3rd Year - Semester 5',
    6: '3rd Year - Semester 6',
    7: '4th Year - Semester 7',
    8: '4th Year - Semester 8',
};

const emptySubject = () => ({
    semester: 1, // Defaulting to 1, user can change via dropdown
    name: '',
    code: '',
    type: 'theory',
    credits: '',
    hoursPerWeek: '',
});

export default function CurriculumPage() {
    const [allCurricula, setAllCurricula] = useState([]);
    const [masterSubjects, setMasterSubjects] = useState([]);
    const [newMaster, setNewMaster] = useState({ name: '', code: '', type: 'theory', credits: 3, hoursPerWeek: 3 });
    const [academicYear, setAcademicYear] = useState('2025-2026');
    const [sections, setSections] = useState(1);
    const [subjects, setSubjects] = useState([emptySubject()]);
    const [saving, setSaving] = useState(false);
    const [loadingAll, setLoadingAll] = useState(true);
    const [parsing, setParsing] = useState(false);

    const handleCreateMaster = async (e) => {
        e.preventDefault();
        if (!newMaster.name || !newMaster.code) return;
        try {
            const { data } = await masterSubjectAPI.create(newMaster);
            setMasterSubjects((prev) => [...prev, data.subject]);
            toast.success("Added to Master Library!");
            setNewMaster({ name: '', code: '', type: 'theory', credits: 3, hoursPerWeek: 3 });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create master subject");
        }
    };

    const fetchAll = useCallback(async () => {
        try {
            const [curriculumRes, masterRes] = await Promise.all([
                curriculumAPI.getAll(),
                masterSubjectAPI.getAll().catch(() => ({ data: { subjects: [] } }))
            ]);
            
            setMasterSubjects(masterRes.data.subjects || []);
            const data = curriculumRes.data;

            setAllCurricula(data.curricula);
            
            if (data.curricula.length > 0) {
                // Flatten all subjects into one unified array
                let flattened = [];
                // Use the first curriculum's academic settings as global for the form
                setAcademicYear(data.curricula[0].academicYear);
                setSections(data.curricula[0].sections);

                data.curricula.forEach(c => {
                    c.subjects.forEach(s => {
                        flattened.push({ ...s, semester: c.semester });
                    });
                });
                
                if (flattened.length > 0) {
                    // Sort by semester, then by code
                    flattened.sort((a,b) => a.semester - b.semester);
                    setSubjects(flattened);
                } else {
                    setSubjects([emptySubject()]);
                }
            }
        } catch {
            // ignore
        } finally {
            setLoadingAll(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const updateSubject = (idx, field, value) => {
        setSubjects((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const addSubject = () => setSubjects((prev) => [...prev, emptySubject()]);

    const removeSubject = (idx) => {
        if (subjects.length === 1) return;
        setSubjects((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        const valid = subjects.every((s) => s.semester && s.name && s.code && s.credits && s.hoursPerWeek);
        if (!valid) {
            toast.error('Please fill in all subject fields completely.');
            return;
        }
        setSaving(true);
        // Group subjects by their selected semester
        const grouped = {};
        for (const s of subjects) {
            if (!grouped[s.semester]) {
                grouped[s.semester] = [];
            }
            grouped[s.semester].push({
                name: s.name,
                code: s.code,
                type: s.type,
                credits: Number(s.credits),
                hoursPerWeek: Number(s.hoursPerWeek),
            });
        }

        try {
            // Save each populated semester to the backend
            // In a real prod environment we might want a bulk save endpoint, but Promise.all is fine here
            await Promise.all(
                Object.entries(grouped).map(([sem, subs]) => 
                    curriculumAPI.save({
                        semester: Number(sem),
                        academicYear,
                        sections,
                        subjects: subs,
                    })
                )
            );
            toast.success(`All updated Curriculum data saved successfully!`);
            await fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setParsing(true);
        toast.loading('Parsing multi-semester document...', { id: 'parse-toast' });
        try {
            const { data } = await curriculumAPI.parseFile(file);
            
            if (data.subjects && data.subjects.length > 0) {
                // Flatten the extracted groups to match the unified UI State
                let flattened = [];
                data.subjects.forEach(group => {
                    group.subjects.forEach(s => {
                        flattened.push({ ...s, semester: group.semester });
                    });
                });

                if (flattened.length > 0) {
                    setSubjects(flattened);
                    toast.success('Document parsed! Please review the table below and click Save Curriculum.', { id: 'parse-toast', duration: 5000 });
                } else {
                    toast.error('Could not map subjects to semesters.', { id: 'parse-toast' });
                }

            } else {
                toast.error('No subjects could be extracted from this document.', { id: 'parse-toast' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to parse document.', { id: 'parse-toast' });
        } finally {
            setParsing(false);
            e.target.value = null; // reset input
        }
    };

    const semHasCurriculum = (sem) => allCurricula.some((c) => c.semester === sem);

    if (loadingAll) {
        return (
            <div className="loading-wrap">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">📘 Curriculum Management</h1>
                    <p className="page-subtitle">Define subjects, credits & hours per semester — AD&DS Department</p>
                </div>
            </div>

            {/* Master Curriculum Configuration */}
            <div className="card mb-2">
                <h3 className="card-title mb-2">Master Curriculum Configuration</h3>
                <div className="grid-2">
                    <div className="form-group">
                        <label>Academic Year</label>
                        <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2025-2026" />
                    </div>
                    <div className="form-group">
                        <label>Number of Sections</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={sections}
                            onChange={(e) => setSections(Math.max(1, Number(e.target.value)))}
                        />
                        <span className="text-muted text-sm" style={{ marginTop: '0.25rem', display: 'block' }}>
                            Sections: {Array.from({ length: sections }, (_, i) => String.fromCharCode(65 + i)).join(', ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Master Subject Library Quick Add */}
            <div className="card mb-2">
                <h3 className="card-title mb-2">Subject Library (Master List)</h3>
                <p className="text-muted text-sm mb-2">Add reusable subjects here so they auto-fill when you type their name in the curriculum table below.</p>
                <form onSubmit={handleCreateMaster} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto', gap: '0.5rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0 }}><label>Name</label><input style={{ padding: '0.4rem', fontSize: '0.82rem' }} value={newMaster.name} onChange={(e) => setNewMaster({...newMaster, name: e.target.value})} placeholder="Database Systems" required /></div>
                    <div className="form-group" style={{ margin: 0 }}><label>Code</label><input style={{ padding: '0.4rem', fontSize: '0.82rem' }} value={newMaster.code} onChange={(e) => setNewMaster({...newMaster, code: e.target.value})} placeholder="CS302" required /></div>
                    <div className="form-group" style={{ margin: 0 }}><label>Type</label>
                        <select style={{ padding: '0.4rem', fontSize: '0.82rem' }} value={newMaster.type} onChange={(e) => setNewMaster({...newMaster, type: e.target.value})}>
                            <option value="theory">Theory</option><option value="lab">Lab</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}><label>Credits</label><input style={{ padding: '0.4rem', fontSize: '0.82rem' }} type="number" min="1" value={newMaster.credits} onChange={(e) => setNewMaster({...newMaster, credits: Number(e.target.value)})} required /></div>
                    <div className="form-group" style={{ margin: 0 }}><label>Hours</label><input style={{ padding: '0.4rem', fontSize: '0.82rem' }} type="number" min="1" value={newMaster.hoursPerWeek} onChange={(e) => setNewMaster({...newMaster, hoursPerWeek: Number(e.target.value)})} required /></div>
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ marginBottom: '0.1rem' }}>+ Add to Library</button>
                </form>
            </div>

            {/* Master Subject table */}
            <div className="card mb-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>
                        All Semesters (Master List)
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                         <div style={{ position: 'relative' }}>
                            <input 
                                type="file" 
                                id="curriculumFile"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                disabled={parsing}
                            />
                            <label 
                                htmlFor="curriculumFile" 
                                className="btn btn-secondary btn-sm"
                                style={{ cursor: parsing ? 'not-allowed' : 'pointer', opacity: parsing ? 0.7 : 1 }}
                            >
                                {parsing ? '⏳ Parsing...' : '📄 Bulk Upload All Semesters (PDF/DOC)'}
                            </label>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={addSubject}>
                            ➕ Add Subject
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="tt-table" style={{ width: '100%', minWidth: 700 }}>
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>#</th>
                                <th style={{ width: 100 }}>Semester</th>
                                <th>Subject Name</th>
                                <th style={{ width: 120 }}>Code</th>
                                <th style={{ width: 110 }}>Type</th>
                                <th style={{ width: 90 }}>Credits</th>
                                <th style={{ width: 110 }}>Hrs/Week</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub, idx) => (
                                <tr key={idx}>
                                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <select
                                            value={sub.semester}
                                            onChange={(e) => updateSubject(idx, 'semester', Number(e.target.value))}
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <option key={s} value={s}>Sem {s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            list={`subject-names-${idx}`}
                                            value={sub.name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const matched = masterSubjects.find(m => m.name === val);
                                                if (matched) {
                                                    setSubjects(prev => {
                                                        const next = [...prev];
                                                        next[idx] = { 
                                                            ...next[idx], 
                                                            name: matched.name, 
                                                            code: matched.code, 
                                                            type: matched.type, 
                                                            credits: matched.credits, 
                                                            hoursPerWeek: matched.hoursPerWeek 
                                                        };
                                                        return next;
                                                    });
                                                } else {
                                                    updateSubject(idx, 'name', val);
                                                }
                                            }}
                                            placeholder="e.g. Data Structures"
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        />
                                        <datalist id={`subject-names-${idx}`}>
                                            {masterSubjects.map(m => (
                                                <option key={m._id || m.code} value={m.name} />
                                            ))}
                                        </datalist>
                                    </td>
                                    <td>
                                        <input
                                            value={sub.code}
                                            onChange={(e) => updateSubject(idx, 'code', e.target.value)}
                                            placeholder="CS201"
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={sub.type}
                                            onChange={(e) => updateSubject(idx, 'type', e.target.value)}
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        >
                                            <option value="theory">Theory</option>
                                            <option value="lab">Lab</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={sub.credits}
                                            onChange={(e) => updateSubject(idx, 'credits', e.target.value)}
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={sub.hoursPerWeek}
                                            onChange={(e) => updateSubject(idx, 'hoursPerWeek', e.target.value)}
                                            style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {subjects.length > 1 && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                                onClick={() => removeSubject(idx)}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary + Save */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    <div className="text-sm text-muted">
                        Total Credits:{' '}
                        <strong>{subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)}</strong> &nbsp;|&nbsp; Total
                        Hrs/Week: <strong>{subjects.reduce((sum, s) => sum + (Number(s.hoursPerWeek) || 0), 0)}</strong>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save Curriculum'}
                    </button>
                </div>
            </div>

            {/* Tip */}
            <div
                style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(96,165,250,0.1)',
                    border: '1px solid rgba(96,165,250,0.25)',
                    fontSize: '0.85rem',
                }}
            >
                💡 <strong>Tip:</strong> After defining curriculum for all semesters, go to{' '}
                <strong>Create Timetable</strong> to bulk-generate timetables for all even or odd semesters at once.
            </div>
        </div>
    );
}
