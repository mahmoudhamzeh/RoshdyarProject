import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './MyChildrenPage.css';

const MyChildrenPage = () => {
    const history = useHistory();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/children');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setChildren(data);
            } catch (error) {
                console.error("Failed to fetch children:", error);
                // Optionally, show an error message to the user
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const HomeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );

    return (
        <div className="children-page-final">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="home-btn-final">
                    <HomeIcon />
                    <span>صفحه اصلی</span>
                </button>
                <h1>کودکان من</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <div className="children-content-final">
                <button onClick={() => history.push('/add-child')} className="add-child-btn-final">+ افزودن کودک جدید</button>
                <div className="children-list-final">
                    {loading ? <p>در حال بارگذاری...</p> : 
                     children.length === 0 ? <p className="no-children-message">هنوز کودکی اضافه نشده است.</p> : 
                     children.map(child => (
                        <div key={child.id} className="child-card-final">
                            <img src={child.avatar} alt={child.name} className="child-avatar-final" />
                            <div className="child-info-final">
                                <h3>{child.name}</h3>
                                <p>{child.age}</p>
                            </div>
                            <button className="view-profile-btn-final">مشاهده</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyChildrenPage;