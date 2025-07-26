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
        <div className="health-profile-container">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/my-children')} className="back-btn">&larr; بازگشت</button>
                <h1>پرونده سلامت</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <header className="profile-header-section">
                <img src={avatarUrl} alt={child.name} className="profile-avatar" />
                <div className="profile-header-info">
                    <h2>{child.name}</h2>
                    <p>سن: {child.age}</p>
                </div>
            </header>
            <main className="profile-cards-grid">
                {/* Basic Info Card */}
                <div className="summary-card">
                    <h4>اطلاعات پایه</h4>
                    <p>جنسیت: {child.gender === 'boy' ? 'پسر' : 'دختر'}</p>
                    <p>گروه خونی: {child.bloodType}</p>
                    <button onClick={() => history.push(`/edit-child/${child.id}`)}>ویرایش اطلاعات</button>
                </div>

                {/* Allergies Card */}
                <div className="summary-card">
                    <h4>آلرژی‌ها</h4>
                    {Object.entries(child.allergies.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                    <p>{child.allergies.description}</p>
                </div>

                {/* Special Illnesses Card */}
                <div className="summary-card">
                    <h4>بیماری‌های خاص</h4>
                    {Object.entries(child.special_illnesses.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                    <p>{child.special_illnesses.description}</p>
                </div>

                {/* Medical Visits Card */}
                <div className="summary-card interactive" onClick={() => setIsVisitModalOpen(true)}>
                    <h4>مراجعات پزشکی</h4>
                    <p>تعداد مراجعات ثبت شده: {visits.length}</p>
                    <span className="view-details-link">مشاهده و افزودن</span>
                </div>

                {/* Medical Documents Card */}
                <div className="summary-card interactive" onClick={() => setIsDocModalOpen(true)}>
                    <h4>مدارک پزشکی</h4>
                    <p>تعداد مدارک ثبت شده: {documents.length}</p>
                    <span className="view-details-link">مشاهده و آپلود</span>
                </div>

                {/* Growth Chart Card */}
                <div className="summary-card interactive" onClick={() => history.push(`/growth-chart/${childId}`)}>
                    <h4>نمودار رشد</h4>
                    <p>مشاهده روند رشد کودک</p>
                    <span className="view-details-link">مشاهده نمودار</span>
                </div>
            </main>

            {/* Modals will be updated later */}
            <Modal isOpen={isVisitModalOpen} onRequestClose={() => setIsVisitModalOpen(false)}>{/* ... Visit Modal ... */}</Modal>
            <Modal isOpen={isDocModalOpen} onRequestClose={() => setIsDocModalOpen(false)}>{/* ... Document Modal ... */}</Modal>
        </div>
    );
};

export default HealthProfilePage;