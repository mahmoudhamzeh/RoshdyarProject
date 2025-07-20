import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceTiles.css';

const services = [
    { name: 'کودکان من', icon: '👶', link: '/my-children' },
    { name: 'نمودار رشد', icon: '📈' },
    { name: 'واکسیناسیون', icon: '💉' },
    { name: 'مشاوره با متخصص', icon: '👨‍⚕️' },
    { name: 'مشاوره روانشناسی', icon: '🧠' },
    { name: 'آزمایش در محل', icon: '🔬' },
    { name: 'فروشگاه', icon: '🛒' },
    { name: 'سرگرمی', icon: '🎮' },
];

const ServiceTiles = () => {
    return (
        <div className="tiles-container">
            {services.map(service => (
                <Link to={service.link || '#'} key={service.name} className="tile-link">
                    <div className="tile">
                        <div className="tile-icon">{service.icon}</div>
                        <div className="tile-name">{service.name}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ServiceTiles;