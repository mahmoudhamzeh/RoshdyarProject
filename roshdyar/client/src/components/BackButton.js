import React from 'react';
import { useHistory } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ text }) => {
    const history = useHistory();

    return (
        <button className="back-button" onClick={() => history.goBack()}>
            <span className="arrow">➔</span>
            <span className="text">{text}</span>
        </button>
    );
};

export default BackButton;
