import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './VaccinationPage.css';

const initialVaccines = [
    { name: 'ب ث ژ', age: 'تولد', done: false },
    { name: 'هپاتیت ب', age: 'تولد', done: false },
    { name: 'فلج اطفال', age: '2 ماهگی', done: false },
    { name: 'سه گانه', age: '2 ماهگی', done: false },
    { name: 'هموفیلوس آنفولانزا', age: '2 ماهگی', done: false },
    { name: 'هپاتیت ب', age: '2 ماهگی', done: false },
    { name: 'فلج اطفال', age: '4 ماهگی', done: false },
    { name: 'سه گانه', age: '4 ماهگی', done: false },
    { name: 'هموفیلوس آنفولانزا', age: '4 ماهگی', done: false },
    { name: 'فلج اطفال', age: '6 ماهگی', done: false },
    { name: 'سه گانه', age: '6 ماهگی', done: false },
    { name: 'هپاتیت ب', age: '6 ماهگی', done: false },
    { name: 'هموفیلوس آنفولانزا', age: '6 ماهگی', done: false },
    { name: 'MMR', age: '12 ماهگی', done: false },
    { name: 'واریسلا', age: '12 ماهگی', done: false },
    { name: 'سه گانه', age: '18 ماهگی', done: false },
    { name: 'فلج اطفال', age: '18 ماهگی', done: false },
    { name: 'MMR', age: '18 ماهگی', done: false },
    { name: 'سه گانه', age: '4-6 سالگی', done: false },
    { name: 'فلج اطفال', age: '4-6 سالگی', done: false },
];

const VaccinationPage = () => {
    const [vaccines, setVaccines] = useState(initialVaccines);

    const handleCheckboxChange = (index) => {
        const newVaccines = [...vaccines];
        newVaccines[index].done = !newVaccines[index].done;
        setVaccines(newVaccines);
    };

    const [uploadedCard, setUploadedCard] = useState(null);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/vaccination-card/1');
                if (response.ok) {
                    const data = await response.json();
                    setUploadedCard(data);
                }
            } catch (error) {
                console.error('Error fetching vaccination card:', error);
            }
        };
        fetchCard();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('vaccinationCard', file);

        try {
            const response = await fetch('http://localhost:5000/api/vaccination-card/1', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadedCard(data);
                console.log('File uploaded successfully:', data);
            } else {
                console.error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <main className="vaccination-container">
                <h1>جدول واکسیناسیون</h1>
                <table className="vaccination-table">
                    <thead>
                        <tr>
                            <th>نام واکسن</th>
                            <th>سن</th>
                            <th>انجام شد</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaccines.map((vaccine, index) => (
                            <tr key={index}>
                                <td>{vaccine.name}</td>
                                <td>{vaccine.age}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={vaccine.done}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="upload-section">
                    <h2>کارت واکسن</h2>
                    {uploadedCard ? (
                        <div>
                            <p>کارت واکسن قبلا بارگذاری شده است.</p>
                            <img src={`http://localhost:5000${uploadedCard.filePath}`} alt="Vaccination Card" style={{ maxWidth: '100%', marginTop: '10px' }} />
                        </div>
                    ) : (
                        <div>
                            <p>هنوز کارتی بارگذاری نشده است.</p>
                            <input type="file" onChange={handleFileUpload} />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VaccinationPage;
