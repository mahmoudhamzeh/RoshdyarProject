import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import './MyChildrenPage.css';

const MyChildrenPage = () => {
    const history = useHistory();
    const [children, setChildren] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const sortedChildren = React.useMemo(() => {
        let sortableItems = [...children];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [children, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const fetchChildren = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/children');
            const data = await response.json();
            setChildren(data);
        } catch (error) { console.error('Failed to fetch children:', error); }
    }, []);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    const handleDelete = async (childId) => {
        if (window.confirm('آیا از حذف این کودک مطمئن هستید؟')) {
            try {
                await fetch(`http://localhost:5000/api/children/${childId}`, { method: 'DELETE' });
                fetchChildren(); // Refresh list
            } catch (error) { alert('خطا در حذف کودک'); }
        }
    };

    const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);

    return (
        <div className="children-page-final">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="home-btn-final"><HomeIcon /><span>صفحه اصلی</span></button>
                <h1>کودکان من</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <div className="children-content-final">
                <button onClick={() => history.push('/add-child')} className="add-child-btn-final">+ افزودن کودک جدید</button>
                <div className="sort-options">
                    <button onClick={() => requestSort('name')}>مرتب‌سازی بر اساس نام</button>
                    <button onClick={() => requestSort('age')}>مرتب‌سازی بر اساس سن</button>
                </div>
                <div className="children-list-final">
                    {sortedChildren.length === 0 ? <p className="no-children-message">هنوز کودکی اضافه نشده است.</p> :
                     sortedChildren.map(child => {
                        const avatarUrl = child.avatar && child.avatar.startsWith('/uploads') ? `http://localhost:5000${child.avatar}` : (child.avatar || 'https://i.pravatar.cc/100');
                        return (
                            <div key={child.id} className="child-card-final">
                                <img src={avatarUrl} alt={child.name} className="child-avatar-final" />
                                <div className="child-info-final"><h3>{child.name}</h3><p>{child.age}</p></div>
                                <div className="child-card-actions">
                                    <button onClick={() => history.push(`/health-profile/${child.id}`)} className="view-profile-btn-final">مشاهده پرونده</button>
                                    <button onClick={() => history.push(`/edit-child/${child.id}`)} className="edit-btn-final">ویرایش</button>
                                    <button onClick={() => handleDelete(child.id)} className="delete-btn-final">حذف</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyChildrenPage;