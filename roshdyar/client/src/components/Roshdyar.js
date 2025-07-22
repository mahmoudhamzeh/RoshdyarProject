import React from 'react';
import { useHistory } from 'react-router-dom';
import './Roshdyar.css';

const Roshdyar = () => {
    const history = useHistory();

    const tiles = [
        { title: 'کودکان من', icon: '👶', path: '/my-children' },
        { title: 'بازی‌ها', icon: '🎮', path: '/games' },
        { title: 'فعالیت‌ها', icon: '🎨', path: '/activities' },
        { title: 'گزارش‌ها', icon: '📊', path: '/reports' },
    ];

    return (
        <div className="roshdyar-container">
            <h2>رشدیار</h2>
            <div className="roshdyar-tiles">
                {tiles.map(tile => (
                    <div key={tile.title} className="roshdyar-tile" onClick={() => history.push(tile.path)}>
                        <div className="roshdyar-tile-icon">{tile.icon}</div>
                        <div className="roshdyar-tile-title">{tile.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Roshdyar;
