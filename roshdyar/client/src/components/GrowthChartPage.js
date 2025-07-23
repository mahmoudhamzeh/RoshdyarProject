import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import { format, differenceInMonths, parseISO } from 'date-fns';
import Modal from 'react-modal';
import "react-datepicker/dist/react-datepicker.css";
import './GrowthChartPage.css';
import { heightForAgeBoys, weightForAgeBoys, heightForAgeGirls, weightForAgeGirls } from '../who-stats';

Modal.setAppElement('#root');

const getGrowthStatus = (ageInMonths, value, standardData) => {
    if (!value) return { text: '-', color: 'grey' };
    const standard = [...standardData].reverse().find(d => d.month <= ageInMonths);
    if (!standard) return { text: 'N/A', color: 'grey' };
    if (value < standard.P3) return { text: 'پایین‌تر از نرمال', color: '#ff9800' };
    if (value > standard.P97) return { text: 'بالاتر از نرمال', color: '#f44336' };
    return { text: 'نرمال', color: '#4caf50' };
};

const GrowthChartPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [newRecord, setNewRecord] = useState({ date: new Date(), height: '', weight: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const fetchAllData = useCallback(async () => {
        try {
            const childRes = await fetch(`http://localhost:5000/api/children/${childId}`);
            if (!childRes.ok) throw new Error('Child not found');
            const childData = await childRes.json();
            setChild(childData);
            const growthRes = await fetch(`http://localhost:5000/api/growth/${childId}`);
            const growthRecords = await growthRes.json();
            setGrowthData(growthRecords);
        } catch (error) { history.push('/my-children'); }
    }, [childId, history]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleInputChange = (e) => setNewRecord(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDateChange = (date) => setNewRecord(prev => ({ ...prev, date }));

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formattedRecord = { ...newRecord, date: format(newRecord.date, 'yyyy/MM/dd') };
        try {
            await fetch(`http://localhost:5000/api/growth/${childId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formattedRecord) });
            fetchAllData();
            setIsModalOpen(false);
            setNewRecord({ date: new Date(), height: '', weight: '' });
        } catch (error) { alert(error.message); }
    };

    const handleDeleteRecord = async (date) => {
        if (window.confirm(`آیا از حذف رکورد تاریخ ${date} مطمئن هستید؟`)) {
            try {
                await fetch(`http://localhost:5000/api/growth/${childId}/${encodeURIComponent(date)}`, { method: 'DELETE' });
                fetchAllData();
            } catch (error) { alert(error.message); }
        }
    };

    if (!child) return <p>در حال بارگذاری...</p>;

    const latestRecord = growthData.length > 0 ? growthData[growthData.length - 1] : null;
    const heightStandard = child.gender === 'girl' ? heightForAgeGirls : heightForAgeBoys;
    const weightStandard = child.gender === 'girl' ? weightForAgeGirls : weightForAgeBoys;
    const genderText = child.gender === 'girl' ? 'دختران' : 'پسران';
    
    const processedGrowthData = growthData.map(record => {
        try {
            const ageInMonths = differenceInMonths(parseISO(record.date.replace(/\//g, '-')), parseISO(child.birthDate.replace(/\//g, '-')));
            return { month: ageInMonths, height: parseFloat(record.height), weight: parseFloat(record.weight) };
        } catch { return null; }
    }).filter(Boolean).sort((a, b) => a.month - b.month);

    let heightStatus, weightStatus;
    if (latestRecord) {
        const ageInMonths = differenceInMonths(new Date(latestRecord.date.replace(/\//g, '-')), new Date(child.birthDate.replace(/\//g, '-')));
        heightStatus = getGrowthStatus(ageInMonths, latestRecord.height, heightStandard);
        weightStatus = getGrowthStatus(ageInMonths, latestRecord.weight, weightStandard);
    } else {
        heightStatus = { text: '-', color: 'grey' };
        weightStatus = { text: '-', color: 'grey' };
    }

    return (
        <div className="growth-chart-page">
            <nav className="page-nav-final"><button onClick={() => history.push('/my-children')} className="back-btn-growth">&larr; بازگشت</button><h1>پرونده رشد: {child.name}</h1><div className="nav-placeholder"></div></nav>
            <div className="growth-content-container">
                <button onClick={() => setIsModalOpen(true)} className="add-record-btn">+ ثبت رکورد جدید</button>
                <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal" overlayClassName="overlay"><div className="modal-content"><h2>ثبت اطلاعات جدید</h2><form onSubmit={handleFormSubmit} className="growth-form-modal"><div className="form-group"><label>تاریخ</label><DatePicker selected={newRecord.date} onChange={handleDateChange} dateFormat="yyyy/MM/dd" /></div><div className="form-group"><label>قد (سانتی‌متر)</label><input type="number" name="height" value={newRecord.height} onChange={handleInputChange} required /></div><div className="form-group"><label>وزن (کیلوگرم)</label><input type="number" step="0.1" name="weight" value={newRecord.weight} onChange={handleInputChange} required /></div><div className="modal-actions"><button type="submit" className="btn-save">ثبت</button><button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">انصراف</button></div></form></div></Modal>
                <div className="summary-cards"><div className="summary-card"><span>آخرین قد</span><strong>{latestRecord ? `${latestRecord.height} cm` : 'N/A'}</strong><span className="status-label" style={{ backgroundColor: heightStatus.color }}>{heightStatus.text}</span></div><div className="summary-card"><span>آخرین وزن</span><strong>{latestRecord ? `${latestRecord.weight} kg` : 'N/A'}</strong><span className="status-label" style={{ backgroundColor: weightStatus.color }}>{weightStatus.text}</span></div></div>
                <div className="data-table-card"><button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className="toggle-history-btn">{isHistoryVisible ? 'مخفی کردن تاریخچه' : 'نمایش تاریخچه'}</button>{isHistoryVisible && (<table><thead><tr><th>تاریخ</th><th>قد (cm)</th><th>وزن (kg)</th><th>عملیات</th></tr></thead><tbody>{growthData.map((record, index) => (<tr key={index}><td>{record.date}</td><td>{record.height}</td><td>{record.weight}</td><td><button onClick={() => handleDeleteRecord(record.date)} className="btn-delete-record">حذف</button></td></tr>))}</tbody></table>)}</div>
                <div className="chart-card"><h2>نمودار قد به سن ({genderText})</h2><ResponsiveContainer width="100%" height={400}><LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="month" name="سن (ماه)" domain={['auto', 'auto']} allowDuplicatedCategory={false}/><YAxis label={{ value: 'قد (cm)', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend /><Line data={heightStandard} type="monotone" dataKey="P3" stroke="#ffc658" dot={false} name="صدک ۳" /><Line data={heightStandard} type="monotone" dataKey="P50" stroke="#4caf50" dot={false} name="میانه" /><Line data={heightStandard} type="monotone" dataKey="P97" stroke="#ffc658" dot={false} name="صدک ۹۷" /><Line data={processedGrowthData} type="monotone" dataKey="height" stroke="#8884d8" strokeWidth={3} name="قد کودک" connectNulls /></LineChart></ResponsiveContainer></div>
                <div className="chart-card"><h2>نمودار وزن به سن ({genderText})</h2><ResponsiveContainer width="100%" height={400}><LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="month" name="سن (ماه)" domain={['auto', 'auto']} allowDuplicatedCategory={false}/><YAxis label={{ value: 'وزن (kg)', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend /><Line data={weightStandard} type="monotone" dataKey="P3" stroke="#ffc658" dot={false} name="صدک ۳" /><Line data={weightStandard} type="monotone" dataKey="P50" stroke="#4caf50" dot={false} name="میانه" /><Line data={weightStandard} type="monotone" dataKey="P97" stroke="#ffc658" dot={false} name="صدک ۹۷" /><Line data={processedGrowthData} type="monotone" dataKey="weight" stroke="#82ca9d" strokeWidth={3} name="وزن کودک" connectNulls /></LineChart></ResponsiveContainer></div>
            </div>
        </div>
    );
};

export default GrowthChartPage;