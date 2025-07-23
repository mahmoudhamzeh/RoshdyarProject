import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import './HealthProfilePage.css';

Modal.setAppElement('#root');

const HealthProfilePage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [visits, setVisits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [newVisit, setNewVisit] = useState({ date: new Date(), doctorName: '', reason: '', summary: '' });
    const [newDocument, setNewDocument] = useState({ title: '', file: null });

    const fetchAllData = useCallback(async () => {
        try {
            const childRes = await fetch(`http://localhost:5000/api/children/${childId}`);
            const childData = await childRes.json();
            setChild(childData);

            const visitsRes = await fetch(`http://localhost:5000/api/visits/${childId}`);
            const visitsData = await visitsRes.json();
            setVisits(visitsData);

            const docsRes = await fetch(`http://localhost:5000/api/documents/${childId}`);
            const docsData = await docsRes.json();
            setDocuments(docsData);
        } catch (error) { history.push('/my-children'); }
    }, [childId, history]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleVisitChange = (e) => setNewVisit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleVisitDateChange = (date) => setNewVisit(prev => ({ ...prev, date }));

    const handleVisitSubmit = async (e) => {
        e.preventDefault();
        const visitData = { ...newVisit, date: format(newVisit.date, 'yyyy/MM/dd') };
        try {
            await fetch(`http://localhost:5000/api/visits/${childId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(visitData) });
            fetchAllData();
            setIsVisitModalOpen(false);
        } catch (error) { alert(error.message); }
    };

    const handleDocChange = (e) => { e.target.type === 'file' ? setNewDocument(prev => ({ ...prev, file: e.target.files[0] })) : setNewDocument(prev => ({ ...prev, title: e.target.value })); };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        if (!newDocument.file) return alert('لطفاً فایل را انتخاب کنید.');
        const docData = new FormData();
        docData.append('title', newDocument.title);
        docData.append('document', newDocument.file);
        try {
            await fetch(`http://localhost:5000/api/documents/${childId}`, { method: 'POST', body: docData });
            fetchAllData();
            setIsDocModalOpen(false);
        } catch (error) { alert(error.message); }
    };

    if (!child) return <p>در حال بارگذاری...</p>;
    const avatarUrl = child.avatar && child.avatar.startsWith('/uploads') ? `http://localhost:5000${child.avatar}` : (child.avatar || 'https://i.pravatar.cc/100');

    return (
        <div className="health-profile-page">
            <nav className="page-nav-final"><button onClick={() => history.push('/my-children')}>&larr; لیست کودکان</button><h1>پرونده سلامت</h1></nav>
            <header className="profile-header"><img src={avatarUrl} alt={child.name} /><div className="profile-header-info"><h2>{child.name}</h2><p>{child.age}</p></div></header>
            <main className="profile-content">
                <div className="profile-grid">
                    <div className="profile-card"><h3>اطلاعات پایه</h3><div className="info-grid">{/* ... */}</div><button onClick={() => history.push(`/edit-child/${child.id}`)}>ویرایش</button></div>
                    <div className="profile-card"><h3>مراجعات پزشکی</h3><button onClick={() => setIsVisitModalOpen(true)}>+ افزودن</button><div className="visits-list">{visits.map((v, i) => <div key={i}>...</div>)}</div></div>
                    <div className="profile-card"><h3>مدارک پزشکی</h3><button onClick={() => setIsDocModalOpen(true)}>+ آپلود</button><div className="documents-list">{documents.map((d, i) => <div key={i}><a href={`http://localhost:5000${d.filePath}`} >{d.title}</a><span>{d.uploadDate}</span></div>)}</div></div>
                    <div className="profile-card full-width"><button onClick={() => history.push(`/growth-chart/${childId}`)}>نمودار رشد</button></div>
                </div>
            </main>
            <Modal isOpen={isVisitModalOpen} onRequestClose={() => setIsVisitModalOpen(false)}>{/* ... Visit Modal ... */}</Modal>
            <Modal isOpen={isDocModalOpen} onRequestClose={() => setIsDocModalOpen(false)}>{/* ... Document Modal ... */}</Modal>
        </div>
    );
};

export default HealthProfilePage;